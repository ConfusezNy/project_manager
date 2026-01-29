"use client";

// TaskFormModal - Create/Edit task form
import React, { useState } from "react";
import { X, Calendar, Tag, AlertCircle } from "lucide-react";
import type {
  CreateTaskInput,
  TaskPriority,
  TaskStatus,
} from "../types/task.types";

interface TaskFormModalProps {
  onClose: () => void;
  onSubmit: (data: CreateTaskInput) => Promise<void>;
  teamMembers?: Array<{
    users_id: string;
    user?: {
      users_id: string;
      firstname?: string;
      lastname?: string;
    };
  }>;
  initialData?: Partial<CreateTaskInput>;
}

const PRIORITIES: { value: TaskPriority; label: string; color: string }[] = [
  { value: "LOW", label: "ต่ำ", color: "bg-gray-100 text-gray-600" },
  { value: "MEDIUM", label: "ปานกลาง", color: "bg-blue-100 text-blue-600" },
  { value: "HIGH", label: "สูง", color: "bg-orange-100 text-orange-600" },
  { value: "URGENT", label: "ด่วนมาก", color: "bg-red-100 text-red-600" },
];

export const TaskFormModal: React.FC<TaskFormModalProps> = ({
  onClose,
  onSubmit,
  teamMembers = [],
  initialData,
}) => {
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(
    initialData?.description || "",
  );
  const [priority, setPriority] = useState<TaskPriority>(
    initialData?.priority || "MEDIUM",
  );
  const [tags, setTags] = useState(initialData?.tags || "");
  const [startDate, setStartDate] = useState(initialData?.startDate || "");
  const [dueDate, setDueDate] = useState(initialData?.dueDate || "");
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError("กรุณาระบุชื่อ Task");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        tags: tags.trim() || undefined,
        startDate: startDate || undefined,
        dueDate: dueDate || undefined,
        assigneeIds: selectedAssignees,
        project_id: 0, // Will be set by parent
      });
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาด");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {initialData ? "แก้ไข Task" : "สร้าง Task ใหม่"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              ชื่อ Task <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="เช่น ออกแบบหน้า Login"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              รายละเอียด
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="อธิบายรายละเอียดของ Task..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              ความสำคัญ
            </label>
            <div className="flex gap-2">
              {PRIORITIES.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPriority(p.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    priority === p.value
                      ? `${p.color} ring-2 ring-offset-2 ring-blue-500`
                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Tag size={14} className="inline mr-1" />
              Tags (คั่นด้วย comma)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="เช่น UI, Design, Frontend"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Calendar size={14} className="inline mr-1" />
                วันเริ่มต้น
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Calendar size={14} className="inline mr-1" />
                กำหนดส่ง
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Assignees */}
          {teamMembers.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  มอบหมายงานให้
                </label>
                <button
                  type="button"
                  onClick={() => {
                    if (selectedAssignees.length === teamMembers.length) {
                      setSelectedAssignees([]);
                    } else {
                      setSelectedAssignees(teamMembers.map((m) => m.users_id));
                    }
                  }}
                  className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {selectedAssignees.length === teamMembers.length
                    ? "ยกเลิกทั้งหมด"
                    : "เลือกทั้งหมด"}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border border-gray-100 dark:border-gray-700 rounded-lg">
                {teamMembers.map((member, index) => (
                  <label
                    key={`member-${index}-${member.users_id || "unknown"}`}
                    className={`flex items-center gap-2 p-2 rounded-lg border transition-all cursor-pointer ${
                      selectedAssignees.includes(member.users_id)
                        ? "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800"
                        : "border-transparent hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedAssignees.includes(member.users_id)}
                      onChange={(e) => {
                        const isChecked = e.target.checked;
                        setSelectedAssignees((prev) => {
                          if (isChecked) {
                            return [...prev, member.users_id];
                          } else {
                            return prev.filter((id) => id !== member.users_id);
                          }
                        });
                      }}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <div className="flex items-center gap-2 overflow-hidden">
                      {/* Avatar if available */}
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {(member.user?.firstname?.[0] || "U").toUpperCase()}
                      </div>
                      <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                        {member.user?.firstname} {member.user?.lastname}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting
                ? "กำลังบันทึก..."
                : initialData
                  ? "บันทึก"
                  : "สร้าง Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskFormModal;
