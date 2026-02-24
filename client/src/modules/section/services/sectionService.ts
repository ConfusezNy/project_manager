// Section Service - API calls for section management
// Usage: import { sectionService } from '@/modules/section/services/sectionService';
import { api } from "@/lib/api";

export interface Section {
  section_id: number;
  section_code: string;
  course_type: string;
  study_type: string;
  min_team_size: number;
  max_team_size: number;

  team_locked: boolean;
  term: {
    term_id: number;
    term_name?: string;
    academicYear?: string;
    semester?: string;
  };
}

export interface Term {
  term_id: number;
  academicYear: string;
  semester: string;
}

export interface Candidate {
  users_id: string;
  firstname: string | null;
  lastname: string | null;
  email: string | null;
}

export interface Enrollment {
  enrollment_id: number;
  users_id: string;
  section_id: number;
  enrolledAt: string;
  user: {
    users_id: string;
    firstname: string | null;
    lastname: string | null;
  };
}

export interface CreateSectionForm {
  section_code: string;
  course_type: string;
  study_type: string;
  min_team_size: number;
  max_team_size: number;

  team_locked: boolean;
  term_id: string;
}

export interface CreateTermForm {
  academicYear: string;
  semester: string;
  startDate: string;
  endDate: string;
}

export interface SectionTeam {
  team_id: number;
  name: string;
  groupNumber: string;
  status: string;
  memberCount: number;
  members: {
    user_id: string;
    firstname: string | null;
    lastname: string | null;
  }[];
  project: {
    project_id: number;
    projectname: string;
    status: string | null;
  } | null;
}

export interface SectionTeamsResponse {
  section_id: number;
  section_code: string;
  course_type: string;
  term: {
    term_id: number;
    academicYear: number;
    semester: number;
  };
  teams: SectionTeam[];
}

export const sectionService = {
  // Fetch all sections
  async getSections(): Promise<Section[]> {
    const data = await api.get<any[]>("/sections", { cache: "no-store" });
    if (!data) return [];
    // Transform Prisma's capital property names to lowercase for frontend compatibility
    return data.map((s: any) => ({
      ...s,
      term: s.Term || s.term, // Handle both cases
    }));
  },

  // Fetch all terms
  async getTerms(): Promise<Term[]> {
    const data = await api.get<Term[]>("/terms", { cache: "no-store" });
    if (!data) return [];
    return data.sort(
      (a: Term, b: Term) =>
        Number(b.academicYear) - Number(a.academicYear) ||
        Number(b.semester) - Number(a.semester),
    );
  },

  // Create section
  async createSection(form: CreateSectionForm) {
    return api.post("/sections", form);
  },

  // Create term
  async createTerm(form: CreateTermForm) {
    return api.post("/terms", form);
  },

  // Get enrollments for a section
  async getEnrollments(sectionId: number): Promise<Enrollment[]> {
    return api.get<Enrollment[]>(`/sections/${sectionId}/enrollments`);
  },

  // Get candidates for enrollment
  async getCandidates(sectionId: number): Promise<Candidate[]> {
    const data = await api.get<{ candidates: Candidate[] }>(
      `/sections/${sectionId}/candidates`,
    );
    return data?.candidates || [];
  },

  // Enroll students
  async enrollStudents(sectionId: number, userIds: string[]) {
    return api.post(`/sections/${sectionId}/enroll`, {
      users_ids: userIds,
    });
  },

  // Get teams for a section (for continue to project)
  async getTeamsBySection(sectionId: number): Promise<SectionTeamsResponse> {
    return api.get<SectionTeamsResponse>(`/sections/${sectionId}/teams`);
  },

  // Continue to project (for PRE_PROJECT sections)
  async continueToProject(
    sectionId: number,
    newTermId: string,
    teamIds?: number[],
  ) {
    return api.post(`/sections/${sectionId}/continue-to-project`, {
      new_term_id: newTermId,
      team_ids: teamIds,
    });
  },

  // Delete a section (Admin only)
  async deleteSection(sectionId: number) {
    return api.delete(`/sections/${sectionId}`);
  },

  // Toggle team lock for a section
  async toggleTeamLock(sectionId: number, locked: boolean) {
    return api.patch(`/sections/${sectionId}`, {
      team_locked: locked,
    });
  },
};
