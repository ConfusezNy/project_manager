// Task Service - API calls for task management
// Usage: import { taskService } from '@/modules/task/services/taskService';

import { api } from "@/lib/api";
import type {
  Task,
  CreateTaskInput,
  UpdateTaskInput,
  AssignTaskInput,
  CreateCommentInput,
  TaskComment,
} from "../types/task.types";

export const taskService = {
  // Get all tasks for a project
  async getTasksByProject(projectId: number): Promise<Task[]> {
    return api.get<Task[]>(`/api/tasks?project_id=${projectId}`);
  },

  // Get single task
  async getTask(taskId: number): Promise<Task> {
    return api.get<Task>(`/api/tasks/${taskId}`);
  },

  // Create new task
  async createTask(data: CreateTaskInput): Promise<Task> {
    return api.post<Task>("/api/tasks", data);
  },

  // Update task
  async updateTask(taskId: number, data: UpdateTaskInput): Promise<Task> {
    return api.put<Task>(`/api/tasks/${taskId}`, data);
  },

  // Delete task
  async deleteTask(taskId: number): Promise<void> {
    return api.delete(`/api/tasks/${taskId}`);
  },

  // Update task status (for drag & drop)
  async updateTaskStatus(taskId: number, status: string): Promise<Task> {
    return this.updateTask(taskId, { status: status as any });
  },

  // Assign user to task
  async assignUser(taskId: number, data: AssignTaskInput): Promise<void> {
    return api.post(`/api/tasks/${taskId}/assign`, { user_id: data.users_id });
  },

  // Unassign user from task
  async unassignUser(taskId: number, userId: string): Promise<void> {
    // Note: DELETE with body is non-standard but supported by Next.js API
    return api.delete(`/api/tasks/${taskId}/assign`, {
      body: JSON.stringify({ user_id: userId }),
      headers: { "Content-Type": "application/json" },
    });
  },

  // Get task comments
  async getComments(taskId: number): Promise<TaskComment[]> {
    return api.get<TaskComment[]>(`/api/tasks/${taskId}/comments`);
  },

  // Add comment to task
  async addComment(
    taskId: number,
    data: CreateCommentInput,
  ): Promise<TaskComment> {
    return api.post<TaskComment>(`/api/tasks/${taskId}/comments`, data);
  },
};
