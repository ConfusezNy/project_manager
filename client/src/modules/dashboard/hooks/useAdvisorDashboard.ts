"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

interface TeamWithProgress {
  team_id: number;
  name: string;
  groupNumber: string;
  projectTitle?: string;
  section_code: string;
  memberCount: number;
  approvedCount: number;
  submittedCount: number;
  totalEvents: number;
  progressPercent: number;
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

export function useAdvisorDashboard() {
  const { status } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [teams, setTeams] = useState<TeamWithProgress[]>([]);
  const [pendingSubmissions, setPendingSubmissions] = useState<
    PendingSubmission[]
  >([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<
    UpcomingDeadline[]
  >([]);

  const [stats, setStats] = useState({
    teamsCount: 0,
    pendingCount: 0,
    upcomingCount: 0,
    completedTeams: 0,
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      // Get advisor's teams
      const teamsData = await api.get<any[]>("/teams/advisor-teams");

      if (!teamsData || teamsData.length === 0) {
        setTeams([]);
        setStats({
          teamsCount: 0,
          pendingCount: 0,
          upcomingCount: 0,
          completedTeams: 0,
        });
        setLoading(false);
        return;
      }

      // Process teams with progress
      const processedTeams: TeamWithProgress[] = [];
      const allPending: PendingSubmission[] = [];
      const allDeadlines: UpcomingDeadline[] = [];
      const now = new Date();

      for (const team of teamsData) {
        // Get submissions for this team
        const submissions = await api.get<any[]>(
          `/submissions?team_id=${team.team_id}`,
        );

        const approvedCount =
          submissions?.filter((s) => s.status === "APPROVED").length || 0;
        const submittedCount =
          submissions?.filter((s) => s.status === "SUBMITTED").length || 0;
        const totalEvents = submissions?.length || 0;

        processedTeams.push({
          team_id: team.team_id,
          name: team.name,
          groupNumber: team.groupNumber || "",
          projectTitle:
            team.Project?.[0]?.nameTH || team.Project?.[0]?.nameEN || "",
          section_code: team.Section?.section_code || "",
          memberCount: team._count?.Teammember || team.Teammember?.length || 0,
          approvedCount,
          submittedCount,
          totalEvents,
          progressPercent:
            totalEvents > 0
              ? Math.round((approvedCount / totalEvents) * 100)
              : 0,
        });

        // Collect pending submissions
        for (const sub of submissions?.filter(
          (s) => s.status === "SUBMITTED",
        ) || []) {
          allPending.push({
            submission_id: sub.submission_id,
            team_id: team.team_id,
            team_name: team.name,
            event_id: sub.Event?.event_id,
            event_name: sub.Event?.name || "",
            submittedAt: sub.submittedAt,
            file: sub.file,
          });
        }

        // Collect upcoming deadlines
        for (const sub of submissions || []) {
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
                section_code: team.Section?.section_code || "",
              });
            }
          }
        }
      }

      // Sort and dedupe deadlines
      const uniqueDeadlines = allDeadlines
        .filter(
          (d, i, arr) => arr.findIndex((x) => x.event_id === d.event_id) === i,
        )
        .sort((a, b) => a.daysLeft - b.daysLeft)
        .slice(0, 5);

      setTeams(processedTeams);
      setPendingSubmissions(allPending);
      setUpcomingDeadlines(uniqueDeadlines);

      const completedTeams = processedTeams.filter(
        (t) => t.progressPercent === 100,
      ).length;

      setStats({
        teamsCount: processedTeams.length,
        pendingCount: allPending.length,
        upcomingCount: uniqueDeadlines.length,
        completedTeams,
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
    stats,
    approveSubmission,
    rejectSubmission,
    refresh: fetchData,
  };
}
