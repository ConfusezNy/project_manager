// Team Service - API calls for team management
// Usage: import { teamService } from '@/modules/team/services/teamService';
import { api } from "@/lib/api";

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
  users_id: string;
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
    try {
      const data = await api.get<any>("/teams/my-team");
      if (!data) return null;

      // Prisma returns relation as 'Team' (uppercase)
      const team = data?.Team || data?.team;
      if (!team) return null;

      // Normalize Prisma PascalCase to camelCase
      return {
        ...team,
        section: team.Section || team.section,
        members: (team.Teammember || team.members || []).map((m: any) => {
          // Get users_id from multiple possible sources (FK is user_id, PK is users_id)
          const usersId = m.user_id || m.Users?.users_id || m.user?.users_id;
          const userObj = m.Users || m.user;
          return {
            ...m,
            users_id: usersId, // Standard field for components
            user: userObj
              ? {
                ...userObj,
                users_id: userObj.users_id || usersId,
              }
              : undefined,
            firstname: userObj?.firstname || m.firstname,
            lastname: userObj?.lastname || m.lastname,
          };
        }),
      };
    } catch (error) {
      return null;
    }
  },

  // Fetch user's section
  async getMySection() {
    try {
      return await api.get<any>("/sections/my-section");
    } catch {
      return null;
    }
  },

  // Fetch pending invites
  async getPendingInvites(): Promise<PendingInvite[]> {
    try {
      return await api.get<PendingInvite[]>("/teams/pending-invites");
    } catch {
      return [];
    }
  },

  // Create new team
  async createTeam(sectionId: number) {
    try {
      return await api.post("/teams", { sectionId });
    } catch (error: any) {
      throw new Error(error.message || "สร้างกลุ่มไม่สำเร็จ");
    }
  },

  // Get available students for invite
  async getAvailableStudents(sectionId: number): Promise<AvailableStudent[]> {
    try {
      return await api.get<AvailableStudent[]>(
        `/sections/${sectionId}/available-students`,
      );
    } catch {
      return [];
    }
  },

  // Invite member to team
  async inviteMember(teamId: number, inviteeUserId: string) {
    try {
      return await api.post("/teams/invite", { teamId, inviteeUserId });
    } catch (error: any) {
      throw new Error(error.message || "เชิญสมาชิกไม่สำเร็จ");
    }
  },

  // Accept invite
  async acceptInvite(notificationId: number) {
    try {
      return await api.post("/teams/join", { notificationId });
    } catch (error: any) {
      throw new Error(error.message || "เข้าร่วมกลุ่มไม่สำเร็จ");
    }
  },

  // Reject invite
  async rejectInvite(notificationId: number) {
    try {
      return await api.post("/teams/reject", { notificationId });
    } catch (error: any) {
      throw new Error(error.message || "ปฏิเสธไม่สำเร็จ");
    }
  },

  // Leave team
  async leaveTeam() {
    try {
      return await api.post("/teams/leave", {});
    } catch (error: any) {
      throw new Error(error.message || "ออกจากกลุ่มไม่สำเร็จ");
    }
  },

  // Remove member from team
  async removeMember(teamId: number, userId: string) {
    try {
      return await api.delete(`/teams/${teamId}/members/${userId}`);
    } catch (error: any) {
      throw new Error(error.message || "ลบสมาชิกไม่สำเร็จ");
    }
  },
};
