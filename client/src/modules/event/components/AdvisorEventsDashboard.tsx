"use client";

// AdvisorEventsDashboard - View and manage submissions for each project
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  FileText,
  CheckCircle2,
  XCircle,
  Users,
  Clock,
  Calendar,
  MessageSquare,
  ChevronRight,
  AlertCircle,
  Loader2,
} from "lucide-react";
import Button from "@/app/(components)/Button";

// Types
interface TeamMember {
  user: {
    users_id: string;
    firstname: string;
    lastname: string;
    email: string;
  };
}

interface Section {
  section_id: number;
  section_code: string;
}

interface Team {
  team_id: number;
  name: string;
  groupNumber: string;
  semester: string;
  section: Section;
  members: TeamMember[];
}

interface AdvisorProject {
  project_id: number;
  projectname: string;
  projectnameEng?: string;
  status: string;
  team: Team;
}

interface Event {
  event_id: number;
  name: string;
  type: string;
  dueDate: string;
  order: number;
}

interface Submission {
  submission_id: number;
  event_id: number;
  team_id: number;
  status: "PENDING" | "SUBMITTED" | "NEEDS_REVISION" | "APPROVED";
  submittedAt?: string;
  file?: string;
  feedback?: string;
  Event: Event;
}

// Mock Data for now (will be replaced with API)
const MOCK_SUBMISSIONS: Submission[] = [
  {
    submission_id: 1,
    event_id: 1,
    team_id: 1,
    status: "APPROVED",
    submittedAt: "2024-08-14T10:00:00Z",
    Event: {
      event_id: 1,
      name: "สอบหัวข้อโครงงาน",
      type: "DOCUMENT",
      dueDate: "2024-08-15",
      order: 1,
    },
  },
  {
    submission_id: 2,
    event_id: 2,
    team_id: 1,
    status: "SUBMITTED",
    submittedAt: "2024-09-09T15:00:00Z",
    Event: {
      event_id: 2,
      name: "รายงานความก้าวหน้า #1",
      type: "PROGRESS_REPORT",
      dueDate: "2024-09-10",
      order: 2,
    },
  },
  {
    submission_id: 3,
    event_id: 3,
    team_id: 1,
    status: "PENDING",
    Event: {
      event_id: 3,
      name: "รายงานความก้าวหน้า #2",
      type: "PROGRESS_REPORT",
      dueDate: "2024-10-15",
      order: 3,
    },
  },
];

export const AdvisorEventsDashboard: React.FC = () => {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<AdvisorProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<AdvisorProject | null>(
    null,
  );
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedSubmission, setSelectedSubmission] =
    useState<Submission | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch projects
  useEffect(() => {
    const fetchProjects = async () => {
      if (status !== "authenticated") return;
      try {
        const res = await fetch("/api/advisors/my-projects");
        if (res.ok) {
          const data = await res.json();
          setProjects(data);
          if (data.length > 0) setSelectedProject(data[0]);
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [status]);

  // Fetch submissions when project is selected
  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!selectedProject) return;
      try {
        const res = await fetch(
          `/api/submissions?team_id=${selectedProject.team.team_id}`,
        );
        if (res.ok) {
          const data = await res.json();
          setSubmissions(data.length > 0 ? data : MOCK_SUBMISSIONS);
        } else {
          setSubmissions(MOCK_SUBMISSIONS);
        }
      } catch {
        setSubmissions(MOCK_SUBMISSIONS);
      }
    };
    fetchSubmissions();
  }, [selectedProject]);

  const handleApprove = async (submission: Submission) => {
    setActionLoading(true);
    try {
      await fetch(`/api/submissions/${submission.submission_id}/approve`, {
        method: "POST",
      });
      setSubmissions((prev) =>
        prev.map((s) =>
          s.submission_id === submission.submission_id
            ? { ...s, status: "APPROVED" }
            : s,
        ),
      );
      setSelectedSubmission(null);
    } catch (error) {
      console.error("Error approving:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (submission: Submission) => {
    setActionLoading(true);
    try {
      await fetch(`/api/submissions/${submission.submission_id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedback: feedbackText }),
      });
      setSubmissions((prev) =>
        prev.map((s) =>
          s.submission_id === submission.submission_id
            ? { ...s, status: "NEEDS_REVISION", feedback: feedbackText }
            : s,
        ),
      );
      setSelectedSubmission(null);
      setFeedbackText("");
    } catch (error) {
      console.error("Error rejecting:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear() + 543}`;
  };

  const getProgress = () => {
    if (submissions.length === 0) return 0;
    const approved = submissions.filter((s) => s.status === "APPROVED").length;
    return Math.round((approved / submissions.length) * 100);
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          ตรวจสอบเอกสาร
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          ตรวจและอนุมัติเอกสารของโครงงานที่ดูแล
        </p>
      </div>

      {projects.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Project List */}
          <div className="lg:col-span-1 space-y-3">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              โครงงานที่ดูแล ({projects.length})
            </h2>
            <div className="space-y-3">
              {projects.map((project) => (
                <ProjectListItem
                  key={project.project_id}
                  project={project}
                  isSelected={
                    selectedProject?.project_id === project.project_id
                  }
                  onSelect={() => setSelectedProject(project)}
                />
              ))}
            </div>
          </div>

          {/* Right: Submissions List */}
          <div className="lg:col-span-2 space-y-6">
            {selectedProject ? (
              <>
                {/* Project Info Card */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {selectedProject.projectname}
                      </h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        กลุ่ม {selectedProject.team.groupNumber} •{" "}
                        {selectedProject.team.section.section_code}
                      </p>
                    </div>
                    <ProgressBadge progress={getProgress()} />
                  </div>
                </div>

                {/* Submissions List */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <FileText size={20} className="text-blue-500" />
                    รายการเอกสาร ({submissions.length})
                  </h3>

                  <div className="space-y-3">
                    {submissions
                      .sort((a, b) => a.Event.order - b.Event.order)
                      .map((submission) => (
                        <SubmissionItem
                          key={submission.submission_id}
                          submission={submission}
                          onClick={() => setSelectedSubmission(submission)}
                          formatDate={formatDate}
                        />
                      ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-12 text-center">
                <p className="text-gray-500 dark:text-gray-400">
                  เลือกโครงงานเพื่อดูเอกสาร
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Submission Detail Modal */}
      {selectedSubmission && (
        <SubmissionModal
          submission={selectedSubmission}
          onClose={() => setSelectedSubmission(null)}
          onApprove={() => handleApprove(selectedSubmission)}
          onReject={() => handleReject(selectedSubmission)}
          feedbackText={feedbackText}
          setFeedbackText={setFeedbackText}
          actionLoading={actionLoading}
          formatDate={formatDate}
        />
      )}
    </div>
  );
};

// Sub-components
const EmptyState = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-12 text-center">
    <FileText
      size={64}
      className="mx-auto text-gray-300 dark:text-gray-600 mb-4"
    />
    <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
      ยังไม่มีโครงงาน
    </h3>
    <p className="text-gray-500 dark:text-gray-500">
      คุณยังไม่มีโครงงานที่ต้องดูแล
    </p>
  </div>
);

const ProjectListItem: React.FC<{
  project: AdvisorProject;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ project, isSelected, onSelect }) => (
  <button
    onClick={onSelect}
    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
      isSelected
        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
        : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300"
    }`}
  >
    <h3 className="font-semibold text-gray-900 dark:text-white text-base line-clamp-2 mb-2">
      {project.projectname}
    </h3>
    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
      <Users size={14} />
      <span>กลุ่ม {project.team.groupNumber}</span>
      <span>•</span>
      <span>{project.team.section.section_code}</span>
    </div>
  </button>
);

const ProgressBadge: React.FC<{ progress: number }> = ({ progress }) => {
  const color =
    progress >= 80
      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
      : progress >= 50
        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
        : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-bold ${color}`}>
      {progress}%
    </span>
  );
};

const SubmissionItem: React.FC<{
  submission: Submission;
  onClick: () => void;
  formatDate: (d: string) => string;
}> = ({ submission, onClick, formatDate }) => {
  const statusConfig: Record<
    string,
    { label: string; color: string; icon: React.ReactNode }
  > = {
    APPROVED: {
      label: "อนุมัติแล้ว",
      color:
        "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
      icon: <CheckCircle2 size={16} />,
    },
    SUBMITTED: {
      label: "รอตรวจ",
      color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      icon: <Clock size={16} />,
    },
    NEEDS_REVISION: {
      label: "ต้องแก้ไข",
      color: "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400",
      icon: <AlertCircle size={16} />,
    },
    PENDING: {
      label: "ยังไม่ส่ง",
      color: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400",
      icon: <Clock size={16} />,
    },
  };

  const config = statusConfig[submission.status];

  return (
    <button
      onClick={onClick}
      className="w-full text-left p-4 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all flex items-center justify-between group"
    >
      <div className="flex items-center gap-4">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center ${
            submission.status === "APPROVED"
              ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600"
              : "bg-gray-200 dark:bg-gray-600 text-gray-500"
          }`}
        >
          {submission.status === "APPROVED" ? (
            <CheckCircle2 size={20} />
          ) : (
            submission.Event.order
          )}
        </div>
        <div>
          <p className="font-medium text-gray-900 dark:text-white">
            {submission.Event.name}
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
            <Calendar size={12} />
            <span>กำหนด: {formatDate(submission.Event.dueDate)}</span>
            {submission.submittedAt && (
              <>
                <span>•</span>
                <span>ส่งเมื่อ: {formatDate(submission.submittedAt)}</span>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span
          className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
        >
          {config.icon} {config.label}
        </span>
        <ChevronRight
          size={20}
          className="text-gray-400 group-hover:translate-x-1 transition-transform"
        />
      </div>
    </button>
  );
};

const SubmissionModal: React.FC<{
  submission: Submission;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
  feedbackText: string;
  setFeedbackText: (v: string) => void;
  actionLoading: boolean;
  formatDate: (d: string) => string;
}> = ({
  submission,
  onClose,
  onApprove,
  onReject,
  feedbackText,
  setFeedbackText,
  actionLoading,
  formatDate,
}) => (
  <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
      <div className="p-6 border-b border-gray-100 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          {submission.Event.name}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          กำหนด: {formatDate(submission.Event.dueDate)}
        </p>
      </div>

      <div className="p-6 space-y-4">
        {submission.file ? (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800 flex items-center gap-3">
            <FileText className="text-blue-600" />
            <div>
              <p className="font-medium text-blue-900 dark:text-blue-200">
                ไฟล์ที่ส่ง
              </p>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                {submission.file}
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center text-gray-500">
            ยังไม่มีไฟล์ที่ส่ง
          </div>
        )}

        {submission.status === "SUBMITTED" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <MessageSquare size={16} className="inline mr-2" />
              ข้อเสนอแนะ (สำหรับกรณีขอแก้ไข)
            </label>
            <textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="กรอกข้อเสนอแนะสำหรับนักศึกษา..."
              className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
              rows={3}
            />
          </div>
        )}

        {submission.feedback && (
          <div className="p-3 bg-rose-50 dark:bg-rose-900/20 rounded-lg border border-rose-100 dark:border-rose-800">
            <p className="text-xs font-medium text-rose-500 mb-1">
              Feedback ล่าสุด:
            </p>
            <p className="text-sm text-rose-700 dark:text-rose-300">
              {submission.feedback}
            </p>
          </div>
        )}
      </div>

      <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-100 dark:border-gray-700 flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 px-4 py-2 text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 font-medium"
        >
          ปิด
        </button>
        {submission.status === "SUBMITTED" && (
          <>
            <Button
              variant="secondary"
              onClick={onReject}
              disabled={actionLoading}
              className="flex-1 !bg-rose-50 dark:!bg-rose-900/20 !text-rose-600 flex items-center justify-center gap-2"
            >
              <XCircle size={18} /> ขอแก้ไข
            </Button>
            <Button
              variant="primary"
              onClick={onApprove}
              disabled={actionLoading}
              className="flex-1 flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={18} /> อนุมัติ
            </Button>
          </>
        )}
      </div>
    </div>
  </div>
);

export default AdvisorEventsDashboard;
