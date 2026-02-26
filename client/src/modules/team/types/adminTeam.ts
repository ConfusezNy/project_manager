// Types for admin team management
export interface AdminTeamMember {
    user_id: string;
    firstname: string | null;
    lastname: string | null;
    email: string | null;
}

export interface AdminTeam {
    team_id: number;
    name: string;
    groupNumber: string;
    status: string;
    semester: string;
    memberCount: number;
    members: AdminTeamMember[];
    section: {
        section_id: number;
        section_code: string;
        course_type: string;
        study_type: string;
        team_locked: boolean;
        term: {
            term_id: number;
            academicYear: string;
            semester: string;
        };
    };
    project: {
        project_id: number;
        projectname: string;
        projectnameEng: string | null;
        status: string | null;
    } | null;
}

export interface AdminTeamSection {
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
