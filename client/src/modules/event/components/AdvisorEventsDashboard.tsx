"use client";

import React, { useState } from "react";
import {
  Loader2,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Users,
  CheckCircle,
  XCircle,
  X,
  MessageSquare,
  ExternalLink,
  Lock,
} from "lucide-react";
import { useAdvisorEvents } from "@/modules/event/hooks/useAdvisorEvents";
import type { SubmissionWithEvent } from "@/modules/event/hooks/useStudentEvents";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatThaiDate = (dateStr?: string) => {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear() + 543}`;
};

// ─── Status Badge ─────────────────────────────────────────────────────────────

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    APPROVED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    SUBMITTED: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    NEEDS_REVISION: "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400",
    PENDING: "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400",
  };
  const labels: Record<string, string> = {
    APPROVED: "อนุมัติแล้ว",
    SUBMITTED: "รอตรวจ",
    NEEDS_REVISION: "ต้องแก้ไข",
    PENDING: "ยังไม่ส่ง",
  };
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${styles[status] || styles.PENDING}`}>
      {labels[status] || status}
    </span>
  );
};

// ─── Advisor Doc Row ───────────────────────────────────────────────────────────
// Style เหมือน DocRow ของ StudentEventsPage แต่เพิ่ม approve/reject

const AdvisorDocRow = ({
  sub,
  index,
  onApprove,
  onReject,
}: {
  sub: SubmissionWithEvent;
  index: number;
  onApprove: () => void;
  onReject: () => void;
}) => {
  const isApproved = sub.status === "APPROVED";
  const isSubmitted = sub.status === "SUBMITTED";
  const isRevision = sub.status === "NEEDS_REVISION";

  return (
    <div className={`flex items-center gap-4 px-6 py-5 border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors
      ${isSubmitted ? "hover:bg-blue-50/40 dark:hover:bg-blue-900/10" : "hover:bg-gray-50/50 dark:hover:bg-gray-700/20"}`}
    >
      {/* Step number / check */}
      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0
        ${isApproved
          ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
          : "bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500"
        }`}
      >
        {isApproved ? <CheckCircle2 className="w-6 h-6" /> : index + 1}
      </div>

      {/* Event info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className={`text-base font-semibold ${isApproved ? "text-gray-400 line-through" : "text-gray-800 dark:text-gray-100"}`}>
            {sub.Event?.name || "—"}
          </p>
          {isRevision && <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />}
          {isSubmitted && (
            <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-full font-medium">
              รอตรวจ
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-0.5 text-sm text-gray-400 dark:text-gray-500 flex-wrap">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            ครบกำหนด: {formatThaiDate(sub.Event?.dueDate)}
          </span>
          {sub.submittedAt && (
            <span>• ส่งเมื่อ: {formatThaiDate(sub.submittedAt)}</span>
          )}
        </div>
        {isRevision && sub.feedback && (
          <p className="text-sm text-rose-500 mt-1 italic">"{sub.feedback}"</p>
        )}
      </div>

      {/* Status + file + actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <StatusBadge status={sub.status} />

        {sub.file && (
          <a
            href={sub.file}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
            title="ดูไฟล์"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        )}

        {isSubmitted && (
          <>
            <button
              onClick={onApprove}
              className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition"
              title="อนุมัติ"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
            <button
              onClick={onReject}
              className="p-2 bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition"
              title="ส่งคืนแก้ไข"
            >
              <X className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export const AdvisorEventsDashboard: React.FC = () => {
  const { projectGroups, loading, error, refresh } = useAdvisorEvents();

  // Project tab selection
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

  // Reject modal
  const [rejectTarget, setRejectTarget] = useState<number | null>(null);
  const [rejectFeedback, setRejectFeedback] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, message: msg });
    setTimeout(() => setToast(null), 4000);
  };

  // ── Loading ──
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // ── Error / No projects ──
  if (error || projectGroups.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <div className="text-center max-w-md">
          <Lock size={64} className="mx-auto text-gray-300 dark:text-gray-600 mb-6" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {error || "ยังไม่มีโครงงานที่ดูแล"}
          </h2>
        </div>
      </div>
    );
  }

  // ── Resolve selected project ──
  const group = projectGroups.find((g) => g.project_id === selectedProjectId) ?? projectGroups[0];

  // Filter เฉพาะ requireFile (บทที่/เอกสาร) — เหมือน StudentEventsPage
  const docSubmissions = group.submissions.filter((s) => s.Event?.requireFile === true);
  const approvedCount = docSubmissions.filter((s) => s.status === "APPROVED").length;
  const progress = docSubmissions.length > 0 ? Math.round((approvedCount / docSubmissions.length) * 100) : 0;

  // งานถัดไปที่รอตรวจ
  const nextPending = docSubmissions.find((s) => s.status === "SUBMITTED");

  // ── Actions ──
  const handleApprove = async (submissionId: number) => {
    const { api } = await import("@/lib/api");
    setActionLoading(true);
    try {
      await api.patch(`/submissions/${submissionId}/approve`, {});
      await refresh();
      showToast("success", "อนุมัติสำเร็จ!");
    } catch {
      showToast("error", "เกิดข้อผิดพลาด");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectTarget) return;
    const { api } = await import("@/lib/api");
    setActionLoading(true);
    try {
      await api.patch(`/submissions/${rejectTarget}/reject`, { feedback: rejectFeedback });
      await refresh();
      setRejectTarget(null);
      setRejectFeedback("");
      showToast("success", "ส่งคืนเรียบร้อย");
    } catch {
      showToast("error", "เกิดข้อผิดพลาด");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">

      {/* ── Header ── */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">ตรวจสอบเอกสาร</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-base">
          ตรวจและอนุมัติเอกสารของโครงงานที่ดูแล
        </p>
      </div>

      {/* ── Project Tabs (ถ้ามีหลาย project) ── */}
      {projectGroups.length > 1 && (
        <div className="flex gap-2 flex-wrap mb-6">
          {projectGroups.map((g) => (
            <button
              key={g.project_id}
              onClick={() => setSelectedProjectId(g.project_id)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${group.project_id === g.project_id
                  ? "bg-blue-600 text-white shadow"
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
            >
              กลุ่ม {g.groupNumber}
              <span className="ml-1.5 text-xs opacity-70">{g.section?.section_code}</span>
            </button>
          ))}
        </div>
      )}

      {/* ── Summary Row ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">

        {/* Progress Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 flex flex-col justify-between">
          <p className="text-sm font-medium text-gray-400 dark:text-gray-500 mb-3">ความคืบหน้า</p>
          <div>
            <p className="text-4xl font-bold text-gray-900 dark:text-white">
              {progress}<span className="text-xl text-gray-400">%</span>
            </p>
            <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full mt-3 overflow-hidden">
              <div
                className="h-2.5 rounded-full bg-emerald-500 transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-gray-400 mt-2">{approvedCount} / {docSubmissions.length} อนุมัติแล้ว</p>
          </div>
        </div>

        {/* Next pending card (gradient) — เหมือน student */}
        <div className="md:col-span-2 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <Users className="w-28 h-28" />
          </div>
          <div className="relative z-10">
            <span className="text-xs bg-white/20 px-3 py-1 rounded-full font-medium border border-white/10">
              {group.section?.section_code} • กลุ่ม {group.groupNumber}
            </span>
            <h2 className="text-2xl font-bold mt-3 mb-1 leading-tight">
              {nextPending ? nextPending.Event?.name : group.projectname}
            </h2>
            {nextPending ? (
              <p className="text-blue-100 flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4" />
                ครบกำหนด: {formatThaiDate(nextPending.Event?.dueDate)}
              </p>
            ) : (
              <p className="text-blue-100 text-sm">ตรวจงานครบทุกรายการแล้ว 🎉</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Document List ── */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <FileText className="w-5 h-5 text-blue-500" />
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">รายการเอกสาร</h2>
          <span className="ml-auto text-sm text-gray-400">{docSubmissions.length} รายการ</span>
        </div>

        {docSubmissions.length === 0 ? (
          <div className="py-16 text-center text-gray-400 dark:text-gray-500">
            <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-base">ยังไม่มีรายการเอกสาร</p>
          </div>
        ) : (
          docSubmissions.map((sub, i) => (
            <AdvisorDocRow
              key={sub.submission_id}
              sub={sub}
              index={i}
              onApprove={() => handleApprove(sub.submission_id)}
              onReject={() => { setRejectTarget(sub.submission_id); setRejectFeedback(""); }}
            />
          ))
        )}
      </div>

      {/* ── Reject Modal ── */}
      {rejectTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-rose-500" />
              ส่งคืนแก้ไข
            </h3>
            <textarea
              value={rejectFeedback}
              onChange={(e) => setRejectFeedback(e.target.value)}
              placeholder="ระบุสิ่งที่ต้องแก้ไข..."
              className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none h-32 text-sm"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => { setRejectTarget(null); setRejectFeedback(""); }}
                disabled={actionLoading}
                className="flex-1 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleRejectConfirm}
                disabled={actionLoading}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium flex items-center justify-center gap-2"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "ส่งคืน"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium
          ${toast.type === "success" ? "bg-emerald-500" : "bg-red-500"}`}
        >
          {toast.type === "success"
            ? <CheckCircle className="w-5 h-5 shrink-0" />
            : <XCircle className="w-5 h-5 shrink-0" />}
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default AdvisorEventsDashboard;
