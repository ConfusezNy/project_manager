"use client";

// TaskDetailModal - View task details with comments and attachments
import React, { useState, useEffect, useRef } from "react";
import { useAuth, getToken } from "@/lib/auth-context";
import {
  X,
  Calendar,
  Tag,
  Trash2,
  Edit3,
  UserPlus,
  UserMinus,
  Paperclip,
  Upload,
  File,
  Download,
} from "lucide-react";
import type { Task, UpdateTaskInput } from "../types/task.types";
import { CommentSection } from "@/modules/comment";
import { taskService } from "../services/taskService";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

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
  const currentUserId = currentUser?.users_id;
  const [showAssignMenu, setShowAssignMenu] = useState(false);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load attachments
  useEffect(() => {
    taskService.getAttachments(task.task_id).then(setAttachments).catch(() => { });
  }, [task.task_id]);

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

  const handleFileUpload = async (file: globalThis.File) => {
    if (file.size > 20 * 1024 * 1024) {
      alert("ไฟล์ต้องมีขนาดไม่เกิน 20 MB");
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const token = getToken();
      const res = await fetch(`${API_URL}/uploads/attachment`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      await taskService.addAttachment(task.task_id, data.fileUrl, data.filename);
      const updated = await taskService.getAttachments(task.task_id);
      setAttachments(updated);
    } catch (err) {
      alert("อัปโหลดไฟล์ไม่สำเร็จ");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAttachment = async (attachmentId: number) => {
    if (!confirm("ลบไฟล์แนบนี้?")) return;
    try {
      await taskService.removeAttachment(task.task_id, attachmentId);
      setAttachments(attachments.filter((a: any) => a.attachment_id !== attachmentId));
    } catch {
      alert("ลบไฟล์ไม่สำเร็จ");
    }
  };

  // Get assignable members (exclude self + already assigned)
  const assignedIds = new Set(task.assignees?.map((a) => a.users_id) || []);
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
            {/* ปุ่มลบ — เฉพาะผู้สร้าง task เท่านั้น */}
            {currentUserId === task.authorUserId && (
              <button
                onClick={handleDelete}
                className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 rounded-lg transition-colors"
                title="ลบ Task"
              >
                <Trash2 size={18} />
              </button>
            )}
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
          {/* Dates — ย้ายมาอยู่ด้านบนสุด */}
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
                สิ้นสุด
              </h3>
              <p className="text-gray-900 dark:text-white">
                {formatDate(task.dueDate)}
              </p>
            </div>
          </div>

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

          {/* Attachments — ย้ายมาอยู่ใต้รายละเอียด + แสดงแบบ thumbnail grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1">
                <Paperclip size={14} />
                ไฟล์แนบ {attachments.length > 0 && <span className="ml-1 px-1.5 py-0.5 bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-full text-[11px]">{attachments.length}</span>}
              </h3>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors disabled:opacity-50"
              >
                {uploading ? (
                  <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Upload size={12} />
                )}
                อัปโหลด
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
                e.target.value = "";
              }}
            />
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files?.[0];
                if (file) handleFileUpload(file);
              }}
            >
              {attachments.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {attachments.map((att: any) => {
                    const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
                    const isImage = imageExts.some(ext => att.fileUrl?.toLowerCase().endsWith(ext));
                    const uploadDate = att.createdAt
                      ? new Date(att.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })
                      : '';
                    const uploadTime = att.createdAt
                      ? new Date(att.createdAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
                      : '';

                    return (
                      <div
                        key={att.attachment_id}
                        className="group relative bg-gray-50 dark:bg-gray-700/50 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-600 hover:shadow-md transition-shadow"
                      >
                        {/* Thumbnail / Preview */}
                        <div className="w-full h-28 bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                          {isImage ? (
                            <img
                              src={`${API_URL}${att.fileUrl}`}
                              alt={att.filename}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="flex flex-col items-center gap-1">
                              <File size={28} className="text-gray-300 dark:text-gray-500" />
                              <span className="text-[10px] text-gray-400 uppercase font-medium">
                                {att.filename?.split('.').pop() || 'file'}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* File info */}
                        <div className="p-2.5">
                          <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate" title={att.filename}>
                            {att.filename}
                          </p>
                          {(uploadDate || uploadTime) && (
                            <p className="text-[11px] text-gray-400 mt-0.5">
                              {uploadDate}{uploadTime ? `, ${uploadTime}` : ''}
                            </p>
                          )}
                        </div>

                        {/* Hover overlay actions */}
                        <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <a
                            href={`${API_URL}${att.fileUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 bg-white/90 dark:bg-gray-800/90 rounded-lg shadow-sm hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-500 transition-colors"
                            title="ดาวน์โหลด"
                          >
                            <Download size={13} />
                          </a>
                          <button
                            onClick={() => handleRemoveAttachment(att.attachment_id)}
                            className="p-1.5 bg-white/90 dark:bg-gray-800/90 rounded-lg shadow-sm hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 transition-colors"
                            title="ลบ"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-4 text-sm text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-lg">
                  ลากไฟล์มาวางหรือคลิกปุ่มอัปโหลด
                </div>
              )}
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

          {/* Assignees — ผู้รับผิดชอบ + เพิ่ม/ลบเฉพาะผู้สร้าง */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                ผู้รับผิดชอบ
              </h3>
              {/* แสดงปุ่มเพิ่มเฉพาะผู้สร้าง task */}
              {currentUserId === task.authorUserId && (
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
              )}
            </div>

            <div className="space-y-2">
              {/* ผู้สร้าง — แสดงในรายชื่อเดียวกัน ไม่แยกสี */}
              {task.author && (
                <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    {task.author.profilePicture ? (
                      <img
                        src={task.author.profilePicture.startsWith("http") ? task.author.profilePicture : `${API_URL}${task.author.profilePicture}`}
                        alt=""
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                        {task.author.firstname?.[0] || "U"}
                      </div>
                    )}
                    <div>
                      <span className="text-sm text-gray-900 dark:text-white">
                        {task.author.firstname} {task.author.lastname}
                      </span>
                      <span className="ml-1.5 text-[10px] px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
                        ผู้สร้าง
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* ผู้รับผิดชอบ */}
              {task.assignees && task.assignees.length > 0 ? (
                task.assignees
                  .filter((a) => a.users_id !== task.authorUserId)
                  .map((a) => (
                    <div
                      key={a.users_id}
                      className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        {a.user?.profilePicture ? (
                          <img
                            src={a.user.profilePicture.startsWith("http") ? a.user.profilePicture : `${API_URL}${a.user.profilePicture}`}
                            alt=""
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                            {a.user?.firstname?.[0] || "U"}
                          </div>
                        )}
                        <span className="text-sm text-gray-900 dark:text-white">
                          {a.user?.firstname} {a.user?.lastname}
                        </span>
                      </div>
                      {/* ปุ่มลบเฉพาะผู้สร้าง */}
                      {currentUserId === task.authorUserId && (
                        <button
                          onClick={() => onUnassign(task.task_id, a.users_id)}
                          className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 rounded"
                          title="ลบออก"
                        >
                          <UserMinus size={14} />
                        </button>
                      )}
                    </div>
                  ))
              ) : !task.author && (
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
