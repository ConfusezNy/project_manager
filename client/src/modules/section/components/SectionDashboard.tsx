"use client";

// SectionDashboard - Main container for sections page
import React from "react";
import { useSectionData } from "../hooks/useSectionData";

// Sub-components
import { SectionAccordion } from "./SectionAccordion";
import { CreateTermModal } from "./CreateTermModal";
import { CreateSectionModal } from "./CreateSectionModal";
import { EnrollmentsModal } from "./EnrollmentsModal";
import { EnrollModal } from "./EnrollModal";
import { ContinueModal } from "./ContinueModal";

export const SectionDashboard: React.FC = () => {
  const {
    sections,
    terms,
    loading,
    error,
    candidates,
    enrollments,
    selectedCandidates,
    currentSectionId,
    continueTermId,
    setContinueTermId,
    // Continue to project
    continueTeams,
    selectedTeamIds,
    setSelectedTeamIds,
    continuingSectionCode,
    continueLoading,
    // Forms
    createForm,
    setCreateForm,
    createError,
    termForm,
    setTermForm,
    termError,
    showCreateModal,
    setShowCreateModal,
    showTermModal,
    setShowTermModal,
    showEnrollmentsModal,
    setShowEnrollmentsModal,
    showEnrollModal,
    setShowEnrollModal,
    showContinueModal,
    setShowContinueModal,
    handlers,
  } = useSectionData();

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="p-6 min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            จัดการหมู่เรียน
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Section Management
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowTermModal(true)}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-sm transition"
          >
            + สร้างเทอม
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-sm transition"
          >
            + สร้างหมู่เรียน
          </button>
        </div>
      </div>

      {/* Sections Accordion */}
      <SectionAccordion
        sections={sections}
        onEnroll={handlers.openEnrollModal}
        onViewEnrollments={handlers.fetchEnrollments}
        onContinue={handlers.openContinueModal}
        onDelete={handlers.handleDeleteSection}
        onToggleLock={handlers.handleToggleLock}
      />

      {/* Modals */}
      <CreateTermModal
        isOpen={showTermModal}
        onClose={() => setShowTermModal(false)}
        form={termForm}
        setForm={setTermForm}
        error={termError}
        onSubmit={handlers.handleCreateTerm}
      />

      <CreateSectionModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        form={createForm}
        setForm={setCreateForm}
        error={createError}
        terms={terms}
        onSubmit={handlers.handleCreateSection}
      />

      <EnrollmentsModal
        isOpen={showEnrollmentsModal}
        onClose={() => setShowEnrollmentsModal(false)}
        enrollments={enrollments}
        sectionId={currentSectionId}
      />

      <EnrollModal
        isOpen={showEnrollModal}
        onClose={() => setShowEnrollModal(false)}
        candidates={candidates}
        selectedCandidates={selectedCandidates}
        sectionId={currentSectionId}
        onToggle={handlers.toggleCandidate}
        onToggleAll={handlers.toggleAllCandidates}
        onEnroll={handlers.handleEnroll}
      />

      <ContinueModal
        isOpen={showContinueModal}
        onClose={() => setShowContinueModal(false)}
        sectionCode={continuingSectionCode}
        terms={terms}
        teams={continueTeams}
        selectedTermId={continueTermId}
        setSelectedTermId={setContinueTermId}
        selectedTeamIds={selectedTeamIds}
        setSelectedTeamIds={setSelectedTeamIds}
        onConfirm={handlers.handleContinueToProject}
        loading={continueLoading}
      />
    </div>
  );
};
