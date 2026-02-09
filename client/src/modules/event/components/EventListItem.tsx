"use client";

// EventListItem - Single event row in list view
import React from "react";
import { Calendar, Award, ChevronRight, AlertCircle } from "lucide-react";
import type { Event, Submission } from "../types/event.types";

interface EventListItemProps {
  event: Event;
  submission?: Submission;
  onClick?: () => void;
  isExpanded?: boolean;
}

const getStatusConfig = (submission?: Submission) => {
  if (!submission) {
    return {
      label: "รอกำหนด",
      color: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
    };
  }
  switch (submission.status) {
    case "APPROVED":
      return {
        label: "ผ่านแล้ว",
        color:
          "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      };
    case "SUBMITTED":
      return {
        label: "รอตรวจ",
        color:
          "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      };
    case "NEEDS_REVISION":
      return {
        label: "ต้องแก้ไข",
        color: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
      };
    case "PENDING":
    default:
      return {
        label: "ยังไม่ส่ง",
        color:
          "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
      };
  }
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear() + 543; // Buddhist year
  return `${day}/${month}/${year}`;
};

export const EventListItem: React.FC<EventListItemProps> = ({
  event,
  submission,
  onClick,
  isExpanded,
}) => {
  const { label, color } = getStatusConfig(submission);
  const isOverdue = submission?.status === "NEEDS_REVISION";

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4 hover:shadow-md transition-all group"
    >
      <div className="flex items-center justify-between gap-4">
        {/* Left: Event info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 truncate">
              {event.name}
            </h3>
            {isOverdue && (
              <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <Calendar size={14} />
              {formatDate(event.dueDate)}
            </span>
            {event.weight && (
              <span className="flex items-center gap-1">
                <Award size={14} />
                {event.weight}% คะแนน
              </span>
            )}
          </div>
        </div>

        {/* Right: Status + Arrow */}
        <div className="flex items-center gap-3">
          <span
            className={`px-3 py-1.5 rounded-full text-sm font-medium ${color}`}
          >
            {label}
          </span>
          <ChevronRight
            size={20}
            className={`text-gray-400 transition-transform ${
              isExpanded ? "rotate-90" : ""
            } group-hover:translate-x-1`}
          />
        </div>
      </div>
    </button>
  );
};

export default EventListItem;
