"use client";

// EventCard - Single event card showing status and deadline
import React from "react";
import {
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  Upload,
} from "lucide-react";
import type { Event, Submission, SubmissionStatus } from "../types/event.types";
import {
  EVENT_TYPE_LABELS,
  SUBMISSION_STATUS_LABELS,
  SUBMISSION_STATUS_COLORS,
} from "../types/event.types";

interface EventCardProps {
  event: Event;
  submission?: Submission;
  onSubmit?: () => void;
  onViewDetails?: () => void;
  isStudent?: boolean;
}

const statusIcons: Record<SubmissionStatus, React.ReactNode> = {
  PENDING: <Clock size={20} className="text-gray-400" />,
  SUBMITTED: <Clock size={20} className="text-yellow-500" />,
  NEEDS_REVISION: <AlertCircle size={20} className="text-red-500" />,
  APPROVED: <CheckCircle size={20} className="text-green-500" />,
};

export const EventCard: React.FC<EventCardProps> = ({
  event,
  submission,
  onSubmit,
  onViewDetails,
  isStudent = false,
}) => {
  const status: SubmissionStatus = submission?.status || "PENDING";
  const isOverdue =
    new Date(event.dueDate) < new Date() && status === "PENDING";

  // Format date
  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div
      className={`
        bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border
        transition-all hover:shadow-md cursor-pointer
        ${status === "APPROVED" ? "border-green-200 dark:border-green-800" : ""}
        ${status === "NEEDS_REVISION" ? "border-red-200 dark:border-red-800" : ""}
        ${isOverdue ? "border-red-300 dark:border-red-700" : "border-gray-100 dark:border-gray-700"}
      `}
      onClick={onViewDetails}
    >
      {/* Header: Status Icon + Name */}
      <div className="flex items-start gap-3 mb-3">
        <div className="mt-0.5">{statusIcons[status]}</div>
        <div className="flex-1">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            {event.name}
          </h3>
          <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
            {EVENT_TYPE_LABELS[event.type]}
          </span>
        </div>
      </div>

      {/* Deadline */}
      <div
        className={`flex items-center gap-2 text-sm mb-3 ${
          isOverdue ? "text-red-500" : "text-gray-500 dark:text-gray-400"
        }`}
      >
        <Calendar size={14} />
        <span>กำหนดส่ง: {formatDate(event.dueDate)}</span>
        {isOverdue && (
          <span className="text-xs text-red-500 font-medium">(เลยกำหนด)</span>
        )}
      </div>

      {/* Status Badge */}
      <div className="flex items-center justify-between">
        <span
          className={`px-3 py-1 text-xs font-medium rounded-full ${SUBMISSION_STATUS_COLORS[status]}`}
        >
          {SUBMISSION_STATUS_LABELS[status]}
        </span>

        {/* Action Button */}
        {isStudent && (status === "PENDING" || status === "NEEDS_REVISION") && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSubmit?.();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <Upload size={14} />
            {status === "NEEDS_REVISION" ? "ส่งแก้ไข" : "ส่งงาน"}
          </button>
        )}

        {status === "SUBMITTED" && !isStudent && (
          <span className="text-xs text-yellow-600 dark:text-yellow-400">
            รอตรวจ
          </span>
        )}
      </div>

      {/* Feedback (if rejected) */}
      {status === "NEEDS_REVISION" && submission?.feedback && (
        <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <p className="text-xs text-red-600 dark:text-red-400">
            <strong>ข้อเสนอแนะ:</strong> {submission.feedback}
          </p>
        </div>
      )}

      {/* Approved info */}
      {status === "APPROVED" && submission?.approvedAt && (
        <div className="mt-3 text-xs text-green-600 dark:text-green-400">
          ✓ อนุมัติเมื่อ {formatDate(submission.approvedAt)}
        </div>
      )}
    </div>
  );
};

export default EventCard;
