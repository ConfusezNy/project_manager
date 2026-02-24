"use client";

// Student Dashboard - Main dashboard page (Real API)
import { useAuth } from "@/lib/auth-context";
import { useState, useEffect } from "react";
import {
  Loader2,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  Award,
} from "lucide-react";
import {
  TaskStatusChart,
  CalendarMini,
  NotificationPanel,
  ActivityFeed,
} from "@/modules/dashboard";
import type { Activity } from "@/modules/dashboard";
import { SubmitModal } from "@/modules/event";
import {
  useStudentEvents,
  type SubmissionWithEvent,
} from "@/modules/event/hooks/useStudentEvents";
import { api } from "@/lib/api";

// Mock Notifications (can be replaced with real API later)
const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    type: "feedback" as const,
    title: "ความคิดเห็นจากอาจารย์",
    message: "กรุณาเพิ่มผลการทดลองในส่วนบทที่ 4",
    time: "2 ชม.ที่แล้ว",
    read: false,
  },
  {
    id: 2,
    type: "announcement" as const,
    title: "ประกาศระบบ",
    message: "วันสุดท้ายส่งเอกสารขอสอบ 5 มี.ค. 69",
    time: "เมื่อวาน",
    read: false,
  },
  {
    id: 3,
    type: "approval" as const,
    title: "อนุมัติแล้ว",
    message: "รายงาน #2 ผ่านการตรวจสอบ",
    time: "3 วันที่แล้ว",
    read: true,
  },
];

// Mock Activities (can be replaced with real API later)
const MOCK_ACTIVITIES: Activity[] = [
  {
    id: 1,
    type: "submission",
    user: "สมหญิง",
    action: "ส่งงาน",
    target: "รายงานความก้าวหน้า #3",
    time: "2 ชั่วโมงที่แล้ว",
  },
  {
    id: 2,
    type: "comment",
    user: "อ.สมชาย",
    action: "ให้ feedback",
    target: "เพิ่มผลการทดลอง",
    time: "เมื่อวาน",
  },
  {
    id: 3,
    type: "task_update",
    user: "สมศักดิ์",
    action: "อัปเดต Task",
    target: "ทำหน้า Login",
    time: "2 วันที่แล้ว",
  },
];

// Simple Schedule Panel for Dashboard
const DashboardSchedulePanel = ({
  submissions,
  onSubmit,
}: {
  submissions: SubmissionWithEvent[];
  onSubmit: (sub: SubmissionWithEvent) => void;
}) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "APPROVED":
        return {
          icon: CheckCircle,
          color: "text-green-500",
          bgColor: "bg-green-100 dark:bg-green-900/30",
          label: "ผ่านแล้ว",
        };
      case "SUBMITTED":
        return {
          icon: Clock,
          color: "text-blue-500",
          bgColor: "bg-blue-100 dark:bg-blue-900/30",
          label: "รอตรวจ",
        };
      case "NEEDS_REVISION":
        return {
          icon: AlertTriangle,
          color: "text-yellow-500",
          bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
          label: "ต้องแก้ไข",
        };
      default:
        return {
          icon: Clock,
          color: "text-gray-400",
          bgColor: "bg-gray-100 dark:bg-gray-700",
          label: "ยังไม่ส่ง",
        };
    }
  };

  const approvedCount = submissions.filter(
    (s) => s.status === "APPROVED",
  ).length;
  const progressPercent =
    submissions.length > 0
      ? Math.round((approvedCount / submissions.length) * 100)
      : 0;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString("th-TH", { day: "numeric", month: "short" });
  };

  // Sort by event order
  const sortedSubmissions = [...submissions].sort(
    (a, b) => (a.Event?.order || 0) - (b.Event?.order || 0),
  );

  if (submissions.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 h-full flex items-center justify-center">
        <div className="text-center">
          <Calendar
            size={40}
            className="text-gray-300 dark:text-gray-600 mx-auto mb-3"
          />
          <p className="text-gray-500 dark:text-gray-400">ยังไม่มีกำหนดการ</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 h-full flex flex-col">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
        📅 ตารางเวลา / กิจกรรม
      </h3>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            ความคืบหน้า
          </span>
          <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
            {progressPercent}%
          </span>
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
          const {
            icon: Icon,
            color,
            bgColor,
            label,
          } = getStatusConfig(sub.status);
          const isLast = index === Math.min(sortedSubmissions.length, 5) - 1;

          return (
            <div key={sub.submission_id} className="relative flex gap-3">
              {/* Timeline line */}
              {!isLast && (
                <div className="absolute left-3 top-8 w-0.5 h-full bg-gray-200 dark:bg-gray-700" />
              )}

              {/* Status icon */}
              <div
                className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center ${bgColor}`}
              >
                <Icon size={14} className={color} />
              </div>

              {/* Event card */}
              <button
                onClick={() => onSubmit(sub)}
                className="flex-1 text-left p-2.5 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
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
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${bgColor} ${color}`}
                  >
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

export default function StudentDashboardPage() {
  const { user, status } = useAuth();
  const { submissions, loading, error, submitWork } = useStudentEvents();

  const [taskStats, setTaskStats] = useState({
    todo: 0,
    inProgress: 0,
    done: 0,
  });

  // Submit modal state
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] =
    useState<SubmissionWithEvent | null>(null);

  // Fetch task stats
  useEffect(() => {
    const fetchTaskStats = async () => {
      try {
        const tasks = await api.get("/tasks/my-tasks");
        if (Array.isArray(tasks)) {
          const todo = tasks.filter((t: any) => t.status === "TODO").length;
          const inProgress = tasks.filter(
            (t: any) => t.status === "IN_PROGRESS",
          ).length;
          const done = tasks.filter((t: any) => t.status === "DONE").length;
          setTaskStats({ todo, inProgress, done });
        }
      } catch (err) {
        console.error("Error fetching tasks:", err);
      }
    };

    if (status === "authenticated") {
      fetchTaskStats();
    }
  }, [status]);

  // Fetch student grade
  const [myGrades, setMyGrades] = useState<
    Array<{
      grade_id: number;
      score: string;
      Project: { projectname: string };
      Term: { semester: number; academicYear: number };
      Users_Grade_evaluator_idToUsers: {
        firstname: string;
        lastname: string;
        titles?: string;
      };
    }>
  >([]);

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const data = await api.get<any[]>(
          `/grades?student_id=${user?.users_id}`,
        );
        if (data) setMyGrades(data);
      } catch (err) {
        console.error("Error fetching grades:", err);
      }
    };
    if (status === "authenticated" && user?.users_id) {
      fetchGrades();
    }
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

  // Calendar highlighted dates
  const highlightedDates = submissions
    .filter((s) => s.Event?.dueDate)
    .map((s) => ({
      date: new Date(s.Event!.dueDate!),
      color: s.status === "APPROVED" ? "#22c55e" : "#f59e0b",
      label: s.Event?.name || "",
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          ภาพรวม
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          ติดตามความคืบหน้าโครงงานของคุณ
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-700 dark:text-amber-400">
          ⚠️ {error}
        </div>
      )}

      {/* Top Row: Schedule + Calendar + Notifications (3 columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4">
        {/* Schedule Panel - 5 cols */}
        <div className="lg:col-span-5">
          <DashboardSchedulePanel
            submissions={submissions}
            onSubmit={handleSubmit}
          />
        </div>

        {/* Calendar - 3 cols */}
        <div className="lg:col-span-3">
          <CalendarMini highlightedDates={highlightedDates} />
        </div>

        {/* Notifications - 4 cols */}
        <div className="lg:col-span-4">
          <NotificationPanel notifications={MOCK_NOTIFICATIONS} />
        </div>
      </div>

      {/* Bottom Row: Task Status Chart + Activity Feed */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Donut Chart */}
        <TaskStatusChart
          todoCount={taskStats.todo}
          inProgressCount={taskStats.inProgress}
          doneCount={taskStats.done}
        />

        {/* Activity Feed */}
        <ActivityFeed activities={MOCK_ACTIVITIES} />

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
                  g.score === "A"
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                    : g.score.startsWith("B")
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                      : g.score.startsWith("C")
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                        : g.score === "F"
                          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
                return (
                  <div
                    key={g.grade_id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        {g.Project?.projectname}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        เทอม {g.Term?.semester}/{g.Term?.academicYear}
                      </p>
                    </div>
                    <span
                      className={`text-lg font-bold px-3 py-1 rounded-lg ${gradeColor}`}
                    >
                      {gradeLabel}
                    </span>
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
}
