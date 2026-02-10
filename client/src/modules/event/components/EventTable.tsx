"use client";

import React, { useState } from "react";
import {
  Calendar,
  Eye,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronRight,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  FileText,
} from "lucide-react";
import { EventTypeBadge } from "./StatusBadge";
import type { Event } from "../hooks/useEventManagement";

interface EventTableProps {
  events: Event[];
  onView: (event: Event) => void;
  onEdit: (event: Event) => void;
  onDelete: (eventId: number) => void;
  onApprove?: (submissionId: number) => void;
  onReject?: (submissionId: number) => void;
  readOnly?: boolean;
}

// Status Badge Component
const SubmissionStatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case "APPROVED":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700">
          <CheckCircle className="w-3 h-3" /> อนุมัติ
        </span>
      );
    case "SUBMITTED":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
          <Clock className="w-3 h-3" /> รอตรวจ
        </span>
      );
    case "REVISION_REQUESTED":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-700">
          <XCircle className="w-3 h-3" /> ส่งกลับ
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-500">
          <AlertCircle className="w-3 h-3" /> ยังไม่ส่ง
        </span>
      );
  }
};

// Expandable Event Row Component
const ExpandableEventRow = ({
  event,
  index,
  onView,
  onEdit,
  onDelete,
  onApprove,
  onReject,
  readOnly,
}: {
  event: Event;
  index: number;
  onView: (event: Event) => void;
  onEdit: (event: Event) => void;
  onDelete: (eventId: number) => void;
  onApprove?: (submissionId: number) => void;
  onReject?: (submissionId: number) => void;
  readOnly?: boolean;
}) => {
  const [expanded, setExpanded] = useState(false);

  const stats = event.stats || {
    totalTeams: 0,
    submitted: 0,
    approved: 0,
    pending: 0,
  };
  const progressPercent =
    stats.totalTeams > 0
      ? Math.round((stats.submitted / stats.totalTeams) * 100)
      : 0;
  const isComplete =
    stats.submitted === stats.totalTeams && stats.totalTeams > 0;

  const submissions = event.Submission || [];

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
      year: "2-digit",
    });
  };

  return (
    <>
      {/* Main Row */}
      <tr
        className="hover:bg-slate-50/80 transition group cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <td className="px-6 py-4 text-center">
          <div className="flex items-center justify-center gap-2">
            {expanded ? (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-slate-400" />
            )}
            <span className="text-slate-400 font-medium">
              {event.order || index + 1}
            </span>
          </div>
        </td>
        <td className="px-6 py-4">
          <p className="font-bold text-slate-800 text-sm">{event.name}</p>
          {event.description && (
            <p className="text-xs text-slate-400 mt-0.5 truncate max-w-xs">
              {event.description}
            </p>
          )}
        </td>
        <td className="px-6 py-4">
          <EventTypeBadge type={event.type} />
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Calendar className="w-4 h-4 text-slate-400" />
            {formatDate(event.dueDate)}
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="flex justify-between text-xs mb-1.5 font-medium">
            <span
              className={isComplete ? "text-emerald-600" : "text-slate-600"}
            >
              {stats.approved}/{stats.totalTeams} ผ่าน
            </span>
            {stats.pending > 0 && (
              <span className="text-blue-600">{stats.pending} รอตรวจ</span>
            )}
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all ${
                isComplete ? "bg-emerald-500" : "bg-blue-500"
              }`}
              style={{
                width: `${stats.totalTeams > 0 ? (stats.approved / stats.totalTeams) * 100 : 0}%`,
              }}
            />
          </div>
        </td>
        <td
          className="px-6 py-4 text-right"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onView(event)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
              title="ดูรายละเอียดการส่ง"
            >
              <Eye className="w-4 h-4" />
            </button>
            {!readOnly && (
              <>
                <button
                  onClick={() => onEdit(event)}
                  className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
                  title="แก้ไข"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(event.event_id)}
                  className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"
                  title="ลบ"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </td>
      </tr>

      {/* Expanded Submissions */}
      {expanded && (
        <tr>
          <td colSpan={6} className="bg-slate-50/50 px-6 py-0">
            <div className="py-3 pl-8 border-l-2 border-blue-200 ml-4">
              {submissions.length === 0 ? (
                <p className="text-sm text-slate-400 py-2">
                  ยังไม่มีการส่งงานในกำหนดการนี้
                </p>
              ) : (
                <div className="space-y-2">
                  {submissions.map((sub: any) => (
                    <div
                      key={sub.submission_id}
                      className="flex items-center justify-between bg-white rounded-lg px-4 py-2.5 border border-slate-100 hover:border-slate-200 transition"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-slate-400 w-12 font-mono">
                          {sub.Team?.groupNumber || "-"}
                        </span>
                        <span className="font-medium text-slate-800 text-sm">
                          {sub.Team?.name || "ทีม"}
                        </span>
                        <SubmissionStatusBadge status={sub.status} />
                        {sub.submittedAt && (
                          <span className="text-xs text-slate-400">
                            {formatDate(sub.submittedAt)}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {/* View File */}
                        {sub.file && (
                          <a
                            href={sub.file}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                            title="ดูไฟล์"
                          >
                            <FileText className="w-4 h-4" />
                          </a>
                        )}

                        {/* Actions for pending submissions */}
                        {sub.status === "SUBMITTED" &&
                          onApprove &&
                          onReject && (
                            <>
                              <button
                                onClick={() => onApprove(sub.submission_id)}
                                className="px-2.5 py-1 text-xs font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded-md transition"
                              >
                                อนุมัติ
                              </button>
                              <button
                                onClick={() => onReject(sub.submission_id)}
                                className="px-2.5 py-1 text-xs font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-md transition"
                              >
                                ส่งกลับ
                              </button>
                            </>
                          )}

                        {/* Show feedback for rejected */}
                        {sub.status === "REVISION_REQUESTED" &&
                          sub.feedback && (
                            <span
                              className="text-xs text-red-500 max-w-[150px] truncate"
                              title={sub.feedback}
                            >
                              💬 {sub.feedback}
                            </span>
                          )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

export const EventTable: React.FC<EventTableProps> = ({
  events,
  onView,
  onEdit,
  onDelete,
  onApprove,
  onReject,
  readOnly = false,
}) => {
  if (events.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
        <p className="text-slate-400 text-lg">ยังไม่มีกำหนดการใน Section นี้</p>
        <p className="text-slate-400 text-sm mt-1">
          กดปุ่ม "สร้างกำหนดการใหม่" เพื่อเริ่มต้น
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b border-slate-200">
          <tr>
            <th className="px-6 py-4 w-20 text-center">#</th>
            <th className="px-6 py-4">ชื่อกำหนดการ</th>
            <th className="px-6 py-4">ประเภท</th>
            <th className="px-6 py-4">Deadline</th>
            <th className="px-6 py-4 w-48">สถานะการส่ง</th>
            <th className="px-6 py-4 text-right">จัดการ</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {events.map((event, index) => (
            <ExpandableEventRow
              key={event.event_id}
              event={event}
              index={index}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
              onApprove={onApprove}
              onReject={onReject}
              readOnly={readOnly}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};
