// Event Service - API calls (migrated to api wrapper for NestJS)
// เดิม: raw fetch("/api/*") → ใหม่: api wrapper ที่ auto-attach JWT

import { api } from "@/lib/api";
import type {
  Event,
  Submission,
  CreateEventInput,
  UpdateEventInput,
} from "../types/event.types";

export const eventService = {
  // ===== Events =====

  /**
   * ดึงรายการ Events ของ Section
   */
  async getEventsBySection(sectionId: number): Promise<Event[]> {
    return api.get<Event[]>(`/events?section_id=${sectionId}`);
  },

  /**
   * ดึง Event เดียว
   */
  async getEvent(eventId: number): Promise<Event> {
    return api.get<Event>(`/events/${eventId}`);
  },

  /**
   * สร้าง Event ใหม่ (Admin only)
   */
  async createEvent(data: CreateEventInput): Promise<Event> {
    return api.post<Event>("/events", data);
  },

  /**
   * อัปเดต Event (Admin only)
   */
  async updateEvent(eventId: number, data: UpdateEventInput): Promise<Event> {
    return api.put<Event>(`/events/${eventId}`, data);
  },

  /**
   * ลบ Event (Admin only)
   */
  async deleteEvent(eventId: number): Promise<void> {
    await api.delete(`/events/${eventId}`);
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

    return api.get<Submission[]>(`/submissions?${searchParams}`);
  },

  /**
   * นักศึกษาส่งงาน
   */
  async submitWork(submissionId: number, file?: string): Promise<Submission> {
    return api.patch<Submission>(`/submissions/${submissionId}/submit`, {
      file,
    });
  },

  /**
   * อาจารย์อนุมัติงาน
   */
  async approveSubmission(
    submissionId: number,
    feedback?: string,
  ): Promise<Submission> {
    return api.patch<Submission>(`/submissions/${submissionId}/approve`, {
      feedback,
    });
  },

  /**
   * อาจารย์ขอให้แก้ไขงาน
   */
  async rejectSubmission(
    submissionId: number,
    feedback: string,
  ): Promise<Submission> {
    return api.patch<Submission>(`/submissions/${submissionId}/reject`, {
      feedback,
    });
  },
};
