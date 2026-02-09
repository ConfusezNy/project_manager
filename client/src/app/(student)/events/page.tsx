"use client";

// Student Events Page - Widget Dashboard Style
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import {
  Loader2,
  Clock,
  CheckCircle2,
  ArrowRight,
  Calendar,
  Award,
  ChevronRight,
  AlertCircle,
  Lock,
} from "lucide-react";
import { SubmitModal } from "@/modules/event";
import type { Event, Submission } from "@/modules/event";
import { projectService } from "@/modules/team/services/projectService";
import { teamService } from "@/modules/team/services/teamService";

// Mock Events with weight
const MOCK_EVENTS: Event[] = [
  {
    event_id: 1,
    name: "สอบหัวข้อโครงงาน (Project Proposal)",
    type: "DOCUMENT",
    order: 1,
    dueDate: "2024-08-15T23:59:59Z",
    section_id: 1,
    createdAt: "2024-06-01T00:00:00Z",
    weight: 20,
  },
  {
    event_id: 2,
    name: "รายงานความก้าวหน้าครั้งที่ 1 (Progress 1)",
    type: "PROGRESS_REPORT",
    order: 2,
    dueDate: "2024-09-10T23:59:59Z",
    section_id: 1,
    createdAt: "2024-06-01T00:00:00Z",
    weight: 10,
  },
  {
    event_id: 3,
    name: "รายงานความก้าวหน้าครั้งที่ 2 (Progress 2)",
    type: "PROGRESS_REPORT",
    order: 3,
    dueDate: "2024-10-15T23:59:59Z",
    section_id: 1,
    createdAt: "2024-06-01T00:00:00Z",
    weight: 10,
  },
  {
    event_id: 4,
    name: "ส่งเล่มปริญญานิพนธ์ฉบับสมบูรณ์ (Final Report)",
    type: "FINAL_SUBMISSION",
    order: 4,
    dueDate: "2024-11-20T23:59:59Z",
    section_id: 1,
    createdAt: "2024-06-01T00:00:00Z",
    weight: 30,
  },
  {
    event_id: 5,
    name: "สอบป้องกันปริญญานิพนธ์ (Final Defense)",
    type: "EXAM",
    order: 5,
    dueDate: "2024-11-30T23:59:59Z",
    section_id: 1,
    createdAt: "2024-06-01T00:00:00Z",
    weight: 30,
  },
];

// Mock Submissions
const MOCK_SUBMISSIONS: Submission[] = [
  {
    submission_id: 1,
    event_id: 1,
    team_id: 1,
    status: "APPROVED",
    createdAt: "2024-08-14T00:00:00Z",
    submittedAt: "2024-08-14T10:00:00Z",
  },
  {
    submission_id: 2,
    event_id: 2,
    team_id: 1,
    status: "NEEDS_REVISION",
    feedback: "กรุณาเพิ่มรายละเอียดในส่วนของ System Architecture",
    createdAt: "2024-09-09T00:00:00Z",
    submittedAt: "2024-09-09T15:00:00Z",
  },
  {
    submission_id: 3,
    event_id: 3,
    team_id: 1,
    status: "SUBMITTED",
    createdAt: "2024-10-14T00:00:00Z",
    submittedAt: "2024-10-14T16:00:00Z",
  },
  {
    submission_id: 4,
    event_id: 4,
    team_id: 1,
    status: "PENDING",
    createdAt: "2024-06-01T00:00:00Z",
  },
  {
    submission_id: 5,
    event_id: 5,
    team_id: 1,
    status: "PENDING",
    createdAt: "2024-06-01T00:00:00Z",
  },
];

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

export default function StudentEventsPage() {
  const { status } = useSession();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [accessError, setAccessError] = useState<string | null>(null);

  // Submit modal
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  useEffect(() => {
    const checkProjectAccess = async () => {
      try {
        // Get user's team
        const team = await teamService.getMyTeam();
        if (!team) {
          setAccessError("คุณยังไม่มีทีม กรุณาสร้างทีมก่อน");
          setLoading(false);
          return;
        }

        // Get project for this team
        const projectData = await projectService.getProjectByTeamId(
          team.team_id,
        );
        if (!projectData) {
          setAccessError(
            "ทีมของคุณยังไม่มีโครงงาน กรุณาสร้างหัวข้อโครงงานก่อน",
          );
          setLoading(false);
          return;
        }

        // Check if project is approved
        if (projectData.status !== "APPROVED") {
          setAccessError("โครงงานของคุณยังไม่ได้รับการอนุมัติจากอาจารย์");
          setLoading(false);
          return;
        }

        // Project approved - load events
        setEvents(MOCK_EVENTS);
        setSubmissions(MOCK_SUBMISSIONS);
        setLoading(false);
      } catch (err: any) {
        setAccessError(err.message || "เกิดข้อผิดพลาด");
        setLoading(false);
      }
    };

    if (status === "authenticated") {
      checkProjectAccess();
    }
  }, [status]);

  const getSubmission = (eventId: number) => {
    return submissions.find((s) => s.event_id === eventId);
  };

  const getEventStatus = (eventId: number) => {
    const sub = getSubmission(eventId);
    return sub?.status || "PENDING";
  };

  // Calculate progress
  const approvedCount = events.filter(
    (e) => getEventStatus(e.event_id) === "APPROVED",
  ).length;
  const totalProgress =
    events.length > 0 ? Math.round((approvedCount / events.length) * 100) : 0;

  // Find current/next event (first non-approved)
  const currentEventIndex = events.findIndex(
    (e) => getEventStatus(e.event_id) !== "APPROVED",
  );
  const currentEvent =
    currentEventIndex >= 0 ? events[currentEventIndex] : null;

  const handleSubmit = (event: Event) => {
    setSelectedEvent(event);
    setSubmitModalOpen(true);
  };

  const handleSubmitWork = async () => {
    if (!selectedEvent) return;
    const sub = getSubmission(selectedEvent.event_id);
    if (sub) {
      setSubmissions((prev) =>
        prev.map((s) =>
          s.submission_id === sub.submission_id
            ? {
                ...s,
                status: "SUBMITTED" as const,
                submittedAt: new Date().toISOString(),
              }
            : s,
        ),
      );
    }
    setSubmitModalOpen(false);
  };

  const formatThaiDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear() + 543}`;
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Error state - project not approved
  if (accessError) {
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
          <p className="text-gray-500 dark:text-gray-400 mb-6">{accessError}</p>
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
                {currentEvent?.name || "ไม่มีงานค้าง 🎉"}
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
                onClick={() => handleSubmit(currentEvent)}
                className="mt-6 w-fit bg-white text-blue-600 px-6 py-2.5 rounded-lg font-bold shadow-sm hover:bg-blue-50 transition flex items-center gap-2"
              >
                ส่งงานตอนนี้ <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Events List */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
        <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200 mb-4">
          รายการทั้งหมด
        </h3>
        <div className="space-y-2">
          {events.map((event, index) => {
            const eventStatus = getEventStatus(event.event_id);
            const isApproved = eventStatus === "APPROVED";
            const isRevision = eventStatus === "NEEDS_REVISION";

            return (
              <div
                key={event.event_id}
                onClick={() => handleSubmit(event)}
                className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl cursor-pointer transition border-b border-gray-50 dark:border-gray-700 last:border-0"
              >
                <div className="flex items-center gap-4">
                  {/* Number/Check Circle */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                      isApproved
                        ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                        : "bg-slate-100 text-slate-400 dark:bg-slate-700 dark:text-slate-500"
                    }`}
                  >
                    {isApproved ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      index + 1
                    )}
                  </div>

                  {/* Event Info */}
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-800 dark:text-gray-200">
                        {event.name}
                      </p>
                      {isRevision && (
                        <AlertCircle className="w-4 h-4 text-rose-500" />
                      )}
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {formatThaiDate(event.dueDate)}
                    </p>
                  </div>
                </div>

                {/* Status Badge */}
                <StatusBadge status={eventStatus} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Submit Modal */}
      <SubmitModal
        isOpen={submitModalOpen}
        onClose={() => setSubmitModalOpen(false)}
        onSubmit={handleSubmitWork}
        eventName={selectedEvent?.name || ""}
      />
    </div>
  );
}
