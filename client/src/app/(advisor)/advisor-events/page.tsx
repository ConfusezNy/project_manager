"use client";

import React, { Suspense, useState } from "react";
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
  groupNum,
  sectionCode,
}: {
  sub: SubmissionWithEvent;
  index: number;
  groupNum?: string;
  sectionCode?: string;
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
        <div className="flex items-center gap-2 flex-wrap mb-1">
          {sectionCode && groupNum && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
              วิชา {sectionCode} กลุ่ม {groupNum}
            </span>
          )}
        </div>
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
        <div className="flex items-center gap-3 mt-1 text-sm text-gray-400 dark:text-gray-500 flex-wrap">
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

function AdvisorEventsInner() {
  const { status } = useAuth();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("project") ? parseInt(searchParams.get("project")!) : undefined;

  const { projectGroups, loading, error, overallProgress, pendingEvent, pendingProject } = useAdvisorEvents(projectId);

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

  // รวม submissions เอกสารทั้งหมดมาใน list เดียว
  const allDocSubmissions = projectGroups
    .flatMap((g) => g.submissions)
    .filter((s) => s.Event?.requireFile === true);

  const totalDocs = allDocSubmissions.length;
  const passedDocs = allDocSubmissions.filter((s) => s.status === "APPROVED").length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">

      {/* ── Header ── */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">รายการเอกสารนักศึกษา</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-base">
          รายการเอกสารและรายงานที่นักศึกษาต้องส่งตามกำหนดการ
        </p>
      </div>

      {/* ── Summary Row ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">

        {/* Progress Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 flex flex-col justify-between">
          <p className="text-sm font-medium text-gray-400 dark:text-gray-500 mb-3">ความคืบหน้าภาพรวม</p>
          <div>
            <p className="text-4xl font-bold text-gray-900 dark:text-white">
              {overallProgress}<span className="text-xl text-gray-400">%</span>
            </p>
            <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full mt-3 overflow-hidden">
              <div
                className="h-2.5 rounded-full bg-emerald-500 transition-all duration-700"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
            <p className="text-sm text-gray-400 mt-2">{passedDocs} / {totalDocs} ผ่านแล้ว</p>
          </div>
        </div>

        {/* Project Info gradient card */}
        <div className="md:col-span-2 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <Users className="w-28 h-28" />
          </div>
          <div className="relative z-10">
            {pendingProject && (
              <span className="text-xs bg-white/20 px-3 py-1 rounded-full font-medium border border-white/10 mb-2 inline-block">
                วิชา {pendingProject.section?.section_code} • กลุ่ม {pendingProject.groupNumber}
              </span>
            )}
            <span className="block text-xs text-blue-200 mt-2">งานถัดไป</span>
            <h2 className="text-2xl font-bold mt-1 mb-1 leading-tight">
              {pendingEvent
                ? `${pendingEvent.name}`
                : "ตรวจครบทุกรายการแล้ว 🎉"}
            </h2>
            {pendingEvent ? (
              <p className="text-blue-100 flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4" />
                ครบกำหนด: {formatThaiDate(pendingEvent.dueDate)}
              </p>
            ) : (
              <p className="text-blue-100 text-sm">{projectGroups[0]?.projectname}</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Document List (เหมือนหน้า student) ── */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden flex-1 min-w-0">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <FileText className="w-5 h-5 text-blue-500" />
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">รายการเอกสารทั้งหมด</h2>
          <span className="ml-auto text-sm text-gray-400">{totalDocs} รายการ</span>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
          {totalDocs === 0 ? (
            <div className="py-16 text-center text-gray-400 dark:text-gray-500">
              <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-base">ยังไม่มีเอกสารที่ต้องส่ง</p>
            </div>
          ) : (
            allDocSubmissions.map((sub, i) => {
              const g = projectGroups.find(x => x.team_id === sub.team_id);
              return <AdvisorDocRow key={sub.submission_id} sub={sub} index={i} groupNum={g?.groupNumber} sectionCode={g?.section?.section_code} />;
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdvisorEventsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    }>
      <AdvisorEventsInner />
    </Suspense>
  );
}
