"use client";

// SectionDashboard - Main container for sections page
import React, { useMemo } from "react";
import { useSectionData } from "../hooks/useSectionData";

// Sub-components
import { SectionAccordion } from "./SectionAccordion";
import { SectionFilterBar } from "./SectionFilterBar";
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
    // Filter
    filterQuery,
    setFilterQuery,
    filterAcademicYear,
    setFilterAcademicYear,
    filterLockStatus,
    setFilterLockStatus,
    // Modals
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

  // Unique academic years from terms for the year filter dropdown
  const availableYears = useMemo(() => {
    const years = new Set(terms.map((t) => String(t.academicYear)));
    return Array.from(years).sort((a, b) => Number(b) - Number(a));
  }, [terms]);

  if (loading) return <div className="p-6 text-gray-500">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="p-6 min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            จัดการหมู่เรียน
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
            {terms.length} เทอม · {sections.length} หมู่เรียน
          </p>
        </div>
        <button
          onClick={() => setShowTermModal(true)}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-sm transition"
        >
          + สร้างเทอม
        </button>
      </div>

      {/* Global Filter Bar */}
      <SectionFilterBar
        query={filterQuery}
        setQuery={setFilterQuery}
        academicYear={filterAcademicYear}
        setAcademicYear={setFilterAcademicYear}
        lockStatus={filterLockStatus}
        setLockStatus={setFilterLockStatus}
        availableYears={availableYears}
      />

      {/* Term-First Accordion */}
      <SectionAccordion
        sections={sections}
        terms={terms}
        filterQuery={filterQuery}
        filterAcademicYear={filterAcademicYear}
        filterLockStatus={filterLockStatus}
        onEnroll={handlers.openEnrollModal}
        onViewEnrollments={handlers.fetchEnrollments}
        onContinue={handlers.openContinueModal}
        onDelete={handlers.handleDeleteSection}
        onToggleLock={handlers.handleToggleLock}
        onDeleteTerm={handlers.handleDeleteTerm}
        onCreateSectionInTerm={handlers.openCreateModalWithTerm}
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
        onClose={() => {
          setShowCreateModal(false);
          setCreateForm((prev) => ({ ...prev, term_id: "" }));
        }}
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
