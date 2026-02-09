"use client";

// SchedulePanel - Events timeline panel with progress
import React from "react";
import { CheckCircle, Clock, AlertTriangle, Calendar } from "lucide-react";
import type { Event, Submission } from "@/modules/event";

interface SchedulePanelProps {
  events: Event[];
  submissions: Submission[];
  onEventClick?: (event: Event) => void;
  onSubmit?: (eventId: number, submissionId: number) => void;
}

const getStatusConfig = (submission?: Submission) => {
  if (!submission) {
    return {
      icon: Clock,
      color: "text-gray-400",
      bgColor: "bg-gray-100 dark:bg-gray-700",
      label: "รอกำหนด",
    };
  }
  switch (submission.status) {
    case "APPROVED":
      return {
        icon: CheckCircle,
        color: "text-green-500",
        bgColor: "bg-green-100 dark:bg-green-900/30",
        label: "ผ่านแล้ว",
      };
    case "SUBMITTED":
      return {
        icon: Clock,
        color: "text-blue-500",
        bgColor: "bg-blue-100 dark:bg-blue-900/30",
        label: "รอตรวจ",
      };
    case "NEEDS_REVISION":
      return {
        icon: AlertTriangle,
        color: "text-yellow-500",
        bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
        label: "ต้องแก้ไข",
      };
    default:
      return {
        icon: Clock,
        color: "text-gray-400",
        bgColor: "bg-gray-100 dark:bg-gray-700",
        label: "ยังไม่ส่ง",
      };
  }
};

export const SchedulePanel: React.FC<SchedulePanelProps> = ({
  events,
  submissions,
  onEventClick,
  onSubmit,
}) => {
  const getSubmissionForEvent = (eventId: number) => {
    return submissions.find((s) => s.event_id === eventId);
  };

  // Calculate progress
  const approvedCount = submissions.filter(
    (s) => s.status === "APPROVED",
  ).length;
  const progressPercent =
    events.length > 0 ? Math.round((approvedCount / events.length) * 100) : 0;

  // Sort events by order
  const sortedEvents = [...events].sort((a, b) => a.order - b.order);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("th-TH", { day: "numeric", month: "short" });
  };

  if (events.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 h-full flex items-center justify-center">
        <div className="text-center">
          <Calendar
            size={40}
            className="text-gray-300 dark:text-gray-600 mx-auto mb-3"
          />
          <p className="text-gray-500 dark:text-gray-400">ยังไม่มีกำหนดการ</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 h-full flex flex-col">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
        📅 ตารางเวลา / กิจกรรม
      </h3>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            ความคืบหน้า
          </span>
          <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
            {progressPercent}%
          </span>
        </div>
        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Events Timeline */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {sortedEvents.map((event, index) => {
          const submission = getSubmissionForEvent(event.event_id);
          const {
            icon: Icon,
            color,
            bgColor,
            label,
          } = getStatusConfig(submission);
          const isLast = index === sortedEvents.length - 1;

          return (
            <div key={event.event_id} className="relative flex gap-3">
              {/* Timeline line */}
              {!isLast && (
                <div className="absolute left-3 top-8 w-0.5 h-full bg-gray-200 dark:bg-gray-700" />
              )}

              {/* Status icon */}
              <div
                className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center ${bgColor}`}
              >
                <Icon size={14} className={color} />
              </div>

              {/* Event card */}
              <button
                onClick={() => onEventClick?.(event)}
                className="flex-1 text-left p-2.5 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                      {event.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {event.dueDate && formatDate(event.dueDate)}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${bgColor} ${color}`}
                  >
                    {label}
                  </span>
                </div>

                {/* Submit button for pending items */}
                {submission && submission.status === "PENDING" && onSubmit && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSubmit(event.event_id, submission.submission_id);
                    }}
                    className="mt-2 w-full py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                  >
                    ส่งงาน
                  </button>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SchedulePanel;
