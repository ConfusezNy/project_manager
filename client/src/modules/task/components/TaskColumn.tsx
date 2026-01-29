"use client";

// TaskColumn - Single column for Kanban board
import React from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { TaskCard } from "./TaskCard";
import type { Task, TaskStatus } from "../types/task.types";

interface TaskColumnProps {
  id: TaskStatus;
  title: string;
  color: string;
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  onAddClick?: () => void;
}

const columnColors: Record<string, string> = {
  yellow: "border-t-yellow-400 bg-yellow-50/50 dark:bg-yellow-900/10",
  blue: "border-t-blue-400 bg-blue-50/50 dark:bg-blue-900/10",
  purple: "border-t-purple-400 bg-purple-50/50 dark:bg-purple-900/10",
  green: "border-t-green-400 bg-green-50/50 dark:bg-green-900/10",
};

const dotColors: Record<string, string> = {
  yellow: "bg-yellow-400",
  blue: "bg-blue-400",
  purple: "bg-purple-400",
  green: "bg-green-400",
};

export const TaskColumn: React.FC<TaskColumnProps> = ({
  id,
  title,
  color,
  tasks,
  onTaskClick,
  onAddClick,
}) => {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      className={`
        flex flex-col flex-1 min-w-[200px] rounded-xl border-t-4
        ${columnColors[color] || columnColors.blue}
        ${isOver ? "ring-2 ring-blue-400 ring-opacity-50" : ""}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${dotColors[color] || dotColors.blue}`}
          />
          <h3 className="font-bold text-gray-900 dark:text-white text-sm">
            {title}
          </h3>
          <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </div>

        {id === "TODO" && onAddClick && (
          <button
            onClick={onAddClick}
            className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="เพิ่ม Task"
          >
            <Plus size={16} className="text-gray-500 dark:text-gray-400" />
          </button>
        )}
      </div>

      {/* Tasks List */}
      <div
        ref={setNodeRef}
        className="flex-1 p-2 space-y-3 overflow-y-auto min-h-[200px] max-h-[calc(100vh-280px)]"
      >
        <SortableContext
          items={tasks.map((t) => t.task_id.toString())}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <TaskCard
              key={task.task_id}
              task={task}
              onClick={() => onTaskClick?.(task)}
            />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="flex items-center justify-center h-24 text-gray-400 dark:text-gray-600 text-sm">
            ว่าง
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskColumn;
