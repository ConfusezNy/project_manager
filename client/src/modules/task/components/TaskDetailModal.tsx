"use client";

// TaskDetailModal - View task details with comments
import React, { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  X,
  Calendar,
  Tag,
  Trash2,
  Edit3,
  UserPlus,
  UserMinus,
} from "lucide-react";
import type { Task, UpdateTaskInput } from "../types/task.types";
import { CommentSection } from "@/modules/comment";

interface TaskDetailModalProps {
  task: Task;
  onClose: () => void;
  onUpdate: (taskId: number, data: UpdateTaskInput) => Promise<void>;
  onDelete: (taskId: number) => Promise<void>;
  onAddComment: (taskId: number, text: string) => Promise<void>;
  onAssign: (taskId: number, userId: string) => Promise<void>;
  onUnassign: (taskId: number, userId: string) => Promise<void>;
  teamMembers?: Array<{
    users_id: string;
    user?: {
      users_id: string;
      firstname?: string;
      lastname?: string;
    };
  }>;
}

const priorityColors: Record<string, string> = {
  LOW: "bg-gray-100 text-gray-600",
  MEDIUM: "bg-blue-100 text-blue-600",
  HIGH: "bg-orange-100 text-orange-600",
  URGENT: "bg-red-100 text-red-600",
};

const statusLabels: Record<string, string> = {
  TODO: "ต้องทำ",
  IN_PROGRESS: "กำลังดำเนินการ",
  IN_REVIEW: "อยู่ระหว่างตรวจสอบ",
  DONE: "สำเร็จ",
};

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  onClose,
  onUpdate,
  onDelete,
  onAddComment,
  onAssign,
  onUnassign,
  teamMembers = [],
}) => {
  const { user: currentUser } = useAuth();
  const [showAssignMenu, setShowAssignMenu] = useState(false);

  const tags = task.tags?.split(",").filter(Boolean) || [];

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (date: Date | string) => {
    return new Date(date).toLocaleString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleAddComment = async (text: string) => {
    await onAddComment(task.task_id, text);
  };

  const handleDelete = async () => {
    if (confirm("คุณต้องการลบ Task นี้ใช่หรือไม่?")) {
      await onDelete(task.task_id);
    }
  };

  // Get assignable members (exclude self + already assigned)
  const assignedIds = new Set(task.assignees?.map((a) => a.users_id) || []);
  const currentUserId = currentUser?.users_id || "";
  const availableMembers = teamMembers.filter(
    (m) => {
      const memberId = m.users_id || m.user?.users_id || "";
      return memberId !== currentUserId && !assignedIds.has(memberId);
    },
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-100 dark:border-gray-700">
          <div className="flex-1 pr-4">
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`px-2 py-0.5 text-xs font-medium rounded ${priorityColors[task.priority]}`}
              >
                {task.priority}
              </span>
              <span className="px-2 py-0.5 text-xs font-medium rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                {statusLabels[task.status] || task.status}
              </span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {task.title}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDelete}
              className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 rounded-lg transition-colors"
              title="ลบ Task"
            >
              <Trash2 size={18} />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Description */}
          {task.description && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                รายละเอียด
              </h3>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {task.description}
              </p>
            </div>
          )}

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Calendar size={14} />
                วันเริ่มต้น
              </h3>
              <p className="text-gray-900 dark:text-white">
                {formatDate(task.startDate)}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Calendar size={14} />
                กำหนดส่ง
              </h3>
              <p className="text-gray-900 dark:text-white">
                {formatDate(task.dueDate)}
              </p>
            </div>
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Tag size={14} />
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 text-sm rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
                  >
                    {tag.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Assignees */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                ผู้รับผิดชอบ
              </h3>
              <div className="relative">
                <button
                  onClick={() => setShowAssignMenu(!showAssignMenu)}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="เพิ่มผู้รับผิดชอบ"
                >
                  <UserPlus size={16} className="text-gray-500" />
                </button>
                {showAssignMenu && availableMembers.length > 0 && (
                  <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-100 dark:border-gray-600 py-1 z-10">
                    {availableMembers.map((m) => (
                      <button
                        key={m.users_id}
                        onClick={() => {
                          onAssign(task.task_id, m.users_id);
                          setShowAssignMenu(false);
                        }}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-600"
                      >
                        {m.user?.firstname} {m.user?.lastname}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              {task.assignees && task.assignees.length > 0 ? (
                task.assignees.map((a) => (
                  <div
                    key={a.users_id}
                    className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                        {a.user?.firstname?.[0] || "U"}
                      </div>
                      <span className="text-sm text-gray-900 dark:text-white">
                        {a.user?.firstname} {a.user?.lastname}
                      </span>
                    </div>
                    <button
                      onClick={() => onUnassign(task.task_id, a.users_id)}
                      className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 rounded"
                      title="ลบออก"
                    >
                      <UserMinus size={14} />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  ยังไม่มีผู้รับผิดชอบ
                </p>
              )}
            </div>
          </div>

          {/* Comments */}
          <CommentSection
            comments={task.comments || []}
            onAddComment={handleAddComment}
          />
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;
