// Event Service - API calls

import type {
  Event,
  Submission,
  CreateEventInput,
  UpdateEventInput,
} from "../types/event.types";

const API_BASE = "/api";

export const eventService = {
  // ===== Events =====

  /**
   * ดึงรายการ Events ของ Section
   */
  async getEventsBySection(sectionId: number): Promise<Event[]> {
    const res = await fetch(`${API_BASE}/events?section_id=${sectionId}`, {
      credentials: "include",
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Failed to fetch events");
    }

    return res.json();
  },

  /**
   * ดึง Event เดียว
   */
  async getEvent(eventId: number): Promise<Event> {
    const res = await fetch(`${API_BASE}/events/${eventId}`, {
      credentials: "include",
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Failed to fetch event");
    }

    return res.json();
  },

  /**
   * สร้าง Event ใหม่ (Admin only)
   */
  async createEvent(data: CreateEventInput): Promise<Event> {
    const res = await fetch(`${API_BASE}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Failed to create event");
    }

    return res.json();
  },

  /**
   * อัปเดต Event (Admin only)
   */
  async updateEvent(eventId: number, data: UpdateEventInput): Promise<Event> {
    const res = await fetch(`${API_BASE}/events/${eventId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Failed to update event");
    }

    return res.json();
  },

  /**
   * ลบ Event (Admin only)
   */
  async deleteEvent(eventId: number): Promise<void> {
    const res = await fetch(`${API_BASE}/events/${eventId}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Failed to delete event");
    }
  },

  // ===== Submissions =====

  /**
   * ดึง Submissions ของ Event หรือ Team
   */
  async getSubmissions(params: {
    eventId?: number;
    teamId?: number;
  }): Promise<Submission[]> {
    const searchParams = new URLSearchParams();
    if (params.eventId) searchParams.set("event_id", params.eventId.toString());
    if (params.teamId) searchParams.set("team_id", params.teamId.toString());

    const res = await fetch(`${API_BASE}/submissions?${searchParams}`, {
      credentials: "include",
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Failed to fetch submissions");
    }

    return res.json();
  },

  /**
   * นักศึกษาส่งงาน
   */
  async submitWork(submissionId: number, file?: string): Promise<Submission> {
    const res = await fetch(`${API_BASE}/submissions/${submissionId}/submit`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ file }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Failed to submit");
    }

    return res.json();
  },

  /**
   * อาจารย์อนุมัติงาน
   */
  async approveSubmission(
    submissionId: number,
    feedback?: string,
  ): Promise<Submission> {
    const res = await fetch(`${API_BASE}/submissions/${submissionId}/approve`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ feedback }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Failed to approve");
    }

    return res.json();
  },

  /**
   * อาจารย์ขอให้แก้ไขงาน
   */
  async rejectSubmission(
    submissionId: number,
    feedback: string,
  ): Promise<Submission> {
    const res = await fetch(`${API_BASE}/submissions/${submissionId}/reject`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ feedback }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Failed to reject");
    }

    return res.json();
  },
};
