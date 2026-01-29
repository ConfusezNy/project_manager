// Task Types - Type definitions for task module
// Usage: import { Task, TaskStatus, CreateTaskInput } from '@/modules/task/types/task.types';

export type TaskStatus = "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface Task {
  task_id: number;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  tags?: string | null;
  startDate?: Date | null;
  dueDate?: Date | null;
  authorUserId: string;
  project_id: number;
  position: number;
  author?: TaskUser;
  assignees?: TaskAssignee[];
  comments?: TaskComment[];
  _count?: {
    Comment: number;
    TaskAssignment: number;
  };
}

export interface TaskUser {
  users_id: string;
  firstname?: string | null;
  lastname?: string | null;
  email?: string | null;
  profilePicture?: string | null;
}

export interface TaskAssignee {
  users_id: string;
  user?: TaskUser;
}

export interface TaskComment {
  comment_id: number;
  text: string;
  createdAt: Date;
  isRead: boolean;
  users_id: string;
  user?: TaskUser;
}

// Input types
export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  tags?: string;
  startDate?: string;
  dueDate?: string;
  project_id: number;
  assigneeIds?: string[];
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  tags?: string;
  startDate?: string;
  dueDate?: string;
  position?: number;
}

export interface AssignTaskInput {
  users_id: string;
}

export interface CreateCommentInput {
  text: string;
}

// Kanban board types
export interface TaskColumn {
  id: TaskStatus;
  title: string;
  color: string;
  tasks: Task[];
}

export const TASK_COLUMNS: Omit<TaskColumn, "tasks">[] = [
  { id: "TODO", title: "ต้องทำ", color: "yellow" },
  { id: "IN_PROGRESS", title: "กำลังดำเนินการ", color: "blue" },
  { id: "IN_REVIEW", title: "อยู่ระหว่างตรวจสอบ", color: "purple" },
  { id: "DONE", title: "สำเร็จ", color: "green" },
];
