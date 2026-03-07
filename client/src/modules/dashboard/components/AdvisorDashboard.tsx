"use client";

import React, { useState } from "react";
import {
    Loader2,
    Users,
    Clock,
    CheckCircle,
    FileCheck,
    AlertCircle,
    X,
    ChevronRight,
    ChevronLeft,
    BookOpen,
    ClipboardList,
    Circle,
    CheckSquare,
    PlayCircle,
    Calendar,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useAdvisorDashboard, type AdvisorCalendarEvent } from "@/modules/dashboard/hooks/useAdvisorDashboard";

// ─── helpers ─────────────────────────────────────────────────────────────────

const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear() + 543}`;
};

const getProgressColor = (pct: number) => {
    if (pct === 100) return "bg-emerald-500";
    if (pct >= 70) return "bg-blue-500";
    if (pct >= 40) return "bg-amber-500";
    return "bg-red-400";
};

const getStatusDot = (submittedCount: number, progressPercent: number) => {
    if (progressPercent === 100) return { color: "bg-emerald-400", label: "ผ่านทุกด่าน" };
    if (submittedCount > 0) return { color: "bg-blue-500 animate-pulse", label: `${submittedCount} รอตรวจ` };
    return { color: "bg-gray-300", label: "รอส่ง" };
};

// ─── Stat Card ───────────────────────────────────────────────────────────────

const StatCard = ({
    icon: Icon, label, value, color, highlight,
}: { icon: any; label: string; value: number; color: string; highlight?: boolean }) => (
    <div className={`rounded-2xl p-5 border flex items-center gap-4 ${highlight
        ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/30"
        : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700"}`}>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${highlight ? "bg-white/20" : color}`}>
            <Icon className={`w-6 h-6 ${highlight ? "text-white" : "text-white"}`} />
        </div>
        <div>
            <p className={`text-3xl font-bold ${highlight ? "text-white" : "text-gray-900 dark:text-white"}`}>{value}</p>
            <p className={`text-sm ${highlight ? "text-blue-100" : "text-gray-500 dark:text-gray-400"}`}>{label}</p>
        </div>
    </div>
);

// ─── Project Row ─────────────────────────────────────────────────────────────

const TaskPill = ({
    count, label, colorClass, icon: Icon,
}: { count: number; label: string; colorClass: string; icon: React.FC<{ className?: string }> }) => (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold ${colorClass}`}>
        <Icon className="w-3.5 h-3.5" />
        <span>{count}</span>
        <span className="text-xs font-normal opacity-80 hidden sm:inline">{label}</span>
    </div>
);

const ProjectRow = ({
    team,
    onApproveClick,
}: {
    team: {
        team_id: number;
        project_id: number;
        name: string;
        projectTitle?: string;
        progressPercent: number;
        submittedCount: number;
        approvedCount: number;
        totalEvents: number;
        memberCount: number;
        taskTodo: number;
        taskInProgress: number;
        taskInReview: number;
        taskDone: number;
    };
    onApproveClick: () => void;
}) => {
    const dot = getStatusDot(team.submittedCount, team.progressPercent);
    const totalTasks = team.taskTodo + team.taskInProgress + team.taskInReview + team.taskDone;
    const taskDonePct = totalTasks > 0 ? Math.round((team.taskDone / totalTasks) * 100) : 0;

    return (
        <div className="border-b border-gray-100 dark:border-gray-700 last:border-b-0 hover:bg-gray-50/80 dark:hover:bg-gray-700/20 transition-colors">
            <div className="px-5 py-4">

                {/* ── Top row: title + action ── */}
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className={`mt-1 w-2.5 h-2.5 rounded-full flex-shrink-0 ${dot.color}`} title={dot.label} />
                        <div className="min-w-0">
                            <p className="font-bold text-gray-900 dark:text-white text-base leading-snug truncate">
                                {team.projectTitle || "ยังไม่มีชื่อโครงงาน"}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400 dark:text-gray-500">
                                <span>{team.name}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1"><Users className="w-3 h-3" />{team.memberCount} คน</span>
                            </div>
                        </div>
                    </div>

                    {/* Action button */}
                    <div className="flex-shrink-0">
                        {team.submittedCount > 0 ? (
                            <button
                                onClick={onApproveClick}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors whitespace-nowrap"
                            >
                                <FileCheck className="w-4 h-4" />
                                ตรวจ ({team.submittedCount})
                            </button>
                        ) : team.progressPercent === 100 ? (
                            <span className="flex items-center gap-1 text-emerald-500 text-sm font-semibold whitespace-nowrap">
                                <CheckCircle className="w-4 h-4" />ครบแล้ว
                            </span>
                        ) : (
                            <ChevronRight className="w-5 h-5 text-gray-300" />
                        )}
                    </div>
                </div>

                {/* ── Doc progress bar ── */}
                <div className="ml-5 mt-3">
                    <div className="flex justify-between items-center text-sm mb-1.5">
                        <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1 font-medium">
                            <BookOpen className="w-3.5 h-3.5" />เอกสาร {team.approvedCount}/{team.totalEvents} ผ่าน
                        </span>
                        <span className={`font-bold text-sm ${team.progressPercent === 100 ? "text-emerald-500" : "text-gray-700 dark:text-gray-200"}`}>
                            {team.progressPercent}%
                        </span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                            className={`h-2.5 rounded-full transition-all duration-700 ${getProgressColor(team.progressPercent)}`}
                            style={{ width: `${team.progressPercent}%` }}
                        />
                    </div>
                </div>

                {/* ── Task status pills + progress bar ── */}
                {totalTasks > 0 && (
                    <div className="ml-5 mt-3">
                        {/* Pill badges */}
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                            <span className="text-sm text-gray-400 dark:text-gray-500 flex items-center gap-1 font-medium">
                                <ClipboardList className="w-3.5 h-3.5 text-violet-400" />Tasks
                            </span>
                            <TaskPill count={team.taskTodo} label="ต้องทำ" icon={Circle}
                                colorClass="bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300" />
                            <TaskPill count={team.taskInProgress} label="กำลังทำ" icon={PlayCircle}
                                colorClass="bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" />
                            <TaskPill count={team.taskInReview} label="รอ Review" icon={CheckSquare}
                                colorClass="bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300" />
                            <TaskPill count={team.taskDone} label="สำเร็จ" icon={CheckCircle}
                                colorClass="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" />
                        </div>

                        {/* Task progress bar — กว้างเต็มเหมือน doc bar */}
                        <div className="flex justify-between items-center text-sm mb-1.5">
                            <span className="text-gray-500 dark:text-gray-400 font-medium">ความคืบหน้า Tasks</span>
                            <span className="font-bold text-sm text-violet-600 dark:text-violet-400">{taskDonePct}%</span>
                        </div>
                        <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className="h-2.5 bg-gradient-to-r from-violet-500 to-purple-400 rounded-full transition-all duration-700"
                                style={{ width: `${taskDonePct}%` }}
                            />
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};


// ─── Pending Submission Item ──────────────────────────────────────────────────

const PendingItem = ({
    submission, onApprove, onReject,
}: {
    submission: {
        submission_id: number;
        team_name: string;
        event_name: string;
        submittedAt?: string;
        file?: string;
    };
    onApprove: () => void;
    onReject: () => void;
}) => (
    <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/50 rounded-xl">
        <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{submission.team_name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {submission.event_name} {submission.submittedAt && `• ${formatDate(submission.submittedAt)}`}
            </p>
        </div>
        <div className="flex gap-2 ml-3 flex-shrink-0">
            {submission.file && (
                <a
                    href={submission.file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition text-xs"
                >
                    ดูไฟล์
                </a>
            )}
            <button
                onClick={onApprove}
                className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg hover:bg-emerald-200 transition"
                title="อนุมัติ"
            >
                <CheckCircle className="w-4 h-4" />
            </button>
            <button
                onClick={onReject}
                className="p-1.5 bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400 rounded-lg hover:bg-red-200 transition"
                title="ส่งคืนแก้ไข"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    </div>
);

// ─── Advisor Calendar ─────────────────────────────────────────────────────────

const STATUS_COLOR_MAP: Record<string, string> = {
    APPROVED: "#22c55e",
    SUBMITTED: "#3b82f6",
    NEEDS_REVISION: "#f59e0b",
    PENDING: "#9ca3af",
};

const statusLabel: Record<string, string> = {
    APPROVED: "ผ่านแล้ว",
    SUBMITTED: "รอตรวจ",
    NEEDS_REVISION: "ต้องแก้ไข",
    PENDING: "ยังไม่ส่ง",
};

const statusBg: Record<string, string> = {
    APPROVED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    SUBMITTED: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    NEEDS_REVISION: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    PENDING: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400",
};

const AdvisorCalendar = ({ events }: { events: AdvisorCalendarEvent[] }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<string | null>(null); // "YYYY-MM-DD"

    const monthNames = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
    const dayNames = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];
    const buddhistYear = currentMonth.getFullYear() + 543;

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Map dueDate to events for quick lookup
    const eventsByDate = events.reduce<Record<string, AdvisorCalendarEvent[]>>((acc, ev) => {
        const d = new Date(ev.dueDate);
        const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(ev);
        return acc;
    }, {});

    const getKey = (day: number) => `${year}-${month}-${day}`;

    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    while (days.length < 42) days.push(null);

    const today = new Date();
    const isToday = (day: number) =>
        day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

    const selectedEvents = selectedDate ? (eventsByDate[selectedDate] ?? []) : [];

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    <span className="font-bold text-gray-800 dark:text-gray-100">ปฏิทินกิจกรรม</span>
                </div>
                <div className="flex items-center gap-1">
                    <button onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                        <ChevronLeft className="w-4 h-4 text-gray-500" />
                    </button>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[5rem] text-center">
                        {monthNames[month]} {buddhistYear}
                    </span>
                    <button onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                        <ChevronRight className="w-4 h-4 text-gray-500" />
                    </button>
                </div>
            </div>

            <div className="p-3">
                {/* Day headers */}
                <div className="grid grid-cols-7 mb-1">
                    {dayNames.map((d, i) => (
                        <div key={i} className={`text-center text-xs font-medium py-1 ${i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : "text-gray-400"
                            }`}>{d}</div>
                    ))}
                </div>

                {/* Grid */}
                <div className="grid grid-cols-7 gap-0.5">
                    {days.map((day, idx) => {
                        if (!day) return <div key={`e-${idx}`} className="aspect-square" />;
                        const key = getKey(day);
                        const hasEvents = !!eventsByDate[key];
                        const dayEvts = eventsByDate[key] ?? [];
                        const today_ = isToday(day);
                        const isSelected = selectedDate === key;
                        const dow = (firstDay + day - 1) % 7;

                        // pick dominant dot color
                        const dotColor = dayEvts[0] ? STATUS_COLOR_MAP[dayEvts[0].status] : "#9ca3af";

                        return (
                            <button
                                key={`d-${day}`}
                                onClick={() => setSelectedDate(hasEvents ? (isSelected ? null : key) : null)}
                                className={`relative aspect-square flex flex-col items-center justify-center text-xs rounded-lg transition-all ${today_
                                    ? "bg-blue-600 text-white font-bold shadow-md"
                                    : isSelected
                                        ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 ring-2 ring-blue-400"
                                        : hasEvents
                                            ? "bg-blue-50 dark:bg-blue-900/10 font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                                            : dow === 0
                                                ? "text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                : dow === 6
                                                    ? "text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    }`}
                                title={hasEvents ? `${dayEvts.length} กิจกรรม` : undefined}
                            >
                                {day}
                                {hasEvents && !today_ && (
                                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 flex gap-0.5">
                                        {dayEvts.slice(0, 3).map((_, i) => (
                                            <span key={i} className="w-1 h-1 rounded-full" style={{ backgroundColor: dotColor }} />
                                        ))}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Legend */}
                <div className="flex gap-3 justify-center mt-2 text-xs text-gray-400">
                    {Object.entries(statusLabel).map(([k, v]) => (
                        <span key={k} className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_COLOR_MAP[k] }} />{v}
                        </span>
                    ))}
                </div>
            </div>

            {/* Popup: events of selected date */}
            {selectedDate && selectedEvents.length > 0 && (
                <div className="border-t border-gray-100 dark:border-gray-700 p-3 space-y-2 max-h-56 overflow-y-auto">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                        {(() => {
                            const [y, m, d] = selectedDate.split("-").map(Number);
                            return new Date(y, m, d).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" });
                        })()}
                        {" "}&mdash; {selectedEvents.length} กิจกรรม
                    </p>
                    {selectedEvents.map((ev, i) => (
                        <div key={i} className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-xl gap-3">
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{ev.name}</p>
                                <p className="text-xs text-gray-400 mt-0.5">{ev.section_code} • {ev.group_name}</p>
                            </div>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${statusBg[ev.status] ?? statusBg.PENDING}`}>
                                {statusLabel[ev.status] ?? ev.status}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export const AdvisorDashboard: React.FC = () => {
    const { user, status: authStatus } = useAuth();
    const {
        loading, error, teams, pendingSubmissions, calendarEvents, stats,
        approveSubmission, rejectSubmission,
    } = useAdvisorDashboard();

    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [rejectTarget, setRejectTarget] = useState<number | null>(null);
    const [rejectFeedback, setRejectFeedback] = useState("");

    const handleApprove = async (id: number) => {
        const result = await approveSubmission(id);
        if (!result.success) alert("เกิดข้อผิดพลาด: " + result.error);
    };

    const handleRejectClick = (id: number) => {
        setRejectTarget(id);
        setRejectFeedback("");
        setRejectModalOpen(true);
    };

    const handleRejectConfirm = async () => {
        if (!rejectTarget) return;
        const result = await rejectSubmission(rejectTarget, rejectFeedback);
        if (result.success) setRejectModalOpen(false);
        else alert("เกิดข้อผิดพลาด: " + result.error);
    };

    if (authStatus === "loading" || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    // Group teams by section
    const sections = teams.reduce<Record<string, typeof teams>>((acc, team) => {
        const key = team.section_code || "ไม่ระบุ";
        if (!acc[key]) acc[key] = [];
        acc[key].push(team);
        return acc;
    }, {});

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">

            {/* ─── Header ─── */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    สวัสดี, อ.{user?.firstname || "Advisor"}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                    ดูแลทั้งหมด {stats.teamsCount} โครงงาน
                    {Object.keys(sections).length > 1 && ` ใน ${Object.keys(sections).length} Section`}
                </p>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400">{error}</div>
            )}

            {/* ─── Stats ─── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <StatCard icon={FileCheck} label="รอตรวจ" value={stats.pendingCount} color="bg-blue-500" highlight={stats.pendingCount > 0} />
                <StatCard icon={CheckCircle} label="เสร็จสมบูรณ์" value={stats.completedTeams} color="bg-emerald-500" />
                <StatCard icon={Users} label="โครงงานทั้งหมด" value={stats.teamsCount} color="bg-purple-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* ─── Left: Projects grouped by Section ─── */}
                <div className="lg:col-span-2 space-y-5">
                    {Object.keys(sections).length === 0 ? (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-10 text-center text-gray-400">
                            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p>ยังไม่มีโครงงานที่ดูแล</p>
                        </div>
                    ) : (
                        Object.entries(sections).map(([sectionCode, sectionTeams]) => {
                            const first = sectionTeams[0];
                            const termLabel = first?.term
                                ? `เทอม ${first.term.semester}/${first.term.academicYear}`
                                : "";

                            return (
                                <div key={sectionCode} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
                                    {/* Section header */}
                                    <div className="flex items-center gap-3 px-5 py-3.5 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                                        <BookOpen className="w-4 h-4 text-blue-500" />
                                        <span className="font-bold text-gray-800 dark:text-gray-100">{sectionCode}</span>
                                        {termLabel && (
                                            <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-600 px-2 py-0.5 rounded-full">{termLabel}</span>
                                        )}
                                        <span className="ml-auto text-sm text-gray-400">{sectionTeams.length} โครงงาน</span>
                                    </div>
                                    {sectionTeams.map((team) => (
                                        <ProjectRow
                                            key={team.team_id}
                                            team={team}
                                            onApproveClick={() => {
                                                window.location.href = `/advisor-events`;
                                            }}
                                        />
                                    ))}
                                </div>
                            );
                        })
                    )}
                </div>

                {/* ─── Right: Calendar only ─── */}
                <div>
                    {/* ─── Advisor Calendar ─── */}
                    <AdvisorCalendar events={calendarEvents} />
                </div>
            </div>

            {/* ─── Reject Modal ─── */}
            {rejectModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-xl">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">ส่งกลับแก้ไข</h3>
                        <textarea
                            value={rejectFeedback}
                            onChange={(e) => setRejectFeedback(e.target.value)}
                            placeholder="ระบุสิ่งที่ต้องแก้ไข..."
                            className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none h-32 text-sm"
                        />
                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={() => setRejectModalOpen(false)}
                                className="flex-1 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium"
                            >
                                ยกเลิก
                            </button>
                            <button
                                onClick={handleRejectConfirm}
                                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium"
                            >
                                ส่งกลับ
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
