"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { teamService } from "@/modules/team/services/teamService";
import { projectService } from "@/modules/team/services/projectService";

export interface SectionInfo {
  section_id: number;
  section_code: string;
  course_type: string;
  Term?: {
    term_id: number;
    semester: number;
    academicYear: number;
  };
}

export interface EventWithSection {
  event_id: number;
  name: string;
  type: string;
  dueDate?: string;
  order?: number;
  description?: string;
  Section?: SectionInfo;
}

export interface SubmissionWithEvent {
  submission_id: number;
  event_id: number;
  team_id: number;
  status: "PENDING" | "SUBMITTED" | "NEEDS_REVISION" | "APPROVED";
  submittedAt?: string;
  file?: string;
  feedback?: string;
  approvedAt?: string;
  createdAt?: string;
  Event?: EventWithSection;
  Team?: {
    team_id: number;
    name: string;
    groupNumber: string;
  };
}

export interface SectionGroup {
  section: SectionInfo;
  submissions: SubmissionWithEvent[];
  isCurrent: boolean;
}

export function useStudentEvents() {
  const { status } = useAuth();
  const [submissions, setSubmissions] = useState<SubmissionWithEvent[]>([]);
  const [sectionGroups, setSectionGroups] = useState<SectionGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teamId, setTeamId] = useState<number | null>(null);
  const [currentSectionId, setCurrentSectionId] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    try {
      // 1. Get user's team
      const team = await teamService.getMyTeam();
      if (!team) {
        setError("คุณยังไม่มีทีม กรุณาสร้างทีมก่อน");
        setLoading(false);
        return;
      }

      setTeamId(team.team_id);
      setCurrentSectionId(team.section_id);

      // 2. Get project for this team
      const projectData = await projectService.getProjectByTeamId(team.team_id);
      if (!projectData) {
        setError("ทีมของคุณยังไม่มีโครงงาน กรุณาสร้างหัวข้อโครงงานก่อน");
        setLoading(false);
        return;
      }

      // 3. Check if project is approved
      if (projectData.status !== "APPROVED") {
        setError("โครงงานของคุณยังไม่ได้รับการอนุมัติจากอาจารย์");
        setLoading(false);
        return;
      }

      // 4. Fetch all submissions for this team (includes events from all sections)
      const submissionsData = await api.get<SubmissionWithEvent[]>(
        `/submissions?team_id=${team.team_id}`,
      );

      setSubmissions(submissionsData || []);

      // 5. Group submissions by Section
      const grouped = groupBySection(submissionsData || [], team.section_id);
      setSectionGroups(grouped);

      setLoading(false);
    } catch (err: unknown) {
      console.error("Error fetching student events:", err);
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการโหลดข้อมูล");
      setLoading(false);
    }
  }, []);

  // Group submissions by section
  const groupBySection = (
    subs: SubmissionWithEvent[],
    currentSecId: number | null,
  ): SectionGroup[] => {
    const groups: Record<number, SectionGroup> = {};

    for (const sub of subs) {
      const section = sub.Event?.Section;
      if (!section) continue;

      if (!groups[section.section_id]) {
        groups[section.section_id] = {
          section,
          submissions: [],
          isCurrent: section.section_id === currentSecId,
        };
      }

      groups[section.section_id].submissions.push(sub);
    }

    // Sort by section_code, then by term
    return Object.values(groups).sort((a, b) => {
      // Current section first
      if (a.isCurrent && !b.isCurrent) return -1;
      if (!a.isCurrent && b.isCurrent) return 1;

      // Then by section_code
      return a.section.section_code.localeCompare(b.section.section_code);
    });
  };

  // Submit work
  const submitWork = async (submissionId: number, file?: string) => {
    try {
      await api.patch(`/submissions/${submissionId}/submit`, {
        file: file || null,
      });
      await fetchData();
      return { success: true };
    } catch (err: unknown) {
      console.error("Error submitting work:", err);
      return { success: false, error: err instanceof Error ? err.message : "Submit failed" };
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchData();
    }
  }, [status, fetchData]);

  // Helper: get submission by event_id
  const getSubmission = (eventId: number) => {
    return submissions.find((s) => s.event_id === eventId);
  };

  // Helper: get status by event_id
  const getEventStatus = (eventId: number) => {
    const sub = getSubmission(eventId);
    return sub?.status || "PENDING";
  };

  // Calculate total progress (approved / total)
  const approvedCount = submissions.filter(
    (s) => s.status === "APPROVED",
  ).length;
  const totalProgress =
    submissions.length > 0
      ? Math.round((approvedCount / submissions.length) * 100)
      : 0;

  // Find current event (first non-approved from current section)
  const currentSectionGroup = sectionGroups.find((g) => g.isCurrent);
  const currentEvent = currentSectionGroup?.submissions.find(
    (s) => s.status !== "APPROVED",
  )?.Event;

  // Flatten events for compatibility
  const events = submissions
    .filter((s) => s.Event)
    .map((s) => ({
      ...s.Event!,
      section_id: s.Event?.Section?.section_id || 0,
    }));

  return {
    submissions,
    sectionGroups,
    events,
    loading,
    error,
    teamId,
    currentSectionId,
    getSubmission,
    getEventStatus,
    totalProgress,
    currentEvent,
    submitWork,
    refresh: fetchData,
  };
}
