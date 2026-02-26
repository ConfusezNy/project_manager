"use client";

import React, { useState } from "react";
import {
    Loader2,
    Clock,
    CheckCircle2,
    ArrowRight,
    Calendar,
    AlertCircle,
    Lock,
    ChevronDown,
    ChevronUp,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { SubmitModal } from "@/modules/event";
import {
    useStudentEvents,
    type SubmissionWithEvent,
    type SectionGroup,
} from "@/modules/event/hooks/useStudentEvents";

// Status Badge Component
const StatusBadge = ({ status }: { status: string }) => {
    const styles: Record<string, string> = {
        APPROVED:
            "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
        SUBMITTED:
            "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
        NEEDS_REVISION:
            "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400",
        PENDING:
            "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    };

    const labels: Record<string, string> = {
        APPROVED: "ผ่านแล้ว",
        SUBMITTED: "รอตรวจ",
        NEEDS_REVISION: "ต้องแก้ไข",
        PENDING: "ยังไม่ส่ง",
    };

    return (
        <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status] || styles.PENDING}`}
        >
            {labels[status] || status}
        </span>
    );
};

// Progress Circle Component
const ProgressCircle = ({ progress }: { progress: number }) => {
    const circumference = 2 * Math.PI * 56;
    const strokeDashoffset = circumference - (circumference * progress) / 100;

    return (
        <div className="relative w-32 h-32">
            <svg className="w-full h-full transform -rotate-90">
                <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    className="text-slate-200 dark:text-slate-700"
                />
                <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="text-blue-600 transition-all duration-1000 ease-out"
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-3xl font-bold text-slate-800 dark:text-slate-200">
                    {progress}%
                </span>
                <span className="text-xs text-slate-400">Complete</span>
            </div>
        </div>
    );
};

// Section Accordion Component
const SectionAccordion = ({
    group,
    onSubmit,
}: {
    group: SectionGroup;
    onSubmit: (sub: SubmissionWithEvent) => void;
}) => {
    const [isOpen, setIsOpen] = useState(group.isCurrent);

    const approvedCount = group.submissions.filter(
        (s) => s.status === "APPROVED",
    ).length;
    const total = group.submissions.length;
    const progress = total > 0 ? Math.round((approvedCount / total) * 100) : 0;

    // Format term display
    const term = group.section.Term;
    const termLabel = term ? `${term.semester}/${term.academicYear}` : "";

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden mb-4">
            {/* Header */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
            >
                <div className="flex items-center gap-3">
                    <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold ${group.isCurrent
                            ? "bg-gradient-to-br from-blue-500 to-indigo-600"
                            : "bg-slate-400 dark:bg-slate-600"
                            }`}
                    >
                        {group.section.course_type === "PRE_PROJECT" ? "Pre" : "Pro"}
                    </div>
                    <div className="text-left">
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-gray-800 dark:text-gray-200">
                                {group.section.section_code}
                            </h3>
                            {group.isCurrent && (
                                <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs rounded-full">
                                    ปัจจุบัน
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {group.section.course_type === "PRE_PROJECT"
                                ? "Pre-Project"
                                : "Project"}{" "}
                            • เทอม {termLabel}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Progress */}
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {approvedCount}/{total} ผ่าน
                        </p>
                        <div className="w-24 bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-1">
                            <div
                                className="bg-emerald-500 h-2 rounded-full transition-all"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>

                    {isOpen ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                </div>
            </button>

            {/* Content */}
            {isOpen && (
                <div className="border-t border-gray-100 dark:border-gray-700">
                    <div className="p-2">
                        {group.submissions.map((sub, index) => {
                            const isApproved = sub.status === "APPROVED";
                            const isRevision = sub.status === "NEEDS_REVISION";

                            return (
                                <div
                                    key={sub.submission_id}
                                    onClick={() => onSubmit(sub)}
                                    className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl cursor-pointer transition"
                                >
                                    <div className="flex items-center gap-3">
                                        {/* Number/Check Circle */}
                                        <div
                                            className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${isApproved
                                                ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                                                : "bg-slate-100 text-slate-400 dark:bg-slate-700 dark:text-slate-500"
                                                }`}
                                        >
                                            {isApproved ? (
                                                <CheckCircle2 className="w-5 h-5" />
                                            ) : (
                                                sub.Event?.order || index + 1
                                            )}
                                        </div>

                                        {/* Event Info */}
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium text-gray-800 dark:text-gray-200 text-sm">
                                                    {sub.Event?.name || "Unknown Event"}
                                                </p>
                                                {isRevision && (
                                                    <AlertCircle className="w-4 h-4 text-rose-500" />
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-400 dark:text-gray-500">
                                                {sub.Event?.dueDate
                                                    ? formatThaiDate(sub.Event.dueDate)
                                                    : "-"}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Status Badge */}
                                    <StatusBadge status={sub.status} />
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

const formatThaiDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear() + 543}`;
};

export const StudentEventsPage: React.FC = () => {
    const { status } = useAuth();
    const {
        sectionGroups,
        loading,
        error,
        totalProgress,
        currentEvent,
        submitWork,
        getSubmission,
    } = useStudentEvents();

    // Submit modal
    const [submitModalOpen, setSubmitModalOpen] = useState(false);
    const [selectedSubmission, setSelectedSubmission] =
        useState<SubmissionWithEvent | null>(null);

    const handleSubmit = (sub: SubmissionWithEvent) => {
        setSelectedSubmission(sub);
        setSubmitModalOpen(true);
    };

    const handleSubmitWork = async () => {
        if (!selectedSubmission) return;
        await submitWork(selectedSubmission.submission_id);
        setSubmitModalOpen(false);
    };

    if (status === "loading" || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    // Error state - project not approved
    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen p-6">
                <div className="text-center max-w-md">
                    <Lock
                        size={64}
                        className="mx-auto text-gray-300 dark:text-gray-600 mb-6"
                    />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        ไม่สามารถเข้าถึง Events ได้
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">{error}</p>
                    <a
                        href="/Teams"
                        className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        ไปหน้าจัดการทีม
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    แดชบอร์ดภาพรวม
                </h1>
            </div>

            {/* Top Row: Progress Circle + Next Deadline */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* Progress Circle Card */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center text-center">
                    <ProgressCircle progress={totalProgress} />
                    <h3 className="font-bold text-gray-700 dark:text-gray-300 mt-4">
                        ความคืบหน้าภาพรวม
                    </h3>
                </div>

                {/* Next Deadline Card */}
                <div className="md:col-span-2 bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-2xl shadow-lg text-white relative overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Calendar className="w-32 h-32" />
                    </div>

                    <div className="relative z-10 h-full flex flex-col justify-between">
                        <div>
                            <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm border border-white/10">
                                Next Deadline
                            </span>
                            <h3 className="text-2xl font-bold mt-4 mb-2">
                                {currentEvent?.name || "ไม่มีงานค้าง"}
                            </h3>
                            {currentEvent && (
                                <p className="text-blue-100 flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    ครบกำหนด: {formatThaiDate(currentEvent.dueDate)}
                                </p>
                            )}
                        </div>
                        {currentEvent && (
                            <button
                                onClick={() => {
                                    const sub = getSubmission(currentEvent.event_id);
                                    if (sub) handleSubmit(sub as SubmissionWithEvent);
                                }}
                                className="mt-6 w-fit bg-white text-blue-600 px-6 py-2.5 rounded-lg font-bold shadow-sm hover:bg-blue-50 transition flex items-center gap-2"
                            >
                                ส่งงานตอนนี้ <ArrowRight className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Section Groups */}
            <div>
                <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200 mb-4">
                    รายการตาม Section
                </h3>

                {sectionGroups.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-8 text-center text-gray-400">
                        ยังไม่มีกำหนดการ
                    </div>
                ) : (
                    sectionGroups.map((group) => (
                        <SectionAccordion
                            key={group.section.section_id}
                            group={group}
                            onSubmit={handleSubmit}
                        />
                    ))
                )}
            </div>

            {/* Submit Modal */}
            <SubmitModal
                isOpen={submitModalOpen}
                onClose={() => setSubmitModalOpen(false)}
                onSubmit={handleSubmitWork}
                eventName={selectedSubmission?.Event?.name || ""}
            />
        </div>
    );
};
