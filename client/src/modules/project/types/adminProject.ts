// Types for admin project management
export interface ProjectMember {
    user_id: string;
    firstname: string | null;
    lastname: string | null;
    email: string | null;
}

export interface ProjectAdvisor {
    user_id: string;
    firstname: string | null;
    lastname: string | null;
    titles: string | null;
    email: string | null;
}

export interface Project {
    project_id: number;
    projectname: string;
    projectnameEng: string | null;
    description: string | null;
    status: string | null;
    isArchived: boolean;
    createdAt: string;
    team: {
        team_id: number;
        name: string;
        groupNumber: string;
        memberCount: number;
        members: ProjectMember[];
        section: {
            section_id: number;
            section_code: string;
            course_type: string;
            term?: {
                term_id: number;
                academicYear: string;
                semester: string;
            };
        };
    } | null;
    advisors: ProjectAdvisor[];
}

export interface ProjectStats {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
}

export interface Section {
    section_id: number;
    section_code: string;
    course_type: string;
    study_type: string;
    Term: {
        term_id: number;
        academicYear: number;
        semester: number;
    };
}
