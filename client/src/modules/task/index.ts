// Task Module - Barrel Export
// Usage: import { TaskBoard, TaskCard, useTaskBoard } from '@/modules/task';

// Components
export { TaskBoard } from "./components/TaskBoard";
export { TaskCard } from "./components/TaskCard";
export { TaskColumn } from "./components/TaskColumn";
export { TaskFormModal } from "./components/TaskFormModal";
export { TaskDetailModal } from "./components/TaskDetailModal";

// Hooks
export { useTaskBoard } from "./hooks/useTaskBoard";

// Services
export { taskService } from "./services/taskService";

// Types
export type {
  Task,
  TaskStatus,
  TaskPriority,
  TaskColumn as TaskColumnType,
  CreateTaskInput,
  UpdateTaskInput,
  TaskUser,
  TaskAssignee,
  TaskComment,
} from "./types/task.types";

export { TASK_COLUMNS } from "./types/task.types";
