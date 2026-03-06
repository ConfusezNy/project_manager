"use client";

// advisor-events/page.tsx
// แสดง submissions ของอาจารย์ แบบ group by PROJECT
// แต่ละโครงงานมี accordion ของตัวเอง แยกชัดเจน

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Loader2,
  Clock,
  CheckCircle2,
  Calendar,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  FileText,
  Users,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useAdvisorEvents, type AdvisorProjectGroup } from "@/modules/event/hooks/useAdvisorEvents";
import { type SubmissionWithEvent } from "@/modules/event/hooks/useStudentEvents";

// ─── Shared sub-components ────────────────────────────────────────────────────

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    APPROVED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    SUBMITTED: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    NEEDS_REVISION: "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400",
    PENDING: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  };
  const labels: Record<string, string> = {
    APPROVED: "ผ่านแล้ว",
    SUBMITTED: "รอตรวจ",
    NEEDS_REVISION: "ต้องแก้ไข",
    PENDING: "ยังไม่ส่ง",
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status] || styles.PENDING}`}>
      {labels[status] || status}
    </span>
  );
};

const formatThaiDate = (dateStr?: string) => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear() + 543}`;
};

// ─── ProjectAccordion ───────────────────────────────────────────────────────

const ProjectAccordion = ({ group }: { group: AdvisorProjectGroup }) => {
  const [isOpen, setIsOpen] = useState(true);
  const term = group.section?.Term;
  const termLabel = term ? `${term.semester}/${term.academicYear}` : "";
  const courseTypeLabel = group.section?.course_type === "PRE_PROJECT" ? "Pre-Project" : "Project";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden mb-4">
      {/* Project Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
      >
        <div className="flex items-center gap-4">
          {/* Progress circle mini */}
          <div className="relative w-14 h-14 shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="28" cy="28" r="22" stroke="currentColor" strokeWidth="5" fill="none" className="text-slate-200 dark:text-slate-700" />
              <circle
                cx="28" cy="28" r="22" stroke="currentColor" strokeWidth="5" fill="none"
                strokeDasharray={2 * Math.PI * 22}
                strokeDashoffset={2 * Math.PI * 22 - (2 * Math.PI * 22 * group.progress) / 100}
                strokeLinecap="round"
                className={`transition-all duration-700 ${group.progress === 100 ? "text-emerald-500" : "text-blue-500"}`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{group.progress}%</span>
            </div>
          </div>

          {/* Project info */}
          <div className="text-left">
            <h3 className="font-bold text-gray-900 dark:text-white text-base line-clamp-1">
              {group.projectname}
            </h3>
            <div className="flex items-center gap-2 mt-0.5 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                กลุ่ม {group.groupNumber}
              </span>
              <span>•</span>
              <span className="font-mono text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                {group.section?.section_code}
              </span>
              <span>•</span>
              <span>{courseTypeLabel} เทอม {termLabel}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          {/* Progress bar */}
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {group.approvedCount}/{group.total} ผ่าน
            </p>
            <div className="w-28 bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-1">
              <div
                className={`h-2 rounded-full transition-all ${group.progress === 100 ? "bg-emerald-500" : "bg-blue-500"}`}
                style={{ width: `${group.progress}%` }}
              />
            </div>
          </div>
          {isOpen
            ? <ChevronUp className="w-5 h-5 text-gray-400" />
            : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </div>
      </button>

      {/* Submissions */}
      {isOpen && (
        <div className="border-t border-gray-100 dark:border-gray-700">
          {group.submissions.length === 0 ? (
            <div className="p-6 text-center text-gray-400 dark:text-gray-500 text-sm">
              ยังไม่มีรายการส่งเอกสาร
            </div>
          ) : (
            <div className="p-2">
              {group.submissions
                .sort((a, b) => (a.Event?.order ?? 0) - (b.Event?.order ?? 0))
                .map((sub, index) => {
                  const isApproved = sub.status === "APPROVED";
                  const isRevision = sub.status === "NEEDS_REVISION";
                  return (
                    <div
                      key={sub.submission_id}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${isApproved
                          ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : "bg-slate-100 text-slate-400 dark:bg-slate-700 dark:text-slate-500"
                          }`}>
                          {isApproved ? <CheckCircle2 className="w-5 h-5" /> : sub.Event?.order || index + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-800 dark:text-gray-200 text-sm">
                              {sub.Event?.name || "Unknown Event"}
                            </p>
                            {isRevision && <AlertCircle className="w-4 h-4 text-rose-500" />}
                          </div>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            กำหนด: {formatThaiDate(sub.Event?.dueDate)}
                            {sub.submittedAt && (
                              <> • ส่ง: {formatThaiDate(sub.submittedAt)}</>
                            )}
                          </p>
                        </div>
                      </div>
                      <StatusBadge status={sub.status} />
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Progress Circle ─────────────────────────────────────────────────────────

const ProgressCircle = ({ progress }: { progress: number }) => {
  const circumference = 2 * Math.PI * 56;
  return (
    <div className="relative w-32 h-32">
      <svg className="w-full h-full transform -rotate-90">
        <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="none" className="text-slate-200 dark:text-slate-700" />
        <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - (circumference * progress) / 100}
          strokeLinecap="round" className="text-blue-600 transition-all duration-1000 ease-out" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center flex-col">
        <span className="text-3xl font-bold text-slate-800 dark:text-slate-200">{progress}%</span>
        <span className="text-xs text-slate-400">Complete</span>
      </div>
    </div>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdvisorEventsPage() {
  const { status } = useAuth();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("project") ? parseInt(searchParams.get("project")!) : undefined;
  const { projectGroups, loading, error, overallProgress, pendingEvent, pendingProject } =
    useAdvisorEvents(projectId);

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <div className="text-center max-w-md">
          <FileText size={64} className="mx-auto text-gray-300 dark:text-gray-600 mb-6" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">ไม่สามารถแสดงข้อมูลได้</h2>
          <p className="text-gray-500 dark:text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">ภาพรวมโครงงานที่ดูแล</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {projectGroups.length} โครงงาน — ส่งเอกสารของใครของมัน แยกอย่างชัดเจน
        </p>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center text-center">
          <ProgressCircle progress={overallProgress} />
          <h3 className="font-bold text-gray-700 dark:text-gray-300 mt-4">ความคืบหน้าภาพรวม</h3>
        </div>

        <div className="md:col-span-2 bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-2xl shadow-lg text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Calendar className="w-32 h-32" />
          </div>
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div>
              <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm border border-white/10">
                {pendingEvent ? "รอการตรวจ" : "รออนุมัติ"}
              </span>
              <h3 className="text-2xl font-bold mt-4 mb-2">
                {pendingEvent?.name || "ไม่มีงานรอตรวจ"}
              </h3>
              {pendingEvent && pendingProject && (
                <div className="space-y-1">
                  <p className="text-blue-100 flex items-center gap-2 text-sm">
                    <FileText className="w-4 h-4" />
                    {pendingProject.projectname}
                  </p>
                  <p className="text-blue-100 flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4" />
                    กำหนด: {formatThaiDate(pendingEvent.dueDate)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Per-project accordions */}
      <div>
        <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200 mb-4">
          รายการตามโครงงาน ({projectGroups.length})
        </h3>
        {projectGroups.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-8 text-center text-gray-400">
            ยังไม่มีโครงงาน
          </div>
        ) : (
          projectGroups.map((group) => (
            <ProjectAccordion key={group.project_id} group={group} />
          ))
        )}
      </div>
    </div>
  );
}
