"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

interface DashboardStats {
  sectionsCount: number;
  teamsCount: number;
  usersCount: number;
  eventsCount: number;
  pendingSubmissions: number;
  approvedSubmissions: number;
  totalSubmissions: number;
}

interface SectionProgress {
  section_id: number;
  section_code: string;
  course_type: string;
  teamsCount: number;
  submittedCount: number;
  approvedCount: number;
  totalSubmissions: number;
}

interface UpcomingDeadline {
  event_id: number;
  name: string;
  type: string;
  dueDate: string;
  section_code: string;
  daysLeft: number;
}

interface RecentActivity {
  id: number;
  type: "user_signup" | "team_created" | "submission" | "approval";
  description: string;
  time: string;
}

export function useAdminDashboard() {
  const { status } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [stats, setStats] = useState<DashboardStats>({
    sectionsCount: 0,
    teamsCount: 0,
    usersCount: 0,
    eventsCount: 0,
    pendingSubmissions: 0,
    approvedSubmissions: 0,
    totalSubmissions: 0,
  });

  const [sectionProgress, setSectionProgress] = useState<SectionProgress[]>([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<
    UpcomingDeadline[]
  >([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>(
    [],
  );

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch all terms to find current term
      const terms = await api.get<any[]>("/terms");
      const now = new Date();

      // Find current term (where now is between startDate and endDate)
      const currentTerm = terms?.find((t) => {
        const start = new Date(t.startDate);
        const end = new Date(t.endDate);
        return now >= start && now <= end;
      });

      // Fetch sections with team count
      const allSections = await api.get<any[]>("/sections");

      // Filter sections by current term only
      const sections = currentTerm
        ? allSections?.filter((s) => s.term_id === currentTerm.term_id)
        : allSections;

      // Fetch all users
      const users = await api.get<any[]>("/users");

      // Calculate stats (use all sections for total count)
      const sectionsCount = allSections?.length || 0;
      const teamsCount =
        sections?.reduce((acc, sec) => acc + (sec._count?.Team || 0), 0) || 0;
      const usersCount = users?.length || 0;

      // Fetch events for each section and calculate stats
      let pendingSubmissions = 0;
      let approvedSubmissions = 0;
      let totalSubmissions = 0;
      let eventsCount = 0;

      // Section progress
      const progressData: SectionProgress[] = [];
      const allDeadlines: UpcomingDeadline[] = [];

      for (const section of sections || []) {
        try {
          // Fetch events for this section
          const sectionEvents = await api.get<any[]>(
            `/events?section_id=${section.section_id}`,
          );

          eventsCount += sectionEvents?.length || 0;

          let sectionSubmitted = 0;
          let sectionApproved = 0;
          let sectionTotal = 0;

          for (const event of sectionEvents || []) {
            const subs = event.Submission || [];
            sectionTotal += subs.length;
            sectionSubmitted += subs.filter(
              (s: any) => s.status === "SUBMITTED",
            ).length;
            sectionApproved += subs.filter(
              (s: any) => s.status === "APPROVED",
            ).length;
            pendingSubmissions += subs.filter(
              (s: any) => s.status === "SUBMITTED",
            ).length;
            approvedSubmissions += subs.filter(
              (s: any) => s.status === "APPROVED",
            ).length;
            totalSubmissions += subs.length;

            // Collect deadlines
            if (event.dueDate) {
              const dueDate = new Date(event.dueDate);
              const diffTime = dueDate.getTime() - now.getTime();
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

              if (diffDays >= 0 && diffDays <= 14) {
                allDeadlines.push({
                  event_id: event.event_id,
                  name: event.name,
                  type: event.type,
                  dueDate: event.dueDate,
                  section_code: section.section_code || "",
                  daysLeft: diffDays,
                });
              }
            }
          }

          progressData.push({
            section_id: section.section_id,
            section_code: section.section_code,
            course_type: section.course_type,
            teamsCount: section._count?.Team || 0,
            submittedCount: sectionSubmitted,
            approvedCount: sectionApproved,
            totalSubmissions: sectionTotal,
          });
        } catch (err) {
          // Skip section if events fetch fails
          console.error(
            `Error fetching events for section ${section.section_id}:`,
            err,
          );
        }
      }

      setStats({
        sectionsCount,
        teamsCount,
        usersCount,
        eventsCount,
        pendingSubmissions,
        approvedSubmissions,
        totalSubmissions,
      });

      setSectionProgress(progressData);

      // Sort and limit deadlines
      allDeadlines.sort((a, b) => a.daysLeft - b.daysLeft);
      setUpcomingDeadlines(allDeadlines.slice(0, 5));

      // Recent activities: ดึง submissions ล่าสุดจาก API (Admin เห็นทั้งหมด)
      try {
        const recentSubs = await api.get<any[]>("/submissions");
        const sorted = (recentSubs || [])
          .filter((s) => s.status === "SUBMITTED" || s.status === "APPROVED" || s.status === "NEEDS_REVISION")
          .sort((a, b) => new Date(b.submittedAt || b.createdAt).getTime() - new Date(a.submittedAt || a.createdAt).getTime())
          .slice(0, 5);

        const activities: RecentActivity[] = sorted.map((sub, i) => {
          const teamLabel = sub.Team?.groupNumber ? `กลุ่ม ${sub.Team.groupNumber}` : `ทีม ${sub.team_id}`;
          const eventLabel = sub.Event?.name || "งาน";
          let description = "";
          let type: RecentActivity["type"] = "submission";

          if (sub.status === "APPROVED") {
            type = "approval";
            description = `ผ่านแล้ว: ${teamLabel} — ${eventLabel}`;
          } else if (sub.status === "SUBMITTED") {
            type = "submission";
            description = `${teamLabel} ส่ง ${eventLabel}`;
          } else {
            type = "submission";
            description = `ส่งคืนแก้ไข: ${teamLabel} — ${eventLabel}`;
          }

          const timeAgo = sub.submittedAt || sub.createdAt;
          const diffMs = Date.now() - new Date(timeAgo).getTime();
          const diffH = Math.floor(diffMs / 3600000);
          const diffD = Math.floor(diffMs / 86400000);
          const timeLabel = diffD > 0 ? `${diffD} วันที่แล้ว` : diffH > 0 ? `${diffH} ชม.ที่แล้ว` : "เมื่อกี้";

          return { id: sub.submission_id ?? i, type, description, time: timeLabel };
        });
        setRecentActivities(activities);
      } catch {
        setRecentActivities([]);
      }


      setLoading(false);
    } catch (err: any) {
      console.error("Error fetching admin dashboard:", err);
      setError(err.message || "เกิดข้อผิดพลาด");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      fetchDashboardData();
    }
  }, [status, fetchDashboardData]);

  // Calculate overall progress percentage
  const overallProgress =
    stats.totalSubmissions > 0
      ? Math.round((stats.approvedSubmissions / stats.totalSubmissions) * 100)
      : 0;

  return {
    loading,
    error,
    stats,
    sectionProgress,
    upcomingDeadlines,
    recentActivities,
    overallProgress,
    refresh: fetchDashboardData,
  };
}
