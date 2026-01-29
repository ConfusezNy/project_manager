"use client";

// TaskGanttChart - Timeline view using gantt-task-react
import React, { useMemo, useState } from "react";
import { Gantt, Task as GanttTask, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import type { Task } from "../types/task.types";
import { Calendar, ZoomIn, ZoomOut } from "lucide-react";

interface TaskGanttChartProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
}

// Map our Task status to colors
const getStatusColor = (status: string): string => {
  switch (status) {
    case "TODO":
      return "#f59e0b"; // amber
    case "IN_PROGRESS":
      return "#3b82f6"; // blue
    case "IN_REVIEW":
      return "#8b5cf6"; // purple
    case "DONE":
      return "#22c55e"; // green
    default:
      return "#6b7280"; // gray
  }
};

// Map our Task priority to progress percentage (visual indicator)
const getPriorityProgress = (priority: string): number => {
  switch (priority) {
    case "URGENT":
      return 100;
    case "HIGH":
      return 75;
    case "MEDIUM":
      return 50;
    case "LOW":
      return 25;
    default:
      return 0;
  }
};

export const TaskGanttChart: React.FC<TaskGanttChartProps> = ({
  tasks,
  onTaskClick,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Week);

  // Convert our tasks to gantt-task-react format
  const ganttTasks: GanttTask[] = useMemo(() => {
    const now = new Date();
    const oneWeekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    return tasks
      .filter((task) => task.startDate || task.dueDate) // Only show tasks with dates
      .map((task) => {
        const start = task.startDate ? new Date(task.startDate) : now;
        const end = task.dueDate ? new Date(task.dueDate) : oneWeekLater;

        // Ensure end is after start
        const validEnd =
          end > start ? end : new Date(start.getTime() + 24 * 60 * 60 * 1000);

        return {
          id: String(task.task_id),
          name: task.title,
          start,
          end: validEnd,
          progress:
            task.status === "DONE" ? 100 : getPriorityProgress(task.priority),
          type: "task" as const,
          styles: {
            backgroundColor: getStatusColor(task.status),
            backgroundSelectedColor: getStatusColor(task.status),
            progressColor: "#1e40af",
            progressSelectedColor: "#1e40af",
          },
        };
      });
  }, [tasks]);

  // Handle task click
  const handleTaskClick = (ganttTask: GanttTask) => {
    const originalTask = tasks.find((t) => String(t.task_id) === ganttTask.id);
    if (originalTask && onTaskClick) {
      onTaskClick(originalTask);
    }
  };

  // Show empty state if no tasks with dates
  if (ganttTasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700">
        <Calendar size={48} className="text-gray-300 dark:text-gray-600 mb-4" />
        <p className="text-gray-500 dark:text-gray-400 text-center">
          ยังไม่มี Task ที่กำหนดวันที่
          <br />
          <span className="text-sm">
            เพิ่ม Start Date และ Due Date ให้ Task เพื่อดู Timeline
          </span>
        </p>
      </div>
    );
  }

  return (
    <div className="gantt-container">
      {/* View Mode Switcher */}
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            แสดง {ganttTasks.length} รายการ
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode(ViewMode.Day)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              viewMode === ViewMode.Day
                ? "bg-blue-600 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            <ZoomIn size={14} className="inline mr-1" />
            วัน
          </button>
          <button
            onClick={() => setViewMode(ViewMode.Week)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              viewMode === ViewMode.Week
                ? "bg-blue-600 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            สัปดาห์
          </button>
          <button
            onClick={() => setViewMode(ViewMode.Month)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              viewMode === ViewMode.Month
                ? "bg-blue-600 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            <ZoomOut size={14} className="inline mr-1" />
            เดือน
          </button>
        </div>
      </div>

      {/* Gantt Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700">
        <Gantt
          tasks={ganttTasks}
          viewMode={viewMode}
          onClick={handleTaskClick}
          listCellWidth=""
          columnWidth={
            viewMode === ViewMode.Day
              ? 60
              : viewMode === ViewMode.Week
                ? 200
                : 300
          }
          barCornerRadius={4}
          barProgressColor="#1e40af"
          handleWidth={8}
          todayColor="rgba(59, 130, 246, 0.1)"
          locale="th"
        />
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500"></div>
          <span className="text-gray-600 dark:text-gray-400">ต้องทำ</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span className="text-gray-600 dark:text-gray-400">
            กำลังดำเนินการ
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-purple-500"></div>
          <span className="text-gray-600 dark:text-gray-400">ตรวจสอบ</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-gray-600 dark:text-gray-400">สำเร็จ</span>
        </div>
      </div>
    </div>
  );
};

export default TaskGanttChart;
