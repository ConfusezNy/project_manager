/**
 * Project Service - API calls for project management
 * ⚠️ สิ่งที่เปลี่ยนจากเดิม:
 * - เดิม: ใช้ raw fetch("/api/projects/*")
 * - ใหม่: ใช้ api.* wrapper (จัดการ BASE_URL + JWT token อัตโนมัติ)
 */

import { api } from "@/lib/api";

export interface ProjectFormData {
  projectname: string;
  projectnameEng?: string;
  project_type?: string;
  description?: string;
}

export interface ProjectData {
  project_id: number;
  projectname: string;
  projectnameEng?: string;
  project_type?: string;
  description?: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  advisors?: ProjectAdvisor[];
}

export interface ProjectAdvisor {
  advisor_id: string;
  advisor?: {
    titles?: string;
    firstname: string;
    lastname: string;
    email: string;
  };
}

export const projectService = {
  // Get project by team ID
  async getProjectByTeamId(teamId: number): Promise<ProjectData | null> {
    try {
      return await api.get<ProjectData>(`/projects?team_id=${teamId}`);
    } catch {
      return null;
    }
  },

  // Create new project
  async createProject(teamId: number, data: ProjectFormData) {
    return api.post("/projects", { ...data, team_id: teamId });
  },

  // Update project
  async updateProject(projectId: number, data: ProjectFormData) {
    return api.put(`/projects/${projectId}`, data);
  },

  // Delete project
  async deleteProject(projectId: number) {
    return api.delete(`/projects/${projectId}`);
  },
};
