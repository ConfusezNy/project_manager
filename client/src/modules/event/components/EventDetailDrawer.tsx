"use client";

import React, { useState } from "react";
import { X, Clock, FileText, CheckCircle2, Download } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import type { Event } from "../hooks/useEventManagement";

interface EventDetailModalProps {
  event: Event;
  onClose: () => void;
  onApprove: (submissionId: number) => Promise<{ success: boolean }>;
  onReject: (
    submissionId: number,
    feedback: string,
  ) => Promise<{ success: boolean }>;
}

/** แยกชื่อไฟล์จาก URL หรือ path */
const getFilename = (url: string): string => {
  try {
    return decodeURIComponent(url.split("/").pop() || url);
  } catch {
    return url.split("/").pop() || url;
  }
};

export const EventDetailDrawer: React.FC<EventDetailModalProps> = ({
  event,
  onClose,
  onApprove,
  onReject,
}) => {
  const submissions = event.Submission || [];

  // Reject inline state
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectFeedback, setRejectFeedback] = useState("");

  const handleApprove = async (submissionId: number) => {
    await onApprove(submissionId);
  };

  const handleStartReject = (submissionId: number) => {
    setRejectingId(submissionId);
    setRejectFeedback("");
  };

  const handleRejectConfirm = async () => {
    if (!rejectingId) return;
    await onReject(rejectingId, rejectFeedback);
    setRejectingId(null);
    setRejectFeedback("");
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-start bg-slate-50 rounded-t-2xl">
          <div>
            <h3 className="font-bold text-lg text-slate-800">{event.name}</h3>
            <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
              <Clock className="w-4 h-4" />
              Deadline:{" "}
              {new Date(event.dueDate).toLocaleDateString("th-TH", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-200 rounded-full transition"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-bold text-slate-700">สถานะการส่งรายทีม</h4>
            <span className="text-sm text-slate-500">
              ทั้งหมด {submissions.length} ทีม
            </span>
          </div>

          {submissions.length === 0 ? (
            <div className="text-center text-slate-400 py-8">
              ยังไม่มีทีมใน Event นี้
            </div>
          ) : (
            <div className="space-y-3">
              {submissions.map((sub) => (
                <div
                  key={sub.submission_id}
                  className="border border-slate-200 rounded-xl p-4 hover:border-blue-200 transition-colors bg-white"
                >
                  {/* Team Info + Status */}
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-bold text-slate-800">
                        กลุ่ม {sub.Team?.groupNumber || "—"}
                      </p>
                    </div>
                    <StatusBadge status={sub.status} />
                  </div>

                  {/* File Row */}
                  {sub.file ? (
                    <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 mb-3">
                      <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                      <span className="text-sm text-blue-700 truncate flex-1 font-medium">
                        {getFilename(sub.file)}
                      </span>
                      <a
                        href={sub.file}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition"
                        title="ดาวน์โหลดไฟล์"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  ) : (
                    <div className="text-sm text-slate-400 italic mb-3 pl-1">
                      ยังไม่ส่งไฟล์
                    </div>
                  )}

                  {/* Feedback */}
                  {sub.feedback && (
                    <div className="text-sm text-rose-600 bg-rose-50 p-2 rounded border border-rose-100 mb-3">
                      <span className="font-medium">Feedback:</span>{" "}
                      {sub.feedback}
                    </div>
                  )}

                  {/* Reject inline input */}
                  {rejectingId === sub.submission_id && (
                    <div className="mb-3">
                      <textarea
                        value={rejectFeedback}
                        onChange={(e) => setRejectFeedback(e.target.value)}
                        placeholder="ระบุเหตุผลหรือสิ่งที่ต้องแก้ไข..."
                        className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-800 resize-none h-24 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        autoFocus
                      />
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => setRejectingId(null)}
                          className="flex-1 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
                        >
                          ยกเลิก
                        </button>
                        <button
                          onClick={handleRejectConfirm}
                          disabled={!rejectFeedback.trim()}
                          className="flex-1 py-1.5 text-xs bg-rose-600 text-white rounded-lg hover:bg-rose-700 disabled:opacity-50"
                        >
                          ยืนยันส่งกลับ
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 justify-end border-t border-slate-100 pt-3">
                    {sub.status === "SUBMITTED" && rejectingId !== sub.submission_id && (
                      <>
                        <button
                          onClick={() => handleApprove(sub.submission_id)}
                          className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg transition"
                        >
                          อนุมัติ
                        </button>
                        <button
                          onClick={() => handleStartReject(sub.submission_id)}
                          className="px-3 py-1.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition"
                        >
                          ส่งกลับแก้ไข
                        </button>
                      </>
                    )}
                    {sub.status === "APPROVED" && (
                      <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> อนุมัติแล้ว
                      </span>
                    )}
                    {sub.status === "PENDING" && (
                      <span className="text-xs text-slate-400">รอการส่งงาน</span>
                    )}
                    {sub.status === "NEEDS_REVISION" && (
                      <span className="text-xs text-rose-500">รอแก้ไข</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
