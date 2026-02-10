"use client";

import React from "react";
import {
  FileText,
  Users,
  ImageIcon,
  MessageSquare,
  Calendar,
  Presentation,
  Send,
} from "lucide-react";

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const styles: Record<string, string> = {
    APPROVED: "bg-emerald-100 text-emerald-700",
    SUBMITTED: "bg-blue-100 text-blue-700",
    PENDING: "bg-amber-100 text-amber-700",
    NEEDS_REVISION: "bg-rose-100 text-rose-700",
    MISSING: "bg-slate-100 text-slate-500",
    CLOSED: "bg-slate-200 text-slate-600",
    OPEN: "bg-blue-100 text-blue-700",
    UPCOMING: "bg-purple-100 text-purple-700",
  };

  const labels: Record<string, string> = {
    APPROVED: "อนุมัติแล้ว",
    SUBMITTED: "ส่งแล้ว",
    PENDING: "รอส่ง",
    NEEDS_REVISION: "แก้ไข",
    MISSING: "ยังไม่ส่ง",
  };

  return (
    <span
      className={`px-2 py-0.5 rounded text-xs font-bold ${styles[status] || "bg-gray-100"}`}
    >
      {labels[status] || status}
    </span>
  );
};

interface EventTypeBadgeProps {
  type: string;
}

export const EventTypeBadge: React.FC<EventTypeBadgeProps> = ({ type }) => {
  const config: Record<
    string,
    { icon: React.ReactNode; label: string; color: string }
  > = {
    DOCUMENT: {
      icon: <FileText className="w-3 h-3" />,
      label: "เอกสาร",
      color: "text-blue-600 bg-blue-50 border-blue-200",
    },
    PROGRESS_REPORT: {
      icon: <FileText className="w-3 h-3" />,
      label: "รายงานความก้าวหน้า",
      color: "text-teal-600 bg-teal-50 border-teal-200",
    },
    POSTER: {
      icon: <ImageIcon className="w-3 h-3" />,
      label: "โปสเตอร์",
      color: "text-purple-600 bg-purple-50 border-purple-200",
    },
    EXAM: {
      icon: <Users className="w-3 h-3" />,
      label: "สอบ",
      color: "text-red-600 bg-red-50 border-red-200",
    },
    SEMINAR: {
      icon: <Presentation className="w-3 h-3" />,
      label: "สัมมนา",
      color: "text-orange-600 bg-orange-50 border-orange-200",
    },
    PRESENTATION: {
      icon: <Presentation className="w-3 h-3" />,
      label: "นำเสนอ",
      color: "text-indigo-600 bg-indigo-50 border-indigo-200",
    },
    MEETING: {
      icon: <MessageSquare className="w-3 h-3" />,
      label: "ประชุม",
      color: "text-slate-600 bg-slate-50 border-slate-200",
    },
    PROPOSAL: {
      icon: <Send className="w-3 h-3" />,
      label: "ข้อเสนอโครงงาน",
      color: "text-emerald-600 bg-emerald-50 border-emerald-200",
    },
    FINAL_SUBMISSION: {
      icon: <Calendar className="w-3 h-3" />,
      label: "ส่งงานสุดท้าย",
      color: "text-amber-600 bg-amber-50 border-amber-200",
    },
  };

  const { icon, label, color } = config[type] || {
    icon: <FileText className="w-3 h-3" />,
    label: type,
    color: "text-slate-600 bg-slate-50 border-slate-200",
  };

  return (
    <div
      className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded border w-fit ${color}`}
    >
      {icon}
      {label}
    </div>
  );
};

// Event types list for dropdown
export const EVENT_TYPES = [
  { value: "DOCUMENT", label: "เอกสาร (Document)" },
  { value: "PROGRESS_REPORT", label: "รายงานความก้าวหน้า" },
  { value: "POSTER", label: "โปสเตอร์ (Poster)" },
  { value: "EXAM", label: "สอบ (Exam)" },
  { value: "SEMINAR", label: "สัมมนา (Seminar)" },
  { value: "PRESENTATION", label: "นำเสนอ (Presentation)" },
  { value: "MEETING", label: "ประชุม (Meeting)" },
  { value: "PROPOSAL", label: "ข้อเสนอโครงงาน (Proposal)" },
  { value: "FINAL_SUBMISSION", label: "ส่งงานสุดท้าย" },
];
