"use client";

import React, { useState } from "react";
import { X, CheckCircle2 } from "lucide-react";
import { EVENT_TYPES } from "./StatusBadge";
import type { CreateEventData } from "../hooks/useEventManagement";

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    data: CreateEventData,
  ) => Promise<{ success: boolean; error?: string }>;
  sectionId: number;
  teamCount: number;
  nextOrder: number;
}

export const CreateEventModal: React.FC<CreateEventModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  sectionId,
  teamCount,
  nextOrder,
}) => {
  const [name, setName] = useState("");
  const [type, setType] = useState("DOCUMENT");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [order, setOrder] = useState(nextOrder);
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
      type,
      description: description.trim() || undefined,
      order,
      dueDate: new Date(dueDate).toISOString(),
      section_id: sectionId,
      createSubmissionsForAllTeams: true,
    });

    setSubmitting(false);

    if (result.success) {
      // Reset form
      setName("");
      setType("DOCUMENT");
      setDescription("");
      setDueDate("");
      setOrder(nextOrder);
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

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                ชื่อกำหนดการ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="เช่น รายงานความก้าวหน้าบทที่ 1"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  ประเภท
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none"
                >
                  {EVENT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  ลำดับ
                </label>
                <input
                  type="number"
                  value={order}
                  onChange={(e) => setOrder(parseInt(e.target.value) || 1)}
                  min={1}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none"
                />
              </div>
            </div>

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
