"use client";

// TaskCard - Single task card for Kanban board
import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Calendar, MessageSquare, User } from "lucide-react";
import type { Task } from "../types/task.types";

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
}

const priorityColors: Record<string, string> = {
  LOW: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400",
  MEDIUM: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  HIGH: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
  URGENT: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
};

const priorityLabels: Record<string, string> = {
  LOW: "ต่ำ",
  MEDIUM: "ปานกลาง",
  HIGH: "สูง",
  URGENT: "ด่วนมาก",
};

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
  const commentCount = task._count?.Comment || 0;
  const assigneeCount = task.assignees?.length || 0;

  // Format date
  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return null;
    const d = new Date(date);
    return d.toLocaleDateString("th-TH", { day: "numeric", month: "short" });
  };

  const isOverdue =
    task.dueDate &&
    new Date(task.dueDate) < new Date() &&
    task.status !== "DONE";

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`
        bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700
        cursor-pointer hover:shadow-md transition-all
        ${isDragging ? "shadow-lg ring-2 ring-blue-500" : ""}
      `}
    >
      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {tags.slice(0, 3).map((tag, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 text-xs font-medium rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
            >
              {tag.trim()}
            </span>
          ))}
          {tags.length > 3 && (
            <span className="px-2 py-0.5 text-xs text-gray-500">
              +{tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Title */}
      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
        {task.title}
      </h4>

      {/* Description preview */}
      {task.description && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Priority & Date */}
      <div className="flex items-center gap-2 mb-3">
        <span
          className={`px-2 py-0.5 text-xs font-medium rounded ${priorityColors[task.priority] || priorityColors.MEDIUM}`}
        >
          {priorityLabels[task.priority] || task.priority}
        </span>

        {task.dueDate && (
          <span
            className={`flex items-center gap-1 text-xs ${isOverdue ? "text-red-500" : "text-gray-500 dark:text-gray-400"}`}
          >
            <Calendar size={12} />
            {formatDate(task.dueDate)}
          </span>
        )}
      </div>

      {/* Footer: Assignees & Comments */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
        {/* Assignees */}
        <div className="flex items-center">
          {task.assignees && task.assignees.length > 0 ? (
            <div className="flex -space-x-1.5">
              {task.assignees.slice(0, 3).map((a, idx) => (
                <div
                  key={a.users_id}
                  className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-[10px] text-white font-bold border-2 border-white dark:border-gray-800"
                  title={`${a.user?.firstname || ""} ${a.user?.lastname || ""}`}
                >
                  {a.user?.firstname?.[0] || "U"}
                </div>
              ))}
              {task.assignees.length > 3 && (
                <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-[10px] text-gray-600 dark:text-gray-300 font-bold border-2 border-white dark:border-gray-800">
                  +{task.assignees.length - 3}
                </div>
              )}
            </div>
          ) : (
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <User size={12} /> ยังไม่มีผู้รับผิดชอบ
            </span>
          )}
        </div>

        {/* Comments */}
        {commentCount > 0 && (
          <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <MessageSquare size={12} />
            {commentCount}
          </span>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
