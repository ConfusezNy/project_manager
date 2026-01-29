"use client";

// useTaskBoard Hook - Manages task board state and logic
import { useState, useEffect, useCallback } from "react";
import { taskService } from "../services/taskService";
import type {
  Task,
  TaskStatus,
  TaskColumn,
  CreateTaskInput,
  UpdateTaskInput,
  TASK_COLUMNS,
} from "../types/task.types";

export interface UseTaskBoardResult {
  // State
  tasks: Task[];
  columns: TaskColumn[];
  loading: boolean;
  error: string | null;
  selectedTask: Task | null;

  // Modals
  showCreateModal: boolean;
  showDetailModal: boolean;

  // Actions
  setShowCreateModal: (show: boolean) => void;
  setShowDetailModal: (show: boolean) => void;
  setSelectedTask: (task: Task | null) => void;

  // Handlers
  handlers: {
    createTask: (data: CreateTaskInput) => Promise<void>;
    updateTask: (taskId: number, data: UpdateTaskInput) => Promise<void>;
    deleteTask: (taskId: number) => Promise<void>;
    moveTask: (
      taskId: number,
      newStatus: TaskStatus,
      newIndex?: number,
    ) => Promise<void>;
    assignUser: (taskId: number, userId: string) => Promise<void>;
    unassignUser: (taskId: number, userId: string) => Promise<void>;
    addComment: (taskId: number, text: string) => Promise<void>;
    refresh: () => Promise<void>;
  };
}

const COLUMNS: Omit<TaskColumn, "tasks">[] = [
  { id: "TODO" as TaskStatus, title: "ต้องทำ", color: "yellow" },
  { id: "IN_PROGRESS" as TaskStatus, title: "กำลังดำเนินการ", color: "blue" },
  {
    id: "IN_REVIEW" as TaskStatus,
    title: "อยู่ระหว่างตรวจสอบ",
    color: "purple",
  },
  { id: "DONE" as TaskStatus, title: "สำเร็จ", color: "green" },
];

export function useTaskBoard(projectId: number | null): UseTaskBoardResult {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    if (!projectId) {
      setTasks([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await taskService.getTasksByProject(projectId);
      setTasks(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch tasks");
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Group tasks by status into columns
  const columns: TaskColumn[] = COLUMNS.map((col) => ({
    ...col,
    tasks: tasks.filter((t) => t.status === col.id),
  }));

  // Handlers
  const createTask = useCallback(
    async (data: CreateTaskInput) => {
      if (!projectId) return;
      await taskService.createTask({ ...data, project_id: projectId });
      setShowCreateModal(false);
      await fetchTasks();
    },
    [projectId, fetchTasks],
  );

  const updateTask = useCallback(
    async (taskId: number, data: UpdateTaskInput) => {
      await taskService.updateTask(taskId, data);
      await fetchTasks();
      // Update selected task if viewing
      if (selectedTask?.task_id === taskId) {
        const updated = await taskService.getTask(taskId);
        setSelectedTask(updated);
      }
    },
    [fetchTasks, selectedTask],
  );

  const deleteTask = useCallback(
    async (taskId: number) => {
      await taskService.deleteTask(taskId);
      setShowDetailModal(false);
      setSelectedTask(null);
      await fetchTasks();
    },
    [fetchTasks],
  );

  const moveTask = useCallback(
    async (taskId: number, newStatus: TaskStatus, newIndex?: number) => {
      // Optimistic update
      setTasks((prev) => {
        const otherTasks = prev.filter((t) => t.task_id !== taskId);
        const task = prev.find((t) => t.task_id === taskId);
        if (!task) return prev;

        const updatedTask = { ...task, status: newStatus };

        let newTasks = [...otherTasks];
        // Insert at specific index if provided, otherwise append
        if (typeof newIndex === "number") {
          // Filter tasks in target column to find correct insertion point
          const targetColumnTasks = newTasks.filter(
            (t) => t.status === newStatus,
          );
          // Simple re-sort based on index isn't enough, we need to splice into the full array
          // For simplicity in optimistic UI, we just update status and let refetch fix order if complex
          // But if we want smooth DnD, we should handle array splicing
        }

        return prev.map((t) =>
          t.task_id === taskId ? { ...t, status: newStatus } : t,
        );
      });

      try {
        await taskService.updateTask(taskId, {
          status: newStatus,
          position: newIndex,
        });
      } catch {
        // Revert on error
        await fetchTasks();
      }
    },
    [fetchTasks],
  );

  const assignUser = useCallback(
    async (taskId: number, userId: string) => {
      await taskService.assignUser(taskId, { users_id: userId });
      await fetchTasks();
      if (selectedTask?.task_id === taskId) {
        const updated = await taskService.getTask(taskId);
        setSelectedTask(updated);
      }
    },
    [fetchTasks, selectedTask],
  );

  const unassignUser = useCallback(
    async (taskId: number, userId: string) => {
      await taskService.unassignUser(taskId, userId);
      await fetchTasks();
      if (selectedTask?.task_id === taskId) {
        const updated = await taskService.getTask(taskId);
        setSelectedTask(updated);
      }
    },
    [fetchTasks, selectedTask],
  );

  const addComment = useCallback(
    async (taskId: number, text: string) => {
      await taskService.addComment(taskId, { text });
      if (selectedTask?.task_id === taskId) {
        const updated = await taskService.getTask(taskId);
        setSelectedTask(updated);
      }
    },
    [selectedTask],
  );

  return {
    tasks,
    columns,
    loading,
    error,
    selectedTask,
    showCreateModal,
    showDetailModal,
    setShowCreateModal,
    setShowDetailModal,
    setSelectedTask,
    handlers: {
      createTask,
      updateTask,
      deleteTask,
      moveTask,
      assignUser,
      unassignUser,
      addComment,
      refresh: fetchTasks,
    },
  };
}
