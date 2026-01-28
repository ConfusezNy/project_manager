// Section Service - API calls for section management
// Usage: import { sectionService } from '@/modules/section/services/sectionService';

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
    const res = await fetch("/api/sections", { cache: "no-store" });
    if (!res.ok) throw new Error("ไม่สามารถโหลดข้อมูล section ได้");
    return res.json();
  },

  // Fetch all terms
  async getTerms(): Promise<Term[]> {
    const res = await fetch("/api/terms", { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return data.sort(
      (a: Term, b: Term) =>
        Number(b.academicYear) - Number(a.academicYear) ||
        Number(b.semester) - Number(a.semester),
    );
  },

  // Create section
  async createSection(form: CreateSectionForm) {
    const res = await fetch("/api/sections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || "เกิดข้อผิดพลาด");
    }
    return res.json();
  },

  // Create term
  async createTerm(form: CreateTermForm) {
    const res = await fetch("/api/terms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "สร้างเทอมไม่สำเร็จ");
    }
    return res.json();
  },

  // Get enrollments for a section
  async getEnrollments(sectionId: number): Promise<Enrollment[]> {
    const res = await fetch(`/api/sections/${sectionId}/enrollments`);
    if (!res.ok) return [];
    return res.json();
  },

  // Get candidates for enrollment
  async getCandidates(sectionId: number): Promise<Candidate[]> {
    const res = await fetch(`/api/sections/${sectionId}/candidates`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.candidates || [];
  },

  // Enroll students
  async enrollStudents(sectionId: number, userIds: string[]) {
    const res = await fetch(`/api/sections/${sectionId}/enroll`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ users_ids: userIds }),
    });
    if (!res.ok) throw new Error("Enroll ล้มเหลว");
    return res.json();
  },

  // Continue to project (for PRE_PROJECT sections)
  async continueToProject(sectionId: number, newTermId: string) {
    const res = await fetch(`/api/sections/${sectionId}/continue-to-project`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ new_term_id: newTermId }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || "ต่อวิชาล้มเหลว");
    }
    return res.json();
  },
};
