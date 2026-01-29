"use client";

// TaskBoard - Main Kanban board component
import React, { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  DragOverlay,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { Plus, LayoutGrid, GanttChart } from "lucide-react";
import { TaskColumn } from "./TaskColumn";
import { TaskCard } from "./TaskCard";
import { TaskFormModal } from "./TaskFormModal";
import { TaskDetailModal } from "./TaskDetailModal";
import { useTaskBoard } from "../hooks/useTaskBoard";
import type { Task, TaskStatus } from "../types/task.types";

interface TaskBoardProps {
  projectId: number;
  projectName?: string;
  teamMembers?: Array<{
    users_id: string;
    user?: {
      users_id: string;
      firstname?: string;
      lastname?: string;
    };
  }>;
}

export const TaskBoard: React.FC<TaskBoardProps> = ({
  projectId,
  projectName,
  teamMembers = [],
}) => {
  const {
    columns,
    loading,
    error,
    selectedTask,
    showCreateModal,
    showDetailModal,
    setShowCreateModal,
    setShowDetailModal,
    setSelectedTask,
    handlers,
  } = useTaskBoard(projectId);

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [viewMode, setViewMode] = useState<"board" | "timeline">("board");

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  // DnD handlers
  const handleDragStart = (event: DragStartEvent) => {
    const taskId = parseInt(event.active.id as string);
    const task = columns
      .flatMap((c) => c.tasks)
      .find((t) => t.task_id === taskId);
    setActiveTask(task || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = parseInt(active.id as string);
    const overId = over.id as string;

    // Find the source column and task
    const sourceColumn = columns.find((col) =>
      col.tasks.some((t) => t.task_id === taskId),
    );
    if (!sourceColumn) return;

    const task = sourceColumn.tasks.find((t) => t.task_id === taskId);
    if (!task) return;

    // Check if dropped on a column directly (empty column case)
    let targetColumnId = overId;
    let newIndex = 0; // Default to top if empty

    // Case 1: Dropped on a Column (Empty or specific area)
    const isColumn = columns.some((c) => c.id === overId);

    // Case 2: Dropped on a Task Item
    if (!isColumn) {
      // Find which column the "over" task belongs to
      const overTaskId = parseInt(overId);
      const columnOfOverTask = columns.find((col) =>
        col.tasks.some((t) => t.task_id === overTaskId),
      );

      if (columnOfOverTask) {
        targetColumnId = columnOfOverTask.id;
        // Calculate new index
        const overTaskIndex = columnOfOverTask.tasks.findIndex(
          (t) => t.task_id === overTaskId,
        );
        // If sorting in same column vs moving to different one
        newIndex = overTaskIndex;
      }
    } else {
      // Dropped on column header/area -> add to end
      const targetCol = columns.find((c) => c.id === targetColumnId);
      newIndex = targetCol ? targetCol.tasks.length : 0;
    }

    // Call API if status changed OR index changed
    if (sourceColumn.id !== targetColumnId || true) {
      // Note: "true" logic implies we want to support reordering even in same column
      // Cast targetColumnId to TaskStatus
      await handlers.moveTask(taskId, targetColumnId as TaskStatus, newIndex);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    // Could be used for visual feedback
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setShowDetailModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">กำลังโหลด Tasks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-red-500">
          <p>{error}</p>
          <button
            onClick={handlers.refresh}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            ลองใหม่
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          {/* View Switcher */}
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode("board")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === "board"
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              <LayoutGrid size={16} />
              Board
            </button>
            <button
              onClick={() => setViewMode("timeline")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === "timeline"
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              <GanttChart size={16} />
              Timeline
            </button>
          </div>
        </div>

        {/* New Task Button */}
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <Plus size={18} />
          New Board
        </button>
      </div>

      {/* Board View */}
      {viewMode === "board" && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
        >
          <div className="flex gap-4 overflow-x-auto pb-4">
            {columns.map((column) => (
              <TaskColumn
                key={column.id}
                id={column.id}
                title={column.title}
                color={column.color}
                tasks={column.tasks}
                onTaskClick={handleTaskClick}
                onAddClick={() => setShowCreateModal(true)}
              />
            ))}
          </div>

          {/* Drag Overlay */}
          <DragOverlay>
            {activeTask && (
              <div className="rotate-3">
                <TaskCard task={activeTask} />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      )}

      {/* Timeline View Placeholder */}
      {viewMode === "timeline" && (
        <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <GanttChart
              size={48}
              className="mx-auto text-gray-300 dark:text-gray-600 mb-4"
            />
            <p className="text-gray-500 dark:text-gray-400">
              Gantt Chart จะถูกเพิ่มใน Phase 2.3
            </p>
          </div>
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <TaskFormModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handlers.createTask}
          teamMembers={teamMembers}
        />
      )}

      {showDetailModal && selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedTask(null);
          }}
          onUpdate={handlers.updateTask}
          onDelete={handlers.deleteTask}
          onAddComment={handlers.addComment}
          onAssign={handlers.assignUser}
          onUnassign={handlers.unassignUser}
          teamMembers={teamMembers}
        />
      )}
    </div>
  );
};

export default TaskBoard;
