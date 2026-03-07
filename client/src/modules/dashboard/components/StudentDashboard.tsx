"use client";

import React, { useState, useEffect } from "react";
import {
    Loader2,
    Calendar,
    CheckCircle,
    Clock,
    AlertTriangle,
    Award,
    User,
    BookOpen,
    Users,
    FolderOpen,
    GraduationCap,
    Hash,
} from "lucide-react";
import {
    TaskStatusChart,
    CalendarMini,
    ActivityFeed,
} from "@/modules/dashboard";
import type { Activity } from "@/modules/dashboard";
import { SubmitModal } from "@/modules/event";
import {
    useStudentEvents,
    type SubmissionWithEvent,
} from "@/modules/event/hooks/useStudentEvents";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

// ไม่มี MOCK_ACTIVITIES แล้ว — ใช้ข้อมูลจริงจาก submissions

// ─────────────────────────────────────────────────────────
// Student Info Card — replaces NotificationPanel
// Shows real data: name, section, term, team, project
// ─────────────────────────────────────────────────────────
interface StudentContext {
    section_code?: string;
    course_type?: string;
    term?: { semester: number; academicYear: number };
    team?: { groupNumber: string; team_id: number } | null;
    project?: { projectname: string; status: string; project_id?: number } | null;
}

// ผลลัพธ์เวลา relative
const formatRelativeTime = (dateStr?: string): string => {
    if (!dateStr) return "—";
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return "เพิ่งเกิดขึ้น";
    if (mins < 60) return `${mins} นาทีที่แล้ว`;
    if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`;
    if (days === 1) return "เมื่อวาน";
    return `${days} วันที่แล้ว`;
};

// ─────────────────────────────────────────────────────────
// Student Info Card — replaces NotificationPanel
// Shows real data: name, section, term, team, project
// ─────────────────────────────────────────────────────────

const StudentInfoCard = ({
    user,
    context,
    loading,
}: {
    user: any;
    context: StudentContext | null;
    loading: boolean;
}) => {
    const courseTypeLabel: Record<string, string> = {
        PROJECT: "โปรเจกต์",
        PRE_PROJECT: "เตรียมโปรเจกต์",
        THESIS: "วิทยานิพนธ์",
        COOPERATIVE: "สหกิจ",
    };

    const projectStatusColor: Record<string, string> = {
        DRAFT: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
        PENDING: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
        APPROVED: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
        REJECTED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    };
    const projectStatusLabel: Record<string, string> = {
        DRAFT: "ร่าง",
        PENDING: "รออนุมัติ",
        APPROVED: "อนุมัติแล้ว",
        REJECTED: "ถูกปฏิเสธ",
    };

    const displayName = [user?.titles, user?.firstname, user?.lastname]
        .filter(Boolean)
        .join(" ");


    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 h-full flex flex-col">
            {/* Header row — ชื่อ + รหัส */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-700">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-lg flex-shrink-0 select-none">
                    {user?.firstname?.[0] || <User className="w-5 h-5" />}
                </div>
                <div className="min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm leading-tight truncate">
                        {displayName || "นักศึกษา"}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{user?.users_id || "—"}</p>
                </div>
            </div>

            {/* Info rows */}
            <div className="flex-1 divide-y divide-gray-100 dark:divide-gray-700 overflow-auto">
                {loading ? (
                    <div className="flex items-center justify-center py-10">
                        <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                    </div>
                ) : (
                    <>
                        {/* Section / Term */}
                        <div className="flex items-center gap-3 px-4 py-3">
                            <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                                <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs text-gray-400 dark:text-gray-500">หมู่เรียน / วิชา</p>
                                <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">
                                    {context?.section_code
                                        ? `${context.section_code} · ${courseTypeLabel[context.course_type ?? ""] ?? context.course_type}`
                                        : <span className="text-gray-400 font-normal">ยังไม่ได้ลงทะเบียน</span>}
                                </p>
                            </div>
                        </div>

                        {/* Semester / Year */}
                        <div className="flex items-center gap-3 px-4 py-3">
                            <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
                                <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs text-gray-400 dark:text-gray-500">ภาคเรียน / ปีการศึกษา</p>
                                <p className="text-sm font-semibold text-gray-800 dark:text-white">
                                    {context?.term
                                        ? `เทอม ${context.term.semester} / ${context.term.academicYear}`
                                        : <span className="text-gray-400 font-normal">—</span>}
                                </p>
                            </div>
                        </div>

                        {/* Team */}
                        <div className="flex items-center gap-3 px-4 py-3">
                            <div className="w-7 h-7 rounded-lg bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center flex-shrink-0">
                                <Users className="w-3.5 h-3.5 text-violet-500" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs text-gray-400 dark:text-gray-500">กลุ่ม</p>
                                <p className="text-sm font-semibold text-gray-800 dark:text-white">
                                    {context?.team
                                        ? <>กลุ่ม {context.team.groupNumber}</>
                                        : <span className="text-gray-400 font-normal">ยังไม่มีกลุ่ม</span>}
                                </p>
                            </div>
                        </div>

                        {/* Project */}
                        <div className="flex items-center gap-3 px-4 py-3">
                            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                                <FolderOpen className="w-3.5 h-3.5 text-emerald-500" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-xs text-gray-400 dark:text-gray-500">โครงงาน</p>
                                {context?.project ? (
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <p className="text-sm font-semibold text-gray-800 dark:text-white truncate flex-1">
                                            {context.project.projectname}
                                        </p>
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${projectStatusColor[context.project.status] ?? ""}`}>
                                            {projectStatusLabel[context.project.status] ?? context.project.status}
                                        </span>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-400 font-normal">ยังไม่มีโครงงาน</p>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────
// Schedule Panel
// ─────────────────────────────────────────────────────────
const DashboardSchedulePanel = ({
    submissions,
    onSubmit,
    highlightedSubmissionId,
}: {
    submissions: SubmissionWithEvent[];
    onSubmit: (sub: SubmissionWithEvent) => void;
    highlightedSubmissionId?: number | null;
}) => {
    const getStatusConfig = (status: string) => {
        switch (status) {
            case "APPROVED":
                return { icon: CheckCircle, color: "text-green-500", bgColor: "bg-green-100 dark:bg-green-900/30", label: "ผ่านแล้ว" };
            case "SUBMITTED":
                return { icon: Clock, color: "text-blue-500", bgColor: "bg-blue-100 dark:bg-blue-900/30", label: "รอตรวจ" };
            case "NEEDS_REVISION":
                return { icon: AlertTriangle, color: "text-yellow-500", bgColor: "bg-yellow-100 dark:bg-yellow-900/30", label: "ต้องแก้ไข" };
            default:
                return { icon: Clock, color: "text-gray-400", bgColor: "bg-gray-100 dark:bg-gray-700", label: "ยังไม่ส่ง" };
        }
    };

    const approvedCount = submissions.filter((s) => s.status === "APPROVED").length;
    const progressPercent = submissions.length > 0
        ? Math.round((approvedCount / submissions.length) * 100)
        : 0;

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return "-";
        return new Date(dateStr).toLocaleDateString("th-TH", { day: "numeric", month: "short" });
    };

    const sortedSubmissions = [...submissions].sort((a, b) => {
        const da = a.Event?.dueDate ? new Date(a.Event.dueDate).getTime() : Infinity;
        const db = b.Event?.dueDate ? new Date(b.Event.dueDate).getTime() : Infinity;
        return da - db;
    });

    if (submissions.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 h-full flex items-center justify-center">
                <div className="text-center">
                    <Calendar size={40} className="text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">ยังไม่มีกำหนดการ</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 h-full flex flex-col">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <Calendar size={16} className="text-blue-500" />
                ตารางเวลา / กิจกรรม
            </h3>

            {/* Progress Bar */}
            <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-gray-500 dark:text-gray-400">ความคืบหน้า</span>
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{progressPercent}%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            </div>

            {/* Submissions Timeline */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {sortedSubmissions.slice(0, 5).map((sub, index) => {
                    const { icon: Icon, color, bgColor, label } = getStatusConfig(sub.status);
                    const isLast = index === Math.min(sortedSubmissions.length, 5) - 1;

                    return (
                        <div
                            key={sub.submission_id}
                            id={`schedule-row-${sub.submission_id}`}
                            className="relative flex gap-3"
                        >
                            {!isLast && (
                                <div className="absolute left-3 top-8 w-0.5 h-full bg-gray-200 dark:bg-gray-700" />
                            )}
                            <div className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center ${bgColor}`}>
                                <Icon size={14} className={color} />
                            </div>
                            <button
                                onClick={() => sub.Event?.requireFile && sub.status !== "APPROVED" && onSubmit(sub)}
                                className={`flex-1 text-left p-2.5 rounded-lg transition-all duration-300 ${highlightedSubmissionId === sub.submission_id
                                    ? "bg-blue-100 dark:bg-blue-900/40 ring-2 ring-blue-400 animate-pulse"
                                    : "bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    } ${sub.Event?.requireFile && sub.status !== "APPROVED" ? "cursor-pointer" : "cursor-default"}`}
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                                            {sub.Event?.name || "Unknown"}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                            {formatDate(sub.Event?.dueDate)}
                                        </p>
                                    </div>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${bgColor} ${color}`}>
                                        {label}
                                    </span>
                                </div>
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────
// StudentDashboard
// ─────────────────────────────────────────────────────────
export const StudentDashboard: React.FC = () => {
    const { user, status } = useAuth();
    const { submissions, loading, error, submitWork } = useStudentEvents();

    // เฉพาะ events ที่ต้องอัพโหลดไฟล์เท่านั้น ใช้ใน progress bar + schedule
    const docSubmissions = submissions.filter((s) => s.Event?.requireFile === true);

    const [taskStats, setTaskStats] = useState({ todo: 0, inProgress: 0, inReview: 0, done: 0 });

    // Student context state (section, team, project)
    const [studentContext, setStudentContext] = useState<StudentContext | null>(null);
    const [contextLoading, setContextLoading] = useState(true);

    // Submit modal state
    const [submitModalOpen, setSubmitModalOpen] = useState(false);
    const [selectedSubmission, setSelectedSubmission] = useState<SubmissionWithEvent | null>(null);

    // เพิ่ม: highlighted submission id เมื่อคลิกปฏิทิน
    const [highlightedSubmissionId, setHighlightedSubmissionId] = useState<number | null>(null);

    // Fetch task stats — ใช้ project_id จาก student context
    useEffect(() => {
        const fetchTaskStats = async () => {
            const projectId = studentContext?.project?.project_id;
            if (!projectId) return;
            try {
                const tasks = await api.get(`/tasks?project_id=${projectId}`);
                if (Array.isArray(tasks)) {
                    setTaskStats({
                        todo: tasks.filter((t: any) => t.status === "TODO").length,
                        inProgress: tasks.filter((t: any) => t.status === "IN_PROGRESS").length,
                        inReview: tasks.filter((t: any) => t.status === "IN_REVIEW").length,
                        done: tasks.filter((t: any) => t.status === "DONE").length,
                    });
                }
            } catch { /* silent */ }
        };
        if (status === "authenticated" && studentContext) fetchTaskStats();
    }, [status, studentContext]);

    // Fetch student context: section → team → project
    useEffect(() => {
        const fetchContext = async () => {
            setContextLoading(true);
            try {
                // 1. Get my team (includes Section + Term + Project)
                let sectionCode: string | undefined;
                let courseType: string | undefined;
                let term: StudentContext["term"];
                let team: StudentContext["team"] = null;
                let project: StudentContext["project"] = null;

                try {
                    // member.Team.Section.Term, member.Team.Project
                    const member = await api.get<any>("/teams/my-team");
                    if (member?.Team) {
                        const t = member.Team;
                        team = { groupNumber: t.groupNumber, team_id: t.team_id };
                        if (t.Project) {
                            project = {
                                projectname: t.Project.projectname,
                                status: t.Project.status,
                                project_id: t.Project.project_id,
                            };
                        }
                        if (t.Section) {
                            sectionCode = t.Section.section_code;
                            courseType = t.Section.course_type;
                            const termData = t.Section.Term;
                            if (termData) {
                                term = { semester: termData.semester, academicYear: termData.academicYear };
                            }
                        }
                    }
                } catch { /* no team yet */ }

                // 2. Fallback: get section directly if no team
                if (!sectionCode) {
                    try {
                        const sectionData = await api.get<any>("/sections/my-section");
                        sectionCode = sectionData?.section_code;
                        courseType = sectionData?.course_type;
                        const td = sectionData?.Term ?? sectionData?.term;
                        if (td) term = { semester: td.semester, academicYear: td.academicYear };
                    } catch { /* not enrolled */ }
                }

                setStudentContext({ section_code: sectionCode, course_type: courseType, term, team, project });
            } catch {
                setStudentContext({});
            } finally {
                setContextLoading(false);
            }
        };
        if (status === "authenticated") fetchContext();
    }, [status]);


    // Fetch student grade
    const [myGrades, setMyGrades] = useState<Array<{
        grade_id: number;
        score: string;
        Project: { projectname: string };
        Term: { semester: number; academicYear: number };
    }>>([]);

    useEffect(() => {
        const fetchGrades = async () => {
            try {
                const data = await api.get<any[]>(`/grades?student_id=${user?.users_id}`);
                if (data) setMyGrades(data);
            } catch { /* silent */ }
        };
        if (status === "authenticated" && user?.users_id) fetchGrades();
    }, [status, user]);

    const handleSubmit = (sub: SubmissionWithEvent) => {
        setSelectedSubmission(sub);
        setSubmitModalOpen(true);
    };

    const handleSubmitWork = async () => {
        if (!selectedSubmission) return;
        await submitWork(selectedSubmission.submission_id);
        setSubmitModalOpen(false);
    };

    const highlightedDates = docSubmissions
        .filter((s) => s.Event?.dueDate)
        .map((s) => ({
            date: new Date(s.Event!.dueDate!),
            color: s.status === "APPROVED" ? "#22c55e" : "#f59e0b",
            label: s.Event?.name || "",
        }));

    // Calendar click — เพิ่ม handler เชื่อมปฏิทิน → ตารางเวลา
    const handleCalendarDateClick = (date: Date) => {
        const clicked = docSubmissions.find((s) => {
            if (!s.Event?.dueDate) return false;
            const d = new Date(s.Event.dueDate);
            return (
                d.getDate() === date.getDate() &&
                d.getMonth() === date.getMonth() &&
                d.getFullYear() === date.getFullYear()
            );
        });
        if (!clicked) return;
        setHighlightedSubmissionId(clicked.submission_id);
        // scroll to schedule panel + clear after 3s
        document.getElementById(`schedule-row-${clicked.submission_id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => setHighlightedSubmissionId(null), 3000);
    };

    // Real activities จาก submissions
    const recentActivities: Activity[] = [...docSubmissions]
        .filter((s) => s.status !== "PENDING")
        .sort((a, b) => {
            const ta = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
            const tb = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
            return tb - ta;
        })
        .slice(0, 6)
        .map((s) => ({
            id: s.submission_id,
            type: s.status === "APPROVED" ? "approval" as const
                : s.status === "NEEDS_REVISION" ? "revision" as const
                    : "submission" as const,
            user: "คุณ",
            action: s.status === "APPROVED" ? "ได้รับการอนุมัติ"
                : s.status === "NEEDS_REVISION" ? "ถูกขอให้แก้ไข"
                    : "ส่งงานแล้ว",
            target: s.Event?.name ?? "—",
            time: formatRelativeTime(s.submittedAt),
        }));

    if (status === "loading" || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">ภาพรวม</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">ติดตามความคืบหน้าโครงงานของคุณ</p>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="mb-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-700 dark:text-amber-400">
                    {error}
                </div>
            )}

            {/* Top Row: StudentInfoCard + Calendar + Schedule */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4">
                {/* Student Info Card - 5 cols */}
                <div className="lg:col-span-5">
                    <StudentInfoCard user={user} context={studentContext} loading={contextLoading} />
                </div>

                {/* Calendar - 3 cols */}
                <div className="lg:col-span-3">
                    <CalendarMini
                        highlightedDates={highlightedDates}
                        onDateClick={handleCalendarDateClick}
                    />
                </div>

                {/* Schedule Panel - 4 cols */}
                <div className="lg:col-span-4">
                    <DashboardSchedulePanel
                        submissions={docSubmissions}
                        onSubmit={handleSubmit}
                        highlightedSubmissionId={highlightedSubmissionId}
                    />
                </div>
            </div>

            {/* Bottom Row: Task Status Chart + Activity Feed */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TaskStatusChart
                    todoCount={taskStats.todo}
                    inProgressCount={taskStats.inProgress}
                    inReviewCount={taskStats.inReview}
                    doneCount={taskStats.done}
                />
                <ActivityFeed activities={recentActivities} />

                {/* Grade Card */}
                {myGrades.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                            <Award className="w-4 h-4 text-amber-500" />
                            ผลการประเมิน
                        </h3>
                        <div className="space-y-3">
                            {myGrades.map((g) => {
                                const gradeLabel = g.score.replace("_PLUS", "+");
                                const gradeColor =
                                    g.score === "A" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                        : g.score.startsWith("B") ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                            : g.score.startsWith("C") ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                                : g.score === "F" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                                    : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
                                return (
                                    <div key={g.grade_id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                        <div>
                                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{g.Project?.projectname}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">เทอม {g.Term?.semester}/{g.Term?.academicYear}</p>
                                        </div>
                                        <span className={`text-lg font-bold px-3 py-1 rounded-lg ${gradeColor}`}>{gradeLabel}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
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
