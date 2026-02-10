"use client";

import React from "react";
import { X, Clock, FileText, CheckCircle2 } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import type { Event, Submission } from "../hooks/useEventManagement";

interface EventDetailDrawerProps {
  event: Event;
  onClose: () => void;
  onApprove: (submissionId: number) => Promise<{ success: boolean }>;
  onReject: (
    submissionId: number,
    feedback: string,
  ) => Promise<{ success: boolean }>;
}

export const EventDetailDrawer: React.FC<EventDetailDrawerProps> = ({
  event,
  onClose,
  onApprove,
  onReject,
}) => {
  const submissions = event.Submission || [];

  const handleApprove = async (submissionId: number) => {
    await onApprove(submissionId);
  };

  const handleReject = async (submissionId: number) => {
    const feedback = prompt("กรุณาระบุเหตุผลในการขอแก้ไข:");
    if (feedback) {
      await onReject(submissionId, feedback);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/20 z-50 flex justify-end backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-start bg-slate-50">
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
            className="p-1 hover:bg-slate-200 rounded-full"
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
                  className="border border-slate-200 rounded-xl p-4 hover:border-blue-300 transition-colors bg-white"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-bold text-slate-800">
                        {sub.Team?.name || "ทีม"}
                      </p>
                      <p className="text-xs text-slate-400">
                        กลุ่ม: {sub.Team?.groupNumber}
                      </p>
                    </div>
                    <StatusBadge status={sub.status} />
                  </div>

                  {sub.file ? (
                    <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 p-2 rounded border border-blue-100 mb-3">
                      <FileText className="w-4 h-4" />
                      <span className="truncate flex-1">{sub.file}</span>
                    </div>
                  ) : (
                    <div className="text-sm text-slate-400 italic mb-3 pl-1">
                      ยังไม่ส่งไฟล์
                    </div>
                  )}

                  {sub.feedback && (
                    <div className="text-sm text-rose-600 bg-rose-50 p-2 rounded border border-rose-100 mb-3">
                      <span className="font-medium">Feedback:</span>{" "}
                      {sub.feedback}
                    </div>
                  )}

                  <div className="flex gap-2 justify-end border-t border-slate-100 pt-3">
                    {sub.status === "SUBMITTED" && (
                      <>
                        <button
                          onClick={() => handleApprove(sub.submission_id)}
                          className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(sub.submission_id)}
                          className="px-3 py-1.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded"
                        >
                          ขอแก้ไข
                        </button>
                      </>
                    )}
                    {sub.status === "APPROVED" && (
                      <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> ตรวจแล้ว
                      </span>
                    )}
                    {sub.status === "PENDING" && (
                      <span className="text-xs text-slate-400">
                        รอการส่งงาน
                      </span>
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
