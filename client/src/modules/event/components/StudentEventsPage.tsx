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
    CheckCircle,
    XCircle,
    FileText,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { SubmitModal } from "@/modules/event";
import {
    useStudentEvents,
    type SubmissionWithEvent,
} from "@/modules/event/hooks/useStudentEvents";

// ─── helpers ─────────────────────────────────────────────────────────────────

const formatThaiDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear() + 543}`;
};

const isDueSoon = (dueDate?: string) => {
    if (!dueDate) return false;
    const diff = new Date(dueDate).getTime() - Date.now();
    return diff > 0 && diff < 3 * 24 * 60 * 60 * 1000; // 3 days
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

// ─── Document Row ─────────────────────────────────────────────────────────────

const DocRow = ({
    sub,
    index,
    onSubmit,
}: {
    sub: SubmissionWithEvent;
    index: number;
    onSubmit: (s: SubmissionWithEvent) => void;
}) => {
    const isApproved = sub.status === "APPROVED";
    const isRevision = sub.status === "NEEDS_REVISION";
    const canSubmit = !isApproved;
    const soon = isDueSoon(sub.Event?.dueDate);

    return (
        <div
            onClick={() => canSubmit && onSubmit(sub)}
            className={`flex items-center gap-4 px-6 py-5 border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors
                ${canSubmit ? "hover:bg-blue-50/50 dark:hover:bg-blue-900/10 cursor-pointer" : "cursor-default"}
            `}
        >
            {/* Step number / check */}
            <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0
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
                    {soon && !isApproved && (
                        <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full font-medium">
                            ใกล้ครบกำหนด
                        </span>
                    )}
                </div>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    ครบกำหนด: {formatThaiDate(sub.Event?.dueDate)}
                </p>
                {isRevision && sub.feedback && (
                    <p className="text-sm text-rose-500 mt-1 italic">"{sub.feedback}"</p>
                )}
            </div>

            {/* Status + action */}
            <div className="flex items-center gap-3 flex-shrink-0">
                <StatusBadge status={sub.status} />
                {canSubmit && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onSubmit(sub); }}
                        className="text-sm px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                    >
                        {isRevision ? "แก้ไขงาน" : "ส่งงาน"}
                    </button>
                )}
            </div>
        </div>
    );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export const StudentEventsPage: React.FC = () => {
    const { status } = useAuth();
    const { submissions, loading, error, totalProgress, submitWork, getSubmission } = useStudentEvents();

    // Filter: เฉพาะงานที่ต้องส่งเอกสาร
    const docSubmissions = submissions.filter((s) => s.Event?.requireFile === true);

    const approvedCount = docSubmissions.filter((s) => s.status === "APPROVED").length;
    const progress = docSubmissions.length > 0 ? Math.round((approvedCount / docSubmissions.length) * 100) : 0;

    // Next pending doc
    const nextPending = docSubmissions.find((s) => s.status !== "APPROVED");

    const [submitModalOpen, setSubmitModalOpen] = useState(false);
    const [selectedSubmission, setSelectedSubmission] = useState<SubmissionWithEvent | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

    const showToast = (type: "success" | "error", message: string) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 4000);
    };

    const handleSubmit = (sub: SubmissionWithEvent) => {
        setSelectedSubmission(sub);
        setSubmitModalOpen(true);
    };

    const handleSubmitWork = async (fileUrl?: string) => {
        if (!selectedSubmission) return;
        setSubmitting(true);
        try {
            const result = await submitWork(selectedSubmission.submission_id, fileUrl);
            if (result.success) {
                setSubmitModalOpen(false);
                setSelectedSubmission(null);
                showToast("success", "ส่งงานสำเร็จแล้ว!");
            } else {
                showToast("error", result.error || "ส่งงานไม่สำเร็จ กรุณาลองอีกครั้ง");
            }
        } finally {
            setSubmitting(false);
        }
    };

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
                    <Lock size={64} className="mx-auto text-gray-300 dark:text-gray-600 mb-6" />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">ไม่สามารถเข้าถึงได้</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">{error}</p>
                    <a href="/Teams" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        ไปหน้าจัดการทีม
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">

            {/* ── Page Header ── */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">เอกสารที่ต้องส่ง</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1 text-base">รายการเอกสารและรายงานที่ต้องยื่นตามกำหนดการ</p>
            </div>

            {/* ── Summary row ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {/* Progress */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 flex flex-col justify-between">
                    <p className="text-sm font-medium text-gray-400 dark:text-gray-500 mb-3">ความคืบหน้า</p>
                    <div>
                        <p className="text-4xl font-bold text-gray-900 dark:text-white">{progress}<span className="text-xl text-gray-400">%</span></p>
                        <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full mt-3 overflow-hidden">
                            <div
                                className="h-2.5 rounded-full bg-emerald-500 transition-all duration-700"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <p className="text-sm text-gray-400 mt-2">{approvedCount} / {docSubmissions.length} ผ่านแล้ว</p>
                    </div>
                </div>

                {/* Next deadline */}
                <div className="md:col-span-2 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-10">
                        <Calendar className="w-28 h-28" />
                    </div>
                    <div className="relative z-10">
                        <span className="text-xs bg-white/20 px-3 py-1 rounded-full font-medium border border-white/10">
                            งานถัดไป
                        </span>
                        <h2 className="text-2xl font-bold mt-3 mb-1">
                            {nextPending?.Event?.name || "ทำครบทุกรายการแล้ว 🎉"}
                        </h2>
                        {nextPending && (
                            <p className="text-blue-100 flex items-center gap-2 text-sm">
                                <Clock className="w-4 h-4" />
                                ครบกำหนด: {formatThaiDate(nextPending.Event?.dueDate)}
                            </p>
                        )}
                        {nextPending && (
                            <button
                                onClick={() => handleSubmit(nextPending)}
                                className="mt-5 w-fit bg-white text-blue-600 px-5 py-2.5 rounded-lg font-bold shadow hover:bg-blue-50 transition flex items-center gap-2"
                            >
                                ส่งงานตอนนี้ <ArrowRight className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Document list ── */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                    <FileText className="w-5 h-5 text-blue-500" />
                    <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">รายการเอกสาร</h2>
                    <span className="ml-auto text-sm text-gray-400">{docSubmissions.length} รายการ</span>
                </div>

                {docSubmissions.length === 0 ? (
                    <div className="py-16 text-center text-gray-400 dark:text-gray-500">
                        <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p className="text-base">ยังไม่มีเอกสารที่ต้องส่ง</p>
                    </div>
                ) : (
                    docSubmissions.map((sub, i) => (
                        <DocRow key={sub.submission_id} sub={sub} index={i} onSubmit={handleSubmit} />
                    ))
                )}
            </div>

            {/* Submit Modal */}
            <SubmitModal
                isOpen={submitModalOpen}
                onClose={() => { if (!submitting) setSubmitModalOpen(false); }}
                onSubmit={handleSubmitWork}
                eventName={selectedSubmission?.Event?.name || ""}
                isLoading={submitting}
                currentFile={selectedSubmission?.file || undefined}
                currentStatus={selectedSubmission?.status}
                feedback={selectedSubmission?.feedback || undefined}
            />

            {/* Toast */}
            {toast && (
                <div className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium
                    ${toast.type === "success" ? "bg-emerald-500" : "bg-red-500"}`}>
                    {toast.type === "success"
                        ? <CheckCircle className="w-5 h-5 shrink-0" />
                        : <XCircle className="w-5 h-5 shrink-0" />}
                    {toast.message}
                </div>
            )}
        </div>
    );
};
