"use client";

// TimelineDashboard - Main container for timeline page
import React from "react";
import TimelineFilters from "@/app/(components)/TimelineFilters";
import TimelineListView from "@/app/(components)/TimelineListView";
import DocumentsView from "@/app/(components)/DocumentsView";
import TimelineFormModal from "@/app/(components)/TimelineFormModal";
import { useTimeline } from "../hooks/useTimeline";

export const TimelineDashboard: React.FC = () => {
  const {
    isAdmin,
    data,
    isLoading,
    activeTab,
    setActiveTab,
    selectedYear,
    setSelectedYear,
    studentType,
    setStudentType,
    isModalOpen,
    setIsModalOpen,
    editingItem,
    handlers,
  } = useTimeline();

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen w-full text-gray-800 dark:text-gray-200 transition-colors duration-300">
      <TimelineFilters
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        years={["2568", "2567", "2566"]}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        studentType={studentType}
        setStudentType={setStudentType}
        onAddClick={handlers.handleOpenCreate}
        isAdmin={isAdmin}
      />

      {activeTab === "timeline" ? (
        <TimelineListView
          data={data}
          selectedYear={selectedYear}
          onEdit={handlers.handleOpenEdit}
          onCreate={handlers.handleOpenCreate}
          isAdmin={isAdmin}
        />
      ) : (
        <DocumentsView data={data} selectedYear={selectedYear} />
      )}

      {isAdmin && (
        <TimelineFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handlers.handleFormSubmit}
          year={selectedYear}
          initialData={editingItem}
        />
      )}
    </div>
  );
};
