"use client";

// AdvisorTeamsDashboard - Main container for advisor teams page
import React from "react";
import { FileText, CheckCircle, XCircle, Users } from "lucide-react";
import Button from "@/app/(components)/Button";
import { useAdvisorTeams, AdvisorProject } from "../hooks/useAdvisorTeams";

export const AdvisorTeamsDashboard: React.FC = () => {
  const {
    user,
    isLoading,
    projects,
    selectedProject,
    setSelectedProject,
    loading,
    actionLoading,
    handlers,
  } = useAdvisorTeams();

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (user?.role !== "ADVISOR") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">
            คุณไม่มีสิทธิ์เข้าถึงหน้านี้
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          โครงงานที่รับผิดชอบ
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          จัดการและอนุมัติโครงงานของนักศึกษา
        </p>
      </div>

      {projects.length === 0 ? (
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
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Project List */}
          <div className="lg:col-span-1 space-y-3">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              รายการโครงงาน ({projects.length})
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

          {/* Right: Project Detail */}
          <div className="lg:col-span-2 space-y-6">
            {selectedProject ? (
              <>
                <ProjectDetailCard
                  project={selectedProject}
                  actionLoading={actionLoading}
                  onApprove={handlers.handleApprove}
                  onReject={handlers.handleReject}
                />
                <TeamMembersCard project={selectedProject} />
              </>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-12 text-center">
                <p className="text-gray-500 dark:text-gray-400">
                  เลือกโครงงานเพื่อดูรายละเอียด
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Sub-components
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
        : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-700"
    }`}
  >
    <div className="flex items-start justify-between gap-3 mb-3">
      <h3 className="font-semibold text-gray-900 dark:text-white text-base line-clamp-2">
        {project.projectname}
      </h3>
      <StatusBadge status={project.status} />
    </div>
    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
      <Users size={14} />
      <span>กลุ่ม {project.team.groupNumber}</span>
      <span>•</span>
      <span>{project.team.section.section_code}</span>
    </div>
    {project.project_type && (
      <div className="mt-2">
        <span className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded">
          {project.project_type}
        </span>
      </div>
    )}
  </button>
);

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const styles =
    status === "APPROVED"
      ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
      : status === "REJECTED"
        ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
        : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400";

  const text =
    status === "APPROVED"
      ? "อนุมัติ"
      : status === "REJECTED"
        ? "ปฏิเสธ"
        : "รอพิจารณา";

  return (
    <span
      className={`flex-shrink-0 px-2 py-1 text-xs font-semibold rounded-full ${styles}`}
    >
      {text}
    </span>
  );
};

const ProjectDetailCard: React.FC<{
  project: AdvisorProject;
  actionLoading: boolean;
  onApprove: () => void;
  onReject: () => void;
}> = ({ project, actionLoading, onApprove, onReject }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
    <div className="flex justify-between items-start mb-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
        <FileText size={24} className="text-amber-500" />
        รายละเอียดโครงงาน
      </h2>
      <StatusBadge status={project.status} />
    </div>

    <div className="space-y-6">
      <div>
        <p className="text-xs text-gray-400 uppercase font-black tracking-widest">
          ชื่อโครงงาน (ไทย)
        </p>
        <p className="text-lg font-bold mt-1 text-gray-900 dark:text-white leading-tight">
          {project.projectname}
        </p>
      </div>

      {project.projectnameEng && (
        <div>
          <p className="text-xs text-gray-400 uppercase font-black tracking-widest">
            Project Name (English)
          </p>
          <p className="text-base font-semibold mt-1 text-gray-700 dark:text-gray-300 leading-tight">
            {project.projectnameEng}
          </p>
        </div>
      )}

      {project.project_type && (
        <div>
          <p className="text-xs text-gray-400 uppercase font-black tracking-widest">
            ประเภท
          </p>
          <span className="inline-block mt-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-semibold rounded-full border border-blue-200 dark:border-blue-800">
            {project.project_type}
          </span>
        </div>
      )}

      {project.description && (
        <div className="pt-4 border-t border-gray-100 dark:border-gray-700/50">
          <p className="text-xs text-gray-400 uppercase font-black tracking-widest">
            รายละเอียด
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 leading-relaxed whitespace-pre-wrap">
            {project.description}
          </p>
        </div>
      )}
    </div>

    {project.status === "PENDING" && (
      <div className="flex gap-3 mt-6 pt-6 border-t border-gray-100 dark:border-gray-700/50">
        <Button
          variant="primary"
          onClick={onApprove}
          disabled={actionLoading}
          className="flex-1 !py-3 flex items-center justify-center gap-2"
        >
          <CheckCircle size={20} />
          {actionLoading ? "กำลังดำเนินการ..." : "อนุมัติโครงงาน"}
        </Button>
        <Button
          variant="secondary"
          onClick={onReject}
          disabled={actionLoading}
          className="flex-1 !py-3 flex items-center justify-center gap-2 !bg-red-50 dark:!bg-red-900/20 !text-red-600 dark:!text-red-400"
        >
          <XCircle size={20} />
          ปฏิเสธ
        </Button>
      </div>
    )}
  </div>
);

const TeamMembersCard: React.FC<{ project: AdvisorProject }> = ({
  project,
}) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
    <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
      <Users size={20} className="text-emerald-500" />
      สมาชิกในกลุ่ม
    </h2>

    <div className="space-y-3">
      {project.team.members.map((member, idx) => (
        <div
          key={member.user.users_id}
          className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold">
            {idx + 1}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {member.user.firstname} {member.user.lastname}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {member.user.email}
            </p>
          </div>
        </div>
      ))}
    </div>

    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700/50">
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-xs text-gray-400 uppercase font-black tracking-widest">
            รายวิชา
          </p>
          <p className="text-base font-semibold text-gray-900 dark:text-white mt-1">
            {project.team.section.section_code}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase font-black tracking-widest">
            ภาคเรียน
          </p>
          <p className="text-base font-semibold text-gray-900 dark:text-white mt-1">
            {project.team.semester}
          </p>
        </div>
      </div>
    </div>
  </div>
);
