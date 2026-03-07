"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Loader2,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Users,
  ExternalLink,
  Lock,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
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
    APPROVED: "ผ่านแล้ว",
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

// ─── Doc Row (read-only — advisor ดูได้อย่างเดียว) ───────────────────────────

const AdvisorDocRow = ({
  sub,
  index,
}: {
  sub: SubmissionWithEvent;
  index: number;
}) => {
  const isApproved = sub.status === "APPROVED";
  const isRevision = sub.status === "NEEDS_REVISION";
  const isSubmitted = sub.status === "SUBMITTED";

  return (
    <div className={`flex items-center gap-4 px-6 py-5 border-b border-gray-100 dark:border-gray-700 last:border-b-0
      ${isSubmitted ? "bg-blue-50/30 dark:bg-blue-900/5" : ""}`}
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
              รอการตรวจ
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-0.5 text-sm text-gray-400 dark:text-gray-500 flex-wrap">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            ครบกำหนด: {formatThaiDate(sub.Event?.dueDate)}
          </span>
          {sub.submittedAt && <span>• ส่งเมื่อ: {formatThaiDate(sub.submittedAt)}</span>}
        </div>
        {/* feedback จาก admin (read-only) */}
        {isRevision && sub.feedback && (
          <p className="text-sm text-rose-500 mt-1 italic">"{sub.feedback}"</p>
        )}
      </div>

      {/* Status badge + file link (ดูได้อย่างเดียว) */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <StatusBadge status={sub.status} />
        {sub.file && (
          <a
            href={sub.file}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
            title="ดูไฟล์ที่นักศึกษาส่ง"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>
    </div>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdvisorEventsPage() {
  const { status } = useAuth();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("project") ? parseInt(searchParams.get("project")!) : undefined;

  const { projectGroups, loading, error } = useAdvisorEvents(projectId);

  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

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

  const group = projectGroups.find((g) => g.project_id === selectedProjectId) ?? projectGroups[0];

  // เฉพาะเอกสาร (requireFile === true)
  const docSubmissions = group.submissions.filter((s) => s.Event?.requireFile === true);
  const approvedCount = docSubmissions.filter((s) => s.status === "APPROVED").length;
  const progress = docSubmissions.length > 0 ? Math.round((approvedCount / docSubmissions.length) * 100) : 0;

  // งานถัดไปที่นักศึกษาส่งมาแล้ว
  const nextPending = docSubmissions.find((s) => s.status === "SUBMITTED");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">

      {/* ── Header ── */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">ภาพรวมเอกสาร</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-base">
          ติดตามความคืบหน้าการส่งเอกสารของโครงงานที่ดูแล
        </p>
      </div>

      {/* ── Project Tabs ── */}
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
          <p className="text-sm font-medium text-gray-400 dark:text-gray-500 mb-3">ความคืบหน้าภาพรวม</p>
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
            <p className="text-sm text-gray-400 mt-2">{approvedCount} / {docSubmissions.length} ผ่านแล้ว</p>
          </div>
        </div>

        {/* Project Info gradient card */}
        <div className="md:col-span-2 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <Users className="w-28 h-28" />
          </div>
          <div className="relative z-10">
            <span className="text-xs bg-white/20 px-3 py-1 rounded-full font-medium border border-white/10">
              {group.section?.section_code} • กลุ่ม {group.groupNumber}
            </span>
            <h2 className="text-2xl font-bold mt-3 mb-1 leading-tight">
              {nextPending
                ? `รอดูงาน: ${nextPending.Event?.name}`
                : "นักศึกษายังไม่มีงานค้างส่ง 🎉"}
            </h2>
            {nextPending ? (
              <p className="text-blue-100 flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4" />
                ครบกำหนด: {formatThaiDate(nextPending.Event?.dueDate)}
              </p>
            ) : (
              <p className="text-blue-100 text-sm">{group.projectname}</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Document List (read-only) ── */}
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
            />
          ))
        )}
      </div>
    </div>
  );
}
