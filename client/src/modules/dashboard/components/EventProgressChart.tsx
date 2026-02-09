"use client";

// EventProgressChart - Horizontal bar chart showing event progress
import React from "react";
import { CheckCircle, Clock, AlertCircle, XCircle } from "lucide-react";
import type { Event, Submission } from "@/modules/event";

interface EventProgressChartProps {
  events: Event[];
  submissions: Submission[];
}

const getStatusInfo = (submission?: Submission) => {
  if (!submission) {
    return {
      percent: 0,
      color: "bg-gray-200 dark:bg-gray-700",
      icon: Clock,
      label: "รอกำหนด",
    };
  }
  switch (submission.status) {
    case "APPROVED":
      return {
        percent: 100,
        color: "bg-green-500",
        icon: CheckCircle,
        label: "ผ่านแล้ว",
      };
    case "SUBMITTED":
      return {
        percent: 75,
        color: "bg-blue-500",
        icon: Clock,
        label: "รอตรวจ",
      };
    case "NEEDS_REVISION":
      return {
        percent: 40,
        color: "bg-yellow-500",
        icon: AlertCircle,
        label: "ต้องแก้ไข",
      };
    case "PENDING":
    default:
      return {
        percent: 0,
        color: "bg-gray-200 dark:bg-gray-700",
        icon: Clock,
        label: "ยังไม่ส่ง",
      };
  }
};

export const EventProgressChart: React.FC<EventProgressChartProps> = ({
  events,
  submissions,
}) => {
  const getSubmissionForEvent = (eventId: number) => {
    return submissions.find((s) => s.event_id === eventId);
  };

  if (events.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 h-full flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">ยังไม่มีกำหนดการ</p>
      </div>
    );
  }

  // Sort by order
  const sortedEvents = [...events].sort((a, b) => a.order - b.order);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
        📊 ความคืบหน้าตามกำหนดการ
      </h3>

      <div className="space-y-3 max-h-56 overflow-y-auto pr-2">
        {sortedEvents.map((event) => {
          const submission = getSubmissionForEvent(event.event_id);
          const {
            percent,
            color,
            icon: Icon,
            label,
          } = getStatusInfo(submission);

          return (
            <div key={event.event_id} className="group">
              {/* Event name with icon */}
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm text-gray-700 dark:text-gray-300 truncate flex-1 pr-2">
                  {event.name}
                </span>
                <div className="flex items-center gap-1.5">
                  <Icon
                    size={14}
                    className={
                      percent === 100
                        ? "text-green-500"
                        : percent > 0
                          ? "text-yellow-500"
                          : "text-gray-400"
                    }
                  />
                  <span className="text-xs text-gray-500 dark:text-gray-400 w-16 text-right">
                    {label}
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${color}`}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-3 mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
          <span className="text-xs text-gray-500">ผ่าน</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
          <span className="text-xs text-gray-500">รอตรวจ</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
          <span className="text-xs text-gray-500">แก้ไข</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-full bg-gray-300 dark:bg-gray-600" />
          <span className="text-xs text-gray-500">รอส่ง</span>
        </div>
      </div>
    </div>
  );
};

export default EventProgressChart;
