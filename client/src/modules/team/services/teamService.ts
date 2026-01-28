// Team Service - API calls for team management
// Usage: import { teamService } from '@/modules/team/services/teamService';

export interface TeamData {
  team_id: number;
  teamname: string;
  semester?: string;
  section?: {
    section_id: number;
    section_code: string;
    term?: {
      term_name: string;
      semester: string;
      academicYear: string;
    };
  };
  members?: TeamMember[];
}

export interface TeamMember {
  user_id: string;
  firstname: string;
  lastname: string;
  email: string;
  role: string;
}

export interface PendingInvite {
  notification_id: number;
  actor?: {
    firstname: string;
    lastname: string;
  };
  team?: {
    team_id: number;
    name: string;
    section?: {
      section_code: string;
    };
    members?: TeamMember[];
  };
}

export interface AvailableStudent {
  users_id: string;
  firstname: string;
  lastname: string;
  email: string;
}

export const teamService = {
  // Fetch user's team
  async getMyTeam() {
    const res = await fetch("/api/teams/my-team");
    if (!res.ok) return null;
    const data = await res.json();
    // Prisma returns relation as 'Team' (uppercase)
    const team = data?.Team || data?.team;
    if (!team) return null;

    // Normalize Prisma PascalCase to camelCase
    return {
      ...team,
      section: team.Section || team.section,
      members: (team.Teammember || team.members || []).map((m: any) => ({
        ...m,
        user: m.Users || m.user,
        users_id: m.Users?.users_id || m.user?.users_id || m.user_id,
        firstname: m.Users?.firstname || m.user?.firstname || m.firstname,
        lastname: m.Users?.lastname || m.user?.lastname || m.lastname,
      })),
    };
  },

  // Fetch user's section
  async getMySection() {
    const res = await fetch("/api/sections/my-section");
    if (!res.ok) return null;
    return res.json();
  },

  // Fetch pending invites
  async getPendingInvites(): Promise<PendingInvite[]> {
    const res = await fetch("/api/teams/pending-invites");
    if (!res.ok) return [];
    return res.json();
  },

  // Create new team
  async createTeam(sectionId: number) {
    const res = await fetch("/api/teams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sectionId }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || "สร้างกลุ่มไม่สำเร็จ");
    }
    return res.json();
  },

  // Get available students for invite
  async getAvailableStudents(sectionId: number): Promise<AvailableStudent[]> {
    const res = await fetch(`/api/sections/${sectionId}/available-students`);
    if (!res.ok) return [];
    return res.json();
  },

  // Invite member to team
  async inviteMember(teamId: number, inviteeUserId: string) {
    const res = await fetch("/api/teams/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teamId, inviteeUserId }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || "เชิญสมาชิกไม่สำเร็จ");
    }
    return res.json();
  },

  // Accept invite
  async acceptInvite(notificationId: number) {
    const res = await fetch("/api/teams/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notificationId }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || "เข้าร่วมกลุ่มไม่สำเร็จ");
    }
    return res.json();
  },

  // Reject invite
  async rejectInvite(notificationId: number) {
    const res = await fetch("/api/teams/reject", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notificationId }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || "ปฏิเสธไม่สำเร็จ");
    }
    return res.json();
  },

  // Leave team
  async leaveTeam() {
    const res = await fetch("/api/teams/leave", { method: "POST" });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || "ออกจากกลุ่มไม่สำเร็จ");
    }
    return res.json();
  },

  // Remove member from team
  async removeMember(teamId: number, userId: string) {
    const res = await fetch(`/api/teams/${teamId}/members/${userId}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || "ลบสมาชิกไม่สำเร็จ");
    }
    return res.json();
  },
};
