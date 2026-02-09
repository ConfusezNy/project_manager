"use client";

// Student Dashboard - Main dashboard page
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  TaskStatusChart,
  CalendarMini,
  NotificationPanel,
  SchedulePanel,
  ActivityFeed,
} from "@/modules/dashboard";
import type { Activity } from "@/modules/dashboard";
import { SubmitModal } from "@/modules/event";
import type { Event, Submission } from "@/modules/event";

// Mock Events
const MOCK_EVENTS: Event[] = [
  {
    event_id: 1,
    name: "รายงานความก้าวหน้า #1",
    type: "PROGRESS_REPORT",
    order: 1,
    dueDate: "2024-12-11T23:59:59Z",
    section_id: 1,
    createdAt: "2024-11-01T00:00:00Z",
  },
  {
    event_id: 2,
    name: "รายงานความก้าวหน้า #2",
    type: "PROGRESS_REPORT",
    order: 2,
    dueDate: "2025-01-08T23:59:59Z",
    section_id: 1,
    createdAt: "2024-11-01T00:00:00Z",
  },
  {
    event_id: 3,
    name: "รายงานความก้าวหน้า #3",
    type: "PROGRESS_REPORT",
    order: 3,
    dueDate: "2025-02-05T23:59:59Z",
    section_id: 1,
    createdAt: "2024-11-01T00:00:00Z",
  },
  {
    event_id: 4,
    name: "เอกสารขอสอบ + โปสเตอร์",
    type: "DOCUMENT",
    order: 4,
    dueDate: "2025-03-05T23:59:59Z",
    section_id: 1,
    createdAt: "2024-11-01T00:00:00Z",
  },
  {
    event_id: 5,
    name: "สอบปริญญานิพนธ์",
    type: "EXAM",
    order: 5,
    dueDate: "2025-03-13T23:59:59Z",
    section_id: 1,
    createdAt: "2024-11-01T00:00:00Z",
  },
  {
    event_id: 6,
    name: "ส่งไฟล์ฉบับสมบูรณ์",
    type: "FINAL_SUBMISSION",
    order: 6,
    dueDate: "2025-03-20T23:59:59Z",
    section_id: 1,
    createdAt: "2024-11-01T00:00:00Z",
  },
];

// Mock Submissions
const MOCK_SUBMISSIONS: Submission[] = [
  {
    submission_id: 1,
    event_id: 1,
    team_id: 1,
    status: "APPROVED",
    createdAt: "2024-11-01T00:00:00Z",
  },
  {
    submission_id: 2,
    event_id: 2,
    team_id: 1,
    status: "APPROVED",
    createdAt: "2024-11-01T00:00:00Z",
  },
  {
    submission_id: 3,
    event_id: 3,
    team_id: 1,
    status: "NEEDS_REVISION",
    feedback: "กรุณาเพิ่มผลการทดลอง",
    createdAt: "2024-11-01T00:00:00Z",
  },
  {
    submission_id: 4,
    event_id: 4,
    team_id: 1,
    status: "PENDING",
    createdAt: "2024-11-01T00:00:00Z",
  },
  {
    submission_id: 5,
    event_id: 5,
    team_id: 1,
    status: "PENDING",
    createdAt: "2024-11-01T00:00:00Z",
  },
  {
    submission_id: 6,
    event_id: 6,
    team_id: 1,
    status: "PENDING",
    createdAt: "2024-11-01T00:00:00Z",
  },
];

// Mock Notifications
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

// Mock Activities
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
  {
    id: 4,
    type: "task_create",
    user: "สมชาย",
    action: "สร้าง Task",
    target: "API Authentication",
    time: "3 วันที่แล้ว",
  },
  {
    id: 5,
    type: "approval",
    user: "อ.สมชาย",
    action: "อนุมัติ",
    target: "รายงาน #2",
    time: "สัปดาห์ที่แล้ว",
  },
];

export default function StudentDashboardPage() {
  const { status } = useSession();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [taskStats] = useState({ todo: 2, inProgress: 3, done: 8 });

  // Submit modal state
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [selectedEventName, setSelectedEventName] = useState("");
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<
    number | null
  >(null);

  useEffect(() => {
    if (status === "authenticated") {
      setTimeout(() => {
        setEvents(MOCK_EVENTS);
        setSubmissions(MOCK_SUBMISSIONS);
        setLoading(false);
      }, 500);
    }
  }, [status]);

  const handleSubmit = (eventId: number, submissionId: number) => {
    const event = events.find((e) => e.event_id === eventId);
    if (event) {
      setSelectedEventName(event.name);
      setSelectedSubmissionId(submissionId);
      setSubmitModalOpen(true);
    }
  };

  const handleSubmitWork = async () => {
    if (!selectedSubmissionId) return;
    setSubmissions((prev) =>
      prev.map((s) =>
        s.submission_id === selectedSubmissionId
          ? {
              ...s,
              status: "SUBMITTED" as const,
              submittedAt: new Date().toISOString(),
            }
          : s,
      ),
    );
    setSubmitModalOpen(false);
  };

  // Calendar highlighted dates
  const highlightedDates = events
    .filter((e) => e.dueDate)
    .map((e) => ({
      date: new Date(e.dueDate!),
      color:
        submissions.find((s) => s.event_id === e.event_id)?.status ===
        "APPROVED"
          ? "#22c55e"
          : "#f59e0b",
      label: e.name,
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

      {/* Top Row: Schedule + Calendar + Notifications (3 columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4">
        {/* Schedule Panel - 5 cols */}
        <div className="lg:col-span-5">
          <SchedulePanel
            events={events}
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

        {/* Activity Feed (replacing EventProgressChart) */}
        <ActivityFeed activities={MOCK_ACTIVITIES} />
      </div>

      {/* Submit Modal */}
      <SubmitModal
        isOpen={submitModalOpen}
        onClose={() => setSubmitModalOpen(false)}
        onSubmit={handleSubmitWork}
        eventName={selectedEventName}
      />
    </div>
  );
}
