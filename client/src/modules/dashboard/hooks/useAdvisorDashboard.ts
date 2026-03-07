"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

interface TeamWithProgress {
  team_id: number;
  project_id: number;
  name: string;
  groupNumber: string;
  projectTitle?: string;
  section_id: number;
  section_code: string;
  term?: { semester: number; academicYear: number };
  memberCount: number;
  approvedCount: number;
  submittedCount: number;
  totalEvents: number;
  progressPercent: number;
  // Task stats per project
  taskTodo: number;
  taskInProgress: number;
  taskInReview: number;
  taskDone: number;
}

interface PendingSubmission {
  submission_id: number;
  team_id: number;
  team_name: string;
  event_id: number;
  event_name: string;
  submittedAt?: string;
  file?: string;
}

interface UpcomingDeadline {
  event_id: number;
  name: string;
  dueDate: string;
  daysLeft: number;
  section_code: string;
}

export interface AdvisorCalendarEvent {
  event_id: number;
  name: string;
  dueDate: string;
  section_code: string;
  section_id: number;
  group_name: string;
  team_id: number;
  status: string; // status ของ submission: PENDING/SUBMITTED/APPROVED/NEEDS_REVISION
  submission_id: number;
  requireFile: boolean;
}

export function useAdvisorDashboard() {
  const { status } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [teams, setTeams] = useState<TeamWithProgress[]>([]);
  const [pendingSubmissions, setPendingSubmissions] = useState<PendingSubmission[]>([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<UpcomingDeadline[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<AdvisorCalendarEvent[]>([]);

  const [stats, setStats] = useState({
    teamsCount: 0,
    pendingCount: 0,
    upcomingCount: 0,
    completedTeams: 0,
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // GET /advisors/my-projects — โปรเจกต์ที่อาจารย์ดูแล
      // ข้อมูลที่ได้: project_id, projectname, status, team { team_id, groupNumber, section, members }
      const projectsData = await api.get<any[]>("/advisors/my-projects");

      if (!projectsData || projectsData.length === 0) {
        setTeams([]);
        setStats({ teamsCount: 0, pendingCount: 0, upcomingCount: 0, completedTeams: 0 });
        setLoading(false);
        return;
      }

      const processedTeams: TeamWithProgress[] = [];
      const allPending: PendingSubmission[] = [];
      const allDeadlines: UpcomingDeadline[] = [];
      const allCalendarEvents: AdvisorCalendarEvent[] = [];
      const now = new Date();

      for (const proj of projectsData) {
        const team = proj.team;
        if (!team) continue;

        // ดึง submissions ของทีมนี้
        const submissions = await api.get<any[]>(`/submissions?team_id=${team.team_id}`);

        // คำนวณ progress เฉพาะเอกสาร/บทที่ (requireFile === true)
        const docSubs = submissions?.filter((s) => s.Event?.requireFile === true) || [];
        const approvedCount = docSubs.filter((s) => s.status === "APPROVED").length;
        const submittedCount = docSubs.filter((s) => s.status === "SUBMITTED").length;
        const totalEvents = docSubs.length;
        const teamLabel = `กลุ่ม ${team.groupNumber}`;

        // ดึง tasks ของโครงงานนี้พร้อมกัน
        let taskTodo = 0, taskInProgress = 0, taskInReview = 0, taskDone = 0;
        try {
          const tasks = await api.get<any[]>(`/tasks?project_id=${proj.project_id}`);
          if (Array.isArray(tasks)) {
            taskTodo = tasks.filter((t) => t.status === "TODO").length;
            taskInProgress = tasks.filter((t) => t.status === "IN_PROGRESS").length;
            taskInReview = tasks.filter((t) => t.status === "IN_REVIEW").length;
            taskDone = tasks.filter((t) => t.status === "DONE").length;
          }
        } catch { /* ยังไม่มี tasks ข้ามไป */ }

        processedTeams.push({
          team_id: team.team_id,
          project_id: proj.project_id,
          name: teamLabel,
          groupNumber: team.groupNumber || "",
          projectTitle: proj.projectname || "",
          section_id: team.section?.section_id || 0,
          section_code: team.section?.section_code || "",
          term: team.section?.term,
          memberCount: team.members?.length || 0,
          approvedCount,
          submittedCount,
          totalEvents,
          progressPercent:
            totalEvents > 0 ? Math.round((approvedCount / totalEvents) * 100) : 0,
          taskTodo,
          taskInProgress,
          taskInReview,
          taskDone,
        });

        // เก็บ pending submissions (เฉพาะ requireFile + SUBMITTED)
        for (const sub of docSubs.filter((s) => s.status === "SUBMITTED")) {
          allPending.push({
            submission_id: sub.submission_id,
            team_id: team.team_id,
            team_name: teamLabel,
            event_id: sub.Event?.event_id,
            event_name: sub.Event?.name || "",
            submittedAt: sub.submittedAt,
            file: sub.file,
          });
        }

        // เก็บ deadline ที่ใกล้ถึง (14 วัน) + calendar events (ทุก submission)
        for (const sub of docSubs) {
          if (sub.Event?.dueDate && sub.status !== "APPROVED") {
            const dueDate = new Date(sub.Event.dueDate);
            const diffTime = dueDate.getTime() - now.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays >= 0 && diffDays <= 14) {
              allDeadlines.push({
                event_id: sub.Event.event_id,
                name: sub.Event.name,
                dueDate: sub.Event.dueDate,
                daysLeft: diffDays,
                section_code: team.section?.section_code || "",
              });
            }
          }
          // เก็บทุก event เข้า calendar (ไม่จำกัด 14 วัน)
          if (sub.Event?.dueDate) {
            allCalendarEvents.push({
              event_id: sub.Event.event_id,
              name: sub.Event.name,
              dueDate: sub.Event.dueDate,
              section_code: team.section?.section_code || "",
              section_id: team.section?.section_id || 0,
              group_name: teamLabel,
              team_id: team.team_id,
              status: sub.status,
              submission_id: sub.submission_id,
              requireFile: sub.Event.requireFile ?? false,
            });
          }
        }
      }

      // Dedupe + sort deadlines
      const uniqueDeadlines = allDeadlines
        .filter((d, i, arr) => arr.findIndex((x) => x.event_id === d.event_id) === i)
        .sort((a, b) => a.daysLeft - b.daysLeft)
        .slice(0, 5);

      setTeams(processedTeams);
      setPendingSubmissions(allPending);
      setUpcomingDeadlines(uniqueDeadlines);
      setCalendarEvents(allCalendarEvents);
      setStats({
        teamsCount: processedTeams.length,
        pendingCount: allPending.length,
        upcomingCount: uniqueDeadlines.length,
        completedTeams: processedTeams.filter((t) => t.progressPercent === 100).length,
      });

      setLoading(false);
    } catch (err: any) {
      console.error("Error fetching advisor dashboard:", err);
      setError(err.message || "เกิดข้อผิดพลาด");
      setLoading(false);
    }
  }, []);

  // Approve submission
  const approveSubmission = async (submissionId: number) => {
    try {
      await api.patch(`/submissions/${submissionId}/approve`, {});
      await fetchData();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  // Reject submission
  const rejectSubmission = async (submissionId: number, feedback: string) => {
    try {
      await api.patch(`/submissions/${submissionId}/reject`, { feedback });
      await fetchData();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchData();
    }
  }, [status, fetchData]);

  return {
    loading,
    error,
    teams,
    pendingSubmissions,
    upcomingDeadlines,
    calendarEvents,
    stats,
    approveSubmission,
    rejectSubmission,
    refresh: fetchData,
  };
}
