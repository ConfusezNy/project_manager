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
  project_deadline: string;
  team_deadline: string;
  term: {
    term_id: number;
    term_name?: string;
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
  project_deadline: string;
  team_deadline: string;
  term_id: string;
}

export interface CreateTermForm {
  academicYear: string;
  semester: string;
  startDate: string;
  endDate: string;
}

export const sectionService = {
  // Fetch all sections
  async getSections(): Promise<Section[]> {
    const data = await api.get<any[]>("/api/sections", { cache: "no-store" });
    if (!data) return [];
    // Transform Prisma's capital property names to lowercase for frontend compatibility
    return data.map((s: any) => ({
      ...s,
      term: s.Term || s.term, // Handle both cases
    }));
  },

  // Fetch all terms
  async getTerms(): Promise<Term[]> {
    const data = await api.get<Term[]>("/api/terms", { cache: "no-store" });
    if (!data) return [];
    return data.sort(
      (a: Term, b: Term) =>
        Number(b.academicYear) - Number(a.academicYear) ||
        Number(b.semester) - Number(a.semester),
    );
  },

  // Create section
  async createSection(form: CreateSectionForm) {
    return api.post("/api/sections", form);
  },

  // Create term
  async createTerm(form: CreateTermForm) {
    return api.post("/api/terms", form);
  },

  // Get enrollments for a section
  async getEnrollments(sectionId: number): Promise<Enrollment[]> {
    return api.get<Enrollment[]>(`/api/sections/${sectionId}/enrollments`);
  },

  // Get candidates for enrollment
  async getCandidates(sectionId: number): Promise<Candidate[]> {
    const data = await api.get<{ candidates: Candidate[] }>(
      `/api/sections/${sectionId}/candidates`,
    );
    return data?.candidates || [];
  },

  // Enroll students
  async enrollStudents(sectionId: number, userIds: string[]) {
    return api.post(`/api/sections/${sectionId}/enroll`, {
      users_ids: userIds,
    });
  },

  // Continue to project (for PRE_PROJECT sections)
  async continueToProject(sectionId: number, newTermId: string) {
    return api.post(`/api/sections/${sectionId}/continue-to-project`, {
      new_term_id: newTermId,
    });
  },
};
