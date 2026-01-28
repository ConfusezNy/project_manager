// Project Service - API calls for project management
// Usage: import { projectService } from '@/modules/team/services/projectService';

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
  advisor_id: number;
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
    const res = await fetch(`/api/projects?team_id=${teamId}`);
    if (!res.ok) return null;
    return res.json();
  },

  // Create new project
  async createProject(teamId: number, data: ProjectFormData) {
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, team_id: teamId }),
    });
    if (!res.ok) {
      const result = await res.json();
      throw new Error(result.message || "สร้างไม่สำเร็จ");
    }
    return res.json();
  },

  // Update project
  async updateProject(projectId: number, data: ProjectFormData) {
    const res = await fetch(`/api/projects/${projectId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const result = await res.json();
      throw new Error(result.message || "แก้ไขไม่สำเร็จ");
    }
    return res.json();
  },

  // Delete project
  async deleteProject(projectId: number) {
    const res = await fetch(`/api/projects/${projectId}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const result = await res.json();
      throw new Error(result.message || "ลบไม่สำเร็จ");
    }
    return res.json();
  },
};
