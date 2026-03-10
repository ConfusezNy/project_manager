"use client";

// TaskCard - Clean Trello-style card for Kanban board
import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Calendar, MessageSquare, Paperclip, AlertTriangle } from "lucide-react";
import type { Task } from "../types/task.types";
import { getImageSrc } from "@/lib/image";

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
}

// Priority → left border color
const priorityBorderColors: Record<string, string> = {
  LOW: "border-l-emerald-400",
  MEDIUM: "border-l-blue-400",
  HIGH: "border-l-orange-400",
  URGENT: "border-l-red-500",
};

const priorityLabels: Record<string, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
};

const priorityDotColors: Record<string, string> = {
  LOW: "bg-emerald-400",
  MEDIUM: "bg-blue-400",
  HIGH: "bg-orange-400",
  URGENT: "bg-red-500",
};

// Tag colors (cycle through)
const tagColors = [
  "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300",
  "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
  "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300",
];

export const TaskCard: React.FC<TaskCardProps> = ({ task, onClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.task_id.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const tags = task.tags?.split(",").filter(Boolean) || [];
  const commentCount = task._count?.Comment || task.comments?.length || 0;
  const assigneeCount = task.assignees?.length || 0;
  const attachmentCount = task._count?.Attachment || 0;

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return null;
    const d = new Date(date);
    return d.toLocaleDateString("th-TH", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  const isOverdue =
    task.dueDate &&
    new Date(task.dueDate) < new Date() &&
    task.status !== "DONE";

  const daysUntilDue = task.dueDate
    ? Math.ceil(
      (new Date(task.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
    )
    : null;

  // Check if task has a cover image (first image attachment, if we have data)
  const coverImage = task.coverImage || null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`
        group relative bg-white dark:bg-gray-800 rounded-lg shadow-sm
        border border-gray-100 dark:border-gray-700
        border-l-[3px] ${priorityBorderColors[task.priority] || priorityBorderColors.MEDIUM}
        cursor-pointer
        hover:shadow-md hover:-translate-y-0.5
        transition-all duration-200 ease-out
        ${isDragging ? "shadow-xl ring-2 ring-blue-500/50 scale-[1.02]" : ""}
      `}
    >
      {/* Cover Image */}
      {coverImage && (
        <div className="w-full overflow-hidden rounded-t-lg">
          <img
            src={getImageSrc(coverImage)!}
            alt=""
            className="w-full max-h-52 object-cover"
          />
        </div>
      )}

      <div className="p-3.5">
        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className={`px-2 py-0.5 text-[11px] font-medium rounded-full ${tagColors[idx % tagColors.length]}`}
              >
                {tag.trim()}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="px-1.5 py-0.5 text-[11px] text-gray-400">
                +{tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Title */}
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2 leading-snug">
          {task.title}
        </h4>

        {/* Description preview */}
        {task.description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2.5 line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}

        {/* Date range row */}
        {(task.startDate || task.dueDate) && (
          <div className="flex items-center gap-1.5 mb-2.5 text-[11px] text-gray-500 dark:text-gray-400">
            <Calendar size={10} className="flex-shrink-0" />
            <span className={isOverdue ? "text-red-500 dark:text-red-400 font-medium" : ""}>
              {isOverdue && <AlertTriangle size={10} className="inline mr-0.5" />}
              {formatDate(task.startDate) || "-"} - {formatDate(task.dueDate) || "-"}
            </span>
          </div>
        )}

        {/* Footer: Avatars + Meta */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-50 dark:border-gray-700/50">
          {/* รวม author + assignees เป็น list เดียว สีเดียว */}
          <div className="flex items-center">
            <div className="flex -space-x-1.5">
              {(() => {
                // รวม author + assignees เป็น list เดียว (ไม่ซ้ำ)
                const allUsers: Array<{ id: string; firstname?: string | null; lastname?: string | null; profilePicture?: string | null }> = [];
                if (task.author) {
                  allUsers.push({ id: task.authorUserId, firstname: task.author.firstname, lastname: task.author.lastname, profilePicture: task.author.profilePicture });
                }
                task.assignees?.forEach((a) => {
                  if (!allUsers.some((u) => u.id === a.users_id)) {
                    allUsers.push({ id: a.users_id, firstname: a.user?.firstname, lastname: a.user?.lastname, profilePicture: a.user?.profilePicture });
                  }
                });
                const visible = allUsers.slice(0, 4);
                const extra = allUsers.length - 4;
                return (
                  <>
                    {visible.map((u) => (
                      u.profilePicture ? (
                        <img
                          key={u.id}
                          src={getImageSrc(u.profilePicture)!}
                          alt=""
                          className="w-6 h-6 rounded-full object-cover border-2 border-white dark:border-gray-800"
                          title={`${u.firstname || ""} ${u.lastname || ""}`}
                        />
                      ) : (
                        <div
                          key={u.id}
                          className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-[10px] text-white font-bold border-2 border-white dark:border-gray-800"
                          title={`${u.firstname || ""} ${u.lastname || ""}`}
                        >
                          {u.firstname?.[0] || "U"}
                        </div>
                      )
                    ))}
                    {extra > 0 && (
                      <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-[10px] text-gray-600 dark:text-gray-300 font-bold border-2 border-white dark:border-gray-800">
                        +{extra}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>

          {/* Meta: attachments + comments */}
          <div className="flex items-center gap-2.5">
            {attachmentCount > 0 && (
              <span className="flex items-center gap-0.5 text-[11px] text-gray-400 dark:text-gray-500">
                <Paperclip size={11} />
                {attachmentCount}
              </span>
            )}
            {commentCount > 0 && (
              <span className="flex items-center gap-0.5 text-[11px] text-gray-400 dark:text-gray-500">
                <MessageSquare size={11} />
                {commentCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
