"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { api } from "@/lib/api";

export interface Section {
  section_id: number;
  section_code: string;
  course_type: string;
  study_type: string;
  term_id: number;
  Term?: {
    academicYear: number;
    semester: number;
  };
  _count?: {
    Team: number;
  };
}

export interface Event {
  event_id: number;
  name: string;
  type: string;
  description?: string;
  order: number;
  dueDate: string;
  section_id: number;
  createdAt: string;
  stats?: {
    totalTeams: number;
    submitted: number;
    approved: number;
    pending: number;
  };
  Submission?: Submission[];
}

export interface Submission {
  submission_id: number;
  event_id: number;
  team_id: number;
  status: "PENDING" | "SUBMITTED" | "NEEDS_REVISION" | "APPROVED";
  submittedAt?: string;
  file?: string;
  feedback?: string;
  approvedAt?: string;
  Team?: {
    team_id: number;
    name: string;
    groupNumber: string;
  };
}

export interface CreateEventData {
  name: string;
  type: string;
  description?: string;
  order: number;
  dueDate: string;
  section_id: number;
  createSubmissionsForAllTeams?: boolean;
}

export function useEventManagement() {
  const { data: session, status } = useSession();
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewingEvent, setViewingEvent] = useState<Event | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  const isAdmin = session?.user?.role === "ADMIN";

  // Fetch sections
  const fetchSections = useCallback(async () => {
    try {
      const data = await api.get("/api/sections");
      setSections(data);
      if (data.length > 0 && !selectedSection) {
        setSelectedSection(data[0]);
      }
    } catch (err) {
      console.error("Error fetching sections:", err);
      setError("ไม่สามารถดึงข้อมูล Section ได้");
    }
  }, [selectedSection]);

  // Fetch events for selected section
  const fetchEvents = useCallback(async () => {
    if (!selectedSection) return;

    setLoading(true);
    setError(null);
    try {
      const data = await api.get(
        `/api/events?section_id=${selectedSection.section_id}`,
      );
      setEvents(data);
    } catch (err) {
      console.error("Error fetching events:", err);
      setError("ไม่สามารถดึงข้อมูล Event ได้");
    } finally {
      setLoading(false);
    }
  }, [selectedSection]);

  // Create event
  const createEvent = async (eventData: CreateEventData) => {
    try {
      await api.post("/api/events", {
        ...eventData,
        createSubmissionsForAllTeams: true,
      });
      await fetchEvents();
      setIsCreateModalOpen(false);
      return { success: true };
    } catch (err: any) {
      console.error("Error creating event:", err);
      return { success: false, error: err.message || "สร้าง Event ไม่สำเร็จ" };
    }
  };

  // Update event
  const updateEvent = async (
    eventId: number,
    eventData: Partial<CreateEventData>,
  ) => {
    try {
      await api.patch(`/api/events/${eventId}`, eventData);
      await fetchEvents();
      setEditingEvent(null);
      return { success: true };
    } catch (err: any) {
      console.error("Error updating event:", err);
      return { success: false, error: err.message || "แก้ไข Event ไม่สำเร็จ" };
    }
  };

  // Delete event
  const deleteEvent = async (eventId: number) => {
    if (!confirm("ยืนยันการลบกำหนดการนี้?")) return { success: false };

    try {
      await api.delete(`/api/events/${eventId}`);
      await fetchEvents();
      return { success: true };
    } catch (err: any) {
      console.error("Error deleting event:", err);
      return { success: false, error: err.message || "ลบ Event ไม่สำเร็จ" };
    }
  };

  // Approve submission
  const approveSubmission = async (submissionId: number) => {
    try {
      await api.patch(`/api/submissions/${submissionId}/approve`, {});
      await fetchEvents();
      // Refresh viewing event
      if (viewingEvent) {
        const updatedEvent = events.find(
          (e) => e.event_id === viewingEvent.event_id,
        );
        if (updatedEvent) setViewingEvent(updatedEvent);
      }
      return { success: true };
    } catch (err: any) {
      console.error("Error approving submission:", err);
      return { success: false, error: err.message };
    }
  };

  // Reject submission
  const rejectSubmission = async (submissionId: number, feedback: string) => {
    try {
      await api.patch(`/api/submissions/${submissionId}/reject`, { feedback });
      await fetchEvents();
      return { success: true };
    } catch (err: any) {
      console.error("Error rejecting submission:", err);
      return { success: false, error: err.message };
    }
  };

  // Load data on mount
  useEffect(() => {
    if (status === "authenticated") {
      fetchSections();
    }
  }, [status, fetchSections]);

  // Reload events when section changes
  useEffect(() => {
    if (selectedSection) {
      fetchEvents();
    }
  }, [selectedSection, fetchEvents]);

  return {
    // Data
    sections,
    selectedSection,
    events,
    loading,
    error,
    isAdmin,

    // Modal states
    isCreateModalOpen,
    viewingEvent,
    editingEvent,

    // Actions
    setSelectedSection,
    setIsCreateModalOpen,
    setViewingEvent,
    setEditingEvent,
    createEvent,
    updateEvent,
    deleteEvent,
    approveSubmission,
    rejectSubmission,
    refresh: fetchEvents,
  };
}
