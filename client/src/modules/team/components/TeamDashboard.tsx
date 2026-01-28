"use client";

// TeamDashboard Component - Main container for Teams page
import React from "react";
import { Users, FileText } from "lucide-react";

// Hooks
import { useTeamData } from "../hooks/useTeamData";

// Components
import { PendingInvites } from "./PendingInvites";
import { TeamStatusCard } from "./TeamStatusCard";
import { AdvisorCard } from "./AdvisorCard";
import { ConfirmModal } from "./ConfirmModal";
import { TeamMembersTable } from "./TeamMembersTable";
import { TeamProjectDetail } from "./TeamProjectDetail";
import { InviteMemberModal } from "./InviteMemberModal";
import {
  ProjectFormModal,
  ProjectFormData,
} from "@/app/(components)/ProjectFormModal";
import AdvisorSelectionModal from "@/app/(components)/AdvisorSelectionModal";
import Button from "@/app/(components)/Button";

export const TeamDashboard: React.FC = () => {
  const {
    user,
    isLoading,
    teamData,
    section,
    projectData,
    pendingInvites,
    availableStudents,
    hasTeam,
    loading,
    submitting,
    inviting,
    joiningTeam,
    rejectingTeam,
    projectSubmitting,
    showConfirm,
    setShowConfirm,
    showInviteModal,
    setShowInviteModal,
    showProjectModal,
    setShowProjectModal,
    showAdvisorModal,
    setShowAdvisorModal,
    isEditingProject,
    handlers,
  } = useTeamData();

  // Loading state
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

  // Role guard
  if (user?.role !== "STUDENT") {
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            ข้อมูลกลุ่มโครงงาน
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {/* Pending Invites */}
        {!hasTeam && (
          <PendingInvites
            invites={pendingInvites}
            onAccept={handlers.acceptInvite}
            onReject={handlers.rejectInvite}
            joiningTeam={joiningTeam}
            rejectingTeam={rejectingTeam}
          />
        )}

        {/* Row 1: สถานะกลุ่ม + อาจารย์ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <TeamStatusCard
            hasTeam={hasTeam}
            teamData={teamData}
            section={section}
            onCreateTeam={() => setShowConfirm(true)}
          />
          <AdvisorCard
            projectData={projectData}
            onSelectAdvisor={() => setShowAdvisorModal(true)}
          />
        </div>

        {/* Row 2: สมาชิกในกลุ่ม */}
        {hasTeam ? (
          <TeamMembersTable
            members={teamData?.members || []}
            onInviteClick={handlers.openInviteModal}
            onRemoveMember={handlers.removeMember}
            currentUserId={user?.user_id}
            canEdit={projectData?.status !== "APPROVED"}
          />
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Users size={20} className="text-emerald-500" />
                สมาชิกภายในกลุ่ม
              </h2>
              <button
                disabled
                className="text-sm font-bold text-gray-400 cursor-not-allowed"
              >
                เชิญเพื่อนเข้ากลุ่ม +
              </button>
            </div>
            <div className="p-10 text-center">
              <p className="text-base text-gray-500 dark:text-gray-400 mb-2">
                ยังไม่มีสมาชิก
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                สร้างกลุ่มเพื่อเริ่มต้น
              </p>
            </div>
          </div>
        )}

        {/* Row 3: รายละเอียดโครงงาน */}
        {hasTeam ? (
          projectData ? (
            <TeamProjectDetail
              data={projectData}
              onEdit={handlers.editProject}
              onDelete={handlers.deleteProject}
              canEdit={projectData.status !== "APPROVED"}
            />
          ) : (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <FileText size={22} className="text-amber-500" />
                  รายละเอียดหัวข้อโครงการ
                </h2>
              </div>
              <div className="text-center py-10">
                <p className="text-base text-gray-600 dark:text-gray-400 mb-4">
                  ยังไม่มีหัวข้อโครงงาน
                </p>
                <Button
                  variant="primary"
                  onClick={handlers.createProject}
                  className="!py-2.5 !px-6 !text-base"
                >
                  สร้างหัวข้อโครงงาน +
                </Button>
              </div>
            </div>
          )
        ) : (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FileText size={22} className="text-amber-500" />
                รายละเอียดหัวข้อโครงการ
              </h2>
              <button
                disabled
                className="text-sm font-bold text-gray-400 cursor-not-allowed uppercase tracking-widest"
              >
                แก้ไขหัวข้อ
              </button>
            </div>
            <div className="text-center py-10">
              <p className="text-base text-gray-500 dark:text-gray-400 mb-2">
                ยังไม่มีข้อมูลโครงงาน
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                จะแสดงหลังจากสร้างกลุ่มและกำหนดหัวข้อ
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handlers.createTeam}
        isSubmitting={submitting}
        section={section}
      />

      <InviteMemberModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        availableStudents={availableStudents}
        onInvite={handlers.inviteMember}
        isLoading={inviting}
      />

      <ProjectFormModal
        isOpen={showProjectModal}
        onClose={() => setShowProjectModal(false)}
        onSubmit={handlers.submitProject}
        initialData={
          isEditingProject && projectData
            ? {
                projectname: projectData.projectname,
                projectnameEng: projectData.projectnameEng || "",
                project_type: projectData.project_type || "",
                description: projectData.description || "",
              }
            : null
        }
        isSubmitting={projectSubmitting}
      />

      {projectData && (
        <AdvisorSelectionModal
          isOpen={showAdvisorModal}
          onClose={() => setShowAdvisorModal(false)}
          projectId={projectData.project_id}
          onAdvisorSelected={handlers.fetchData}
        />
      )}
    </div>
  );
};
