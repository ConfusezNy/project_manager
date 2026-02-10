"use client";

import React, { useState } from "react";
import { Plus, Users, ChevronDown, Calendar, X } from "lucide-react";
import { useEventManagement } from "../hooks/useEventManagement";
import { EventTable } from "./EventTable";
import { CreateEventModal } from "./CreateEventModal";
import { EventDetailDrawer } from "./EventDetailDrawer";

export const AdminEventsPage: React.FC = () => {
  const {
    sections,
    selectedSection,
    events,
    loading,
    error,
    isAdmin,
    isCreateModalOpen,
    viewingEvent,
    setSelectedSection,
    setIsCreateModalOpen,
    setViewingEvent,
    setEditingEvent,
    createEvent,
    deleteEvent,
    approveSubmission,
    rejectSubmission,
  } = useEventManagement();

  // Reject modal state
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<number | null>(null);
  const [rejectFeedback, setRejectFeedback] = useState("");

  // Calculate team count for selected section
  const teamCount = selectedSection?._count?.Team || 0;
  const nextOrder = events.length + 1;

  const handleRejectClick = (submissionId: number) => {
    setRejectTarget(submissionId);
    setRejectFeedback("");
    setRejectModalOpen(true);
  };

  const handleRejectConfirm = async () => {
    if (!rejectTarget) return;
    await rejectSubmission(rejectTarget, rejectFeedback);
    setRejectModalOpen(false);
    setRejectTarget(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans text-slate-900">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-slate-800">
              จัดการกำหนดการ (Events)
            </h1>
          </div>
          <p className="text-slate-500 text-sm mt-1 ml-11">
            สร้างและติดตามสถานะการส่งงานของแต่ละ Section
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            disabled={!selectedSection}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg shadow-sm hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-5 h-5" /> สร้างกำหนดการใหม่
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row gap-4 items-center">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-sm font-bold text-slate-600 whitespace-nowrap">
            เลือก Section:
          </span>
          <div className="relative w-full md:w-72">
            <select
              className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 pr-8 font-medium"
              value={selectedSection?.section_id || ""}
              onChange={(e) => {
                const section = sections.find(
                  (s) => s.section_id === parseInt(e.target.value),
                );
                if (section) setSelectedSection(section);
              }}
            >
              {sections.length === 0 ? (
                <option value="">ไม่มี Section</option>
              ) : (
                sections.map((s) => (
                  <option key={s.section_id} value={s.section_id}>
                    {s.section_code} - {s.Term?.semester}/{s.Term?.academicYear}{" "}
                    ({s.course_type})
                  </option>
                ))
              )}
            </select>
            <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        <div className="h-6 w-px bg-slate-200 hidden md:block" />

        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Users className="w-4 h-4" />
          <span>มีทั้งหมด {teamCount} ทีมใน Section นี้</span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 border border-red-200">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
          <p className="text-slate-400 mt-4">กำลังโหลด...</p>
        </div>
      ) : (
        /* Event Table */
        <EventTable
          events={events}
          onView={setViewingEvent}
          onEdit={setEditingEvent}
          onDelete={deleteEvent}
          onApprove={approveSubmission}
          onReject={handleRejectClick}
          readOnly={!isAdmin}
        />
      )}

      {/* Create Modal */}
      <CreateEventModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={createEvent}
        sectionId={selectedSection?.section_id || 0}
        teamCount={teamCount}
        nextOrder={nextOrder}
      />

      {/* Detail Drawer */}
      {viewingEvent && (
        <EventDetailDrawer
          event={viewingEvent}
          onClose={() => setViewingEvent(null)}
          onApprove={approveSubmission}
          onReject={rejectSubmission}
        />
      )}

      {/* Reject Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800">ส่งกลับแก้ไข</h3>
              <button
                onClick={() => setRejectModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <textarea
              value={rejectFeedback}
              onChange={(e) => setRejectFeedback(e.target.value)}
              placeholder="ระบุเหตุผลหรือสิ่งที่ต้องแก้ไข..."
              className="w-full p-3 border border-slate-200 rounded-lg bg-slate-50 text-slate-800 resize-none h-32 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setRejectModalOpen(false)}
                className="flex-1 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleRejectConfirm}
                className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
              >
                ส่งกลับแก้ไข
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
