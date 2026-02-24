"use client";

// Advisor Dashboard - Overview of teams I advise
import { useAuth } from "@/lib/auth-context";
import { useState } from "react";
import {
  Loader2,
  Users,
  Clock,
  Calendar,
  CheckCircle,
  ChevronRight,
  FileCheck,
  X,
} from "lucide-react";
import { useAdvisorDashboard } from "@/modules/dashboard/hooks/useAdvisorDashboard";

// Stat Card
const StatCard = ({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: any;
  label: string;
  value: number;
  color: string;
}) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
    <div className="flex items-center gap-4">
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}
      >
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">
          {value}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      </div>
    </div>
  </div>
);

// Team Card with Progress
const TeamCard = ({
  team,
  onClick,
}: {
  team: {
    team_id: number;
    name: string;
    projectTitle?: string;
    section_code: string;
    memberCount: number;
    progressPercent: number;
    submittedCount: number;
  };
  onClick: () => void;
}) => {
  const getProgressColor = (percent: number) => {
    if (percent === 100) return "bg-green-500";
    if (percent >= 70) return "bg-blue-500";
    if (percent >= 40) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition"
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="font-bold text-gray-900 dark:text-white">
            {team.name}
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {team.projectTitle || "ยังไม่มีหัวข้อ"}
          </p>
        </div>
        <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
          {team.section_code}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-2">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-gray-500 dark:text-gray-400">ความคืบหน้า</span>
          <span className="font-medium text-gray-700 dark:text-gray-300">
            {team.progressPercent}%
          </span>
        </div>
        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full ${getProgressColor(team.progressPercent)} transition-all`}
            style={{ width: `${team.progressPercent}%` }}
          />
        </div>
      </div>

      {/* Meta */}
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span className="flex items-center gap-1">
          <Users className="w-3 h-3" /> {team.memberCount} คน
        </span>
        {team.submittedCount > 0 && (
          <span className="text-blue-600 dark:text-blue-400 flex items-center gap-1">
            <Clock className="w-3 h-3" /> {team.submittedCount} รอตรวจ
          </span>
        )}
      </div>
    </button>
  );
};

// Pending Submission Item
const PendingItem = ({
  submission,
  onApprove,
  onReject,
}: {
  submission: {
    submission_id: number;
    team_name: string;
    event_name: string;
    submittedAt?: string;
  };
  onApprove: () => void;
  onReject: () => void;
}) => {
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
          {submission.team_name}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {submission.event_name} • {formatDate(submission.submittedAt)}
        </p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onApprove}
          className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition"
          title="อนุมัติ"
        >
          <CheckCircle className="w-4 h-4" />
        </button>
        <button
          onClick={onReject}
          className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition"
          title="ปฏิเสธ"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default function AdvisorDashboardPage() {
  const { user, status: authStatus } = useAuth();
  const {
    loading,
    error,
    teams,
    pendingSubmissions,
    upcomingDeadlines,
    stats,
    approveSubmission,
    rejectSubmission,
  } = useAdvisorDashboard();

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<number | null>(null);
  const [rejectFeedback, setRejectFeedback] = useState("");

  const handleApprove = async (submissionId: number) => {
    const result = await approveSubmission(submissionId);
    if (!result.success) {
      alert("เกิดข้อผิดพลาด: " + result.error);
    }
  };

  const handleRejectClick = (submissionId: number) => {
    setRejectTarget(submissionId);
    setRejectFeedback("");
    setRejectModalOpen(true);
  };

  const handleRejectConfirm = async () => {
    if (!rejectTarget) return;
    const result = await rejectSubmission(rejectTarget, rejectFeedback);
    if (result.success) {
      setRejectModalOpen(false);
    } else {
      alert("เกิดข้อผิดพลาด: " + result.error);
    }
  };

  if (authStatus === "loading" || loading) {
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
          สวัสดี, อ.{user?.firstname || "Advisor"}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Dashboard อาจารย์ที่ปรึกษา
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400">
          ⚠️ {error}
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard
          icon={Users}
          label="ทีมที่ดูแล"
          value={stats.teamsCount}
          color="bg-blue-500"
        />
        <StatCard
          icon={FileCheck}
          label="รอตรวจ"
          value={stats.pendingCount}
          color="bg-amber-500"
        />
        <StatCard
          icon={Calendar}
          label="Deadline ใกล้ถึง"
          value={stats.upcomingCount}
          color="bg-purple-500"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Teams List - 2 columns */}
        <div className="lg:col-span-2">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
            🎓 ทีมที่ดูแล ({teams.length})
          </h3>
          {teams.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center text-gray-400 border border-gray-100 dark:border-gray-700">
              ยังไม่มีทีมที่ดูแล
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {teams.map((team) => (
                <TeamCard
                  key={team.team_id}
                  team={team}
                  onClick={() => (window.location.href = `/advisorteams`)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Pending Submissions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
              📝 รอตรวจ ({pendingSubmissions.length})
            </h3>
            {pendingSubmissions.length === 0 ? (
              <div className="text-center text-gray-400 py-4">
                ไม่มีงานรอตรวจ
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {pendingSubmissions.map((sub) => (
                  <PendingItem
                    key={sub.submission_id}
                    submission={sub}
                    onApprove={() => handleApprove(sub.submission_id)}
                    onReject={() => handleRejectClick(sub.submission_id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Deadlines */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
              ⏰ Deadline ใกล้ถึง
            </h3>
            {upcomingDeadlines.length === 0 ? (
              <div className="text-center text-gray-400 py-4">
                ไม่มี Deadline ใน 14 วันนี้
              </div>
            ) : (
              <div className="space-y-2">
                {upcomingDeadlines.map((deadline) => (
                  <div
                    key={deadline.event_id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        {deadline.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {deadline.section_code}
                      </p>
                    </div>
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${deadline.daysLeft <= 3
                        ? "bg-red-100 text-red-600 dark:bg-red-900/30"
                        : "bg-amber-100 text-amber-600 dark:bg-amber-900/30"
                        }`}
                    >
                      {deadline.daysLeft === 0
                        ? "วันนี้"
                        : `อีก ${deadline.daysLeft} วัน`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              ส่งกลับแก้ไข
            </h3>
            <textarea
              value={rejectFeedback}
              onChange={(e) => setRejectFeedback(e.target.value)}
              placeholder="ระบุเหตุผลหรือสิ่งที่ต้องแก้ไข..."
              className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none h-32"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setRejectModalOpen(false)}
                className="flex-1 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleRejectConfirm}
                className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                ส่งกลับ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
