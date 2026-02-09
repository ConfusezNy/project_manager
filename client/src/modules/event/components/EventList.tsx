"use client";

// EventList - List of events with progress bar
import React from "react";
import { EventCard } from "./EventCard";
import type { Event, Submission } from "../types/event.types";

interface EventListProps {
  events: Event[];
  submissions?: Submission[];
  onSubmit?: (eventId: number, submissionId: number) => void;
  onViewDetails?: (event: Event) => void;
  isStudent?: boolean;
  loading?: boolean;
}

export const EventList: React.FC<EventListProps> = ({
  events,
  submissions = [],
  onSubmit,
  onViewDetails,
  isStudent = false,
  loading = false,
}) => {
  // Calculate progress
  const totalEvents = events.length;
  const approvedCount = submissions.filter(
    (s) => s.status === "APPROVED",
  ).length;
  const progressPercent =
    totalEvents > 0 ? Math.round((approvedCount / totalEvents) * 100) : 0;

  // Get submission for each event
  const getSubmissionForEvent = (eventId: number) => {
    return submissions.find((s) => s.event_id === eventId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-gray-500 dark:text-gray-400">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">ยังไม่มีกำหนดการ</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            ความคืบหน้า
          </h3>
          <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
            {progressPercent}%
          </span>
        </div>
        <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          ผ่านแล้ว {approvedCount} / {totalEvents} รายการ
        </p>
      </div>

      {/* Event Cards */}
      <div className="space-y-4">
        {events.map((event) => {
          const submission = getSubmissionForEvent(event.event_id);
          return (
            <EventCard
              key={event.event_id}
              event={event}
              submission={submission}
              isStudent={isStudent}
              onSubmit={() =>
                submission &&
                onSubmit?.(event.event_id, submission.submission_id)
              }
              onViewDetails={() => onViewDetails?.(event)}
            />
          );
        })}
      </div>
    </div>
  );
};

export default EventList;
