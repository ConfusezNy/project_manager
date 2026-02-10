"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { api } from "@/lib/api";

interface TeamSubmission {
  submission_id: number;
  team_id: number;
  team_name: string;
  groupNumber: string;
  status: "NOT_SUBMITTED" | "SUBMITTED" | "APPROVED" | "REVISION_REQUESTED";
  submittedAt?: string;
  file?: string;
  feedback?: string;
}

interface EventWithSubmissions {
  event_id: number;
  name: string;
  type: string;
  order: number;
  dueDate?: string;
  section_id: number;
  submissions: TeamSubmission[];
  approvedCount: number;
  submittedCount: number;
  totalTeams: number;
}

interface SectionWithEvents {
  section_id: number;
  section_code: string;
  course_type: string;
  term_id: number;
  events: EventWithSubmissions[];
}

export function useAdminSubmissions() {
  const { status } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sections, setSections] = useState<SectionWithEvents[]>([]);
  const [selectedSection, setSelectedSection] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch terms to find current term
      const terms = await api.get<any[]>("/api/terms");
      const now = new Date();
      const currentTerm = terms?.find((t) => {
        const start = new Date(t.startDate);
        const end = new Date(t.endDate);
        return now >= start && now <= end;
      });

      // Fetch all sections
      const allSections = await api.get<any[]>("/api/sections");

      // Filter by current term
      const filteredSections = currentTerm
        ? allSections?.filter((s) => s.term_id === currentTerm.term_id)
        : allSections;

      const result: SectionWithEvents[] = [];

      for (const section of filteredSections || []) {
        try {
          // Fetch events for this section
          const events = await api.get<any[]>(
            `/api/events?section_id=${section.section_id}`,
          );

          // Get teams in this section
          const teams = section.Team || [];

          const eventsWithSubmissions: EventWithSubmissions[] = [];

          for (const event of events || []) {
            const submissions: TeamSubmission[] = [];
            let approvedCount = 0;
            let submittedCount = 0;

            // For each team, find their submission for this event
            for (const team of teams) {
              const existingSub = event.Submission?.find(
                (s: any) => s.team_id === team.team_id,
              );

              if (existingSub) {
                if (existingSub.status === "APPROVED") approvedCount++;
                if (existingSub.status === "SUBMITTED") submittedCount++;

                submissions.push({
                  submission_id: existingSub.submission_id,
                  team_id: team.team_id,
                  team_name: team.name,
                  groupNumber: team.groupNumber || "",
                  status: existingSub.status,
                  submittedAt: existingSub.submittedAt,
                  file: existingSub.file,
                  feedback: existingSub.feedback,
                });
              } else {
                // Team hasn't submitted yet
                submissions.push({
                  submission_id: 0,
                  team_id: team.team_id,
                  team_name: team.name,
                  groupNumber: team.groupNumber || "",
                  status: "NOT_SUBMITTED",
                });
              }
            }

            // Sort by group number
            submissions.sort((a, b) =>
              a.groupNumber.localeCompare(b.groupNumber),
            );

            eventsWithSubmissions.push({
              event_id: event.event_id,
              name: event.name,
              type: event.type,
              order: event.order,
              dueDate: event.dueDate,
              section_id: section.section_id,
              submissions,
              approvedCount,
              submittedCount,
              totalTeams: teams.length,
            });
          }

          // Sort events by order
          eventsWithSubmissions.sort((a, b) => a.order - b.order);

          result.push({
            section_id: section.section_id,
            section_code: section.section_code,
            course_type: section.course_type,
            term_id: section.term_id,
            events: eventsWithSubmissions,
          });
        } catch (err) {
          console.error(
            `Error fetching events for section ${section.section_id}:`,
            err,
          );
        }
      }

      setSections(result);

      // Auto-select first section
      if (result.length > 0 && !selectedSection) {
        setSelectedSection(result[0].section_id);
      }

      setLoading(false);
    } catch (err: any) {
      console.error("Error fetching admin submissions:", err);
      setError(err.message || "เกิดข้อผิดพลาด");
      setLoading(false);
    }
  }, [selectedSection]);

  // Approve submission
  const approveSubmission = async (submissionId: number) => {
    try {
      await api.patch(`/api/submissions/${submissionId}/approve`, {});
      await fetchData();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  // Reject/Request revision
  const rejectSubmission = async (submissionId: number, feedback: string) => {
    try {
      await api.patch(`/api/submissions/${submissionId}/reject`, { feedback });
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

  // Get current section data
  const currentSection = sections.find((s) => s.section_id === selectedSection);

  return {
    loading,
    error,
    sections,
    currentSection,
    selectedSection,
    setSelectedSection,
    approveSubmission,
    rejectSubmission,
    refresh: fetchData,
  };
}
