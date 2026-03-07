"use client";

import React, { useState } from "react";
import { X, CheckCircle2, Paperclip } from "lucide-react";
import type { CreateEventData } from "../hooks/useEventManagement";

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    data: CreateEventData,
  ) => Promise<{ success: boolean; error?: string }>;
  sectionId: number;
  teamCount: number;
}

export const CreateEventModal: React.FC<CreateEventModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  sectionId,
  teamCount,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [requireFile, setRequireFile] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("กรุณาระบุชื่อกำหนดการ");
      return;
    }

    if (!dueDate) {
      setError("กรุณาระบุวันกำหนดส่ง");
      return;
    }

    setSubmitting(true);
    const result = await onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
      dueDate: new Date(dueDate).toISOString(),
      section_id: sectionId,
      requireFile,
      createSubmissionsForAllTeams: true,
    });

    setSubmitting(false);

    if (result.success) {
      setName("");
      setDescription("");
      setDueDate("");
      setRequireFile(false);
      onClose();
    } else {
      setError(result.error || "เกิดข้อผิดพลาด");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-slate-800">สร้างกำหนดการใหม่</h3>
          <button onClick={onClose} disabled={submitting}>
            <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-200">
                {error}
              </div>
            )}

            {/* ชื่อกำหนดการ */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                ชื่อกำหนดการ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="เช่น รายงานความก้าวหน้าครั้งที่ 1"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Deadline */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                กำหนดส่ง (Deadline) <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none"
              />
            </div>

            {/* คำอธิบาย */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                คำอธิบาย (ไม่จำเป็น)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="รายละเอียดเพิ่มเติม..."
                rows={2}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none resize-none"
              />
            </div>

            {/* Toggle: ต้องอัพโหลดไฟล์ */}
            <div
              onClick={() => setRequireFile(!requireFile)}
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${requireFile
                  ? "bg-blue-50 border-blue-300"
                  : "bg-slate-50 border-slate-200 hover:border-slate-300"
                }`}
            >
              <div
                className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${requireFile
                    ? "bg-blue-600 border-blue-600"
                    : "border-slate-400 bg-white"
                  }`}
              >
                {requireFile && (
                  <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Paperclip className="w-4 h-4 text-blue-500" />
                  ต้องการให้นักศึกษาอัพโหลดไฟล์
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {requireFile
                    ? "นักศึกษาจะเห็นปุ่มส่งงาน + บังคับอัพโหลด"
                    : "เป็นแค่ deadline แจ้งเตือน ไม่ต้องส่งไฟล์"}
                </p>
              </div>
            </div>

            {/* Info */}
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 flex gap-3 items-start">
              <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-xs text-blue-800">
                <p className="font-bold">ระบบอัตโนมัติ:</p>
                <p>
                  เมื่อกดบันทึก ระบบจะสร้างรายการส่งงาน (Submission)
                  ให้กับทุกทีมใน Section นี้ทันที ({teamCount} ทีม)
                </p>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-slate-600 text-sm hover:bg-slate-200 rounded-lg disabled:opacity-50"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 shadow-sm disabled:opacity-50"
            >
              {submitting ? "กำลังบันทึก..." : "บันทึกกำหนดการ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
