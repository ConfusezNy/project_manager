"use client";

// useTeamData Hook - Manages all team page state and logic
// Usage: const { teamData, loading, handlers } = useTeamData();

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  teamService,
  TeamData,
  PendingInvite,
  AvailableStudent,
} from "../services/teamService";
import {
  projectService,
  ProjectData,
  ProjectFormData,
} from "../services/projectService";

export interface UseTeamDataReturn {
  // Session
  user: any;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Team Data
  teamData: TeamData | null;
  section: any;
  projectData: ProjectData | null;
  pendingInvites: PendingInvite[];
  availableStudents: AvailableStudent[];
  hasTeam: boolean;

  // Loading States
  loading: boolean;
  submitting: boolean;
  inviting: boolean;
  joiningTeam: boolean;
  rejectingTeam: boolean;
  projectSubmitting: boolean;

  // Modal States
  showConfirm: boolean;
  setShowConfirm: (show: boolean) => void;
  showInviteModal: boolean;
  setShowInviteModal: (show: boolean) => void;
  showProjectModal: boolean;
  setShowProjectModal: (show: boolean) => void;
  showAdvisorModal: boolean;
  setShowAdvisorModal: (show: boolean) => void;
  isEditingProject: boolean;

  // Handlers
  handlers: {
    fetchData: () => Promise<void>;
    createTeam: () => Promise<void>;
    openInviteModal: () => Promise<void>;
    inviteMember: (userId: string) => Promise<void>;
    acceptInvite: (notificationId: number) => Promise<void>;
    rejectInvite: (notificationId: number) => Promise<void>;
    removeMember: (userId: string) => Promise<void>;
    createProject: () => void;
    editProject: () => void;
    submitProject: (data: ProjectFormData) => Promise<void>;
    deleteProject: () => Promise<void>;
  };
}

export function useTeamData(): UseTeamDataReturn {
  const { data: session, status } = useSession();
  const user = session?.user as any;

  // Core data states
  const [teamData, setTeamData] = useState<TeamData | null>(null);
  const [section, setSection] = useState<any>(null);
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [availableStudents, setAvailableStudents] = useState<
    AvailableStudent[]
  >([]);

  // Loading states
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [joiningTeam, setJoiningTeam] = useState(false);
  const [rejectingTeam, setRejectingTeam] = useState(false);
  const [projectSubmitting, setProjectSubmitting] = useState(false);

  // Modal states
  const [showConfirm, setShowConfirm] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showAdvisorModal, setShowAdvisorModal] = useState(false);
  const [isEditingProject, setIsEditingProject] = useState(false);

  // Fetch all data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Check if user has team
      const team = await teamService.getMyTeam();
      if (team) {
        setTeamData(team);
        setSection(team.section);

        // Fetch project if team exists
        const project = await projectService.getProjectByTeamId(team.team_id);
        setProjectData(project);
        setLoading(false);
        return;
      }

      // 2. If no team, get enrolled section
      const sec = await teamService.getMySection();
      setSection(sec);

      // 3. Get pending invites
      const invites = await teamService.getPendingInvites();
      setPendingInvites(invites);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    if (status === "authenticated") {
      fetchData();
    }
  }, [status, fetchData]);

  // Team handlers
  const createTeam = useCallback(async () => {
    if (!section?.section_id) {
      console.error(
        "[useTeamData] Cannot create team: section or section_id is missing",
        section,
      );
      alert("ไม่พบข้อมูล section กรุณาลองใหม่อีกครั้ง");
      return;
    }

    console.log(
      `[useTeamData] Creating team for section: ${section.section_id}`,
      section,
    );
    setSubmitting(true);
    try {
      await teamService.createTeam(section.section_id);
      setShowConfirm(false);
      await fetchData();
    } catch (error: any) {
      console.error("[useTeamData] Create team error:", error);
      alert(error.message || "เกิดข้อผิดพลาดในการสร้างทีม");
    } finally {
      setSubmitting(false);
    }
  }, [section, fetchData]);

  const openInviteModal = useCallback(async () => {
    // Use section from teamData if available, otherwise use section state
    const sectionId = teamData?.section?.section_id || section?.section_id;
    if (!sectionId) return;

    setShowInviteModal(true);
    const students = await teamService.getAvailableStudents(sectionId);
    setAvailableStudents(students);
  }, [teamData, section]);

  const inviteMember = useCallback(
    async (userId: string) => {
      if (!teamData) return;
      setInviting(true);
      try {
        await teamService.inviteMember(teamData.team_id, userId);
        alert("เชิญสมาชิกสำเร็จ!");
        setShowInviteModal(false);
        fetchData();
      } catch (error: any) {
        alert(error.message);
      } finally {
        setInviting(false);
      }
    },
    [teamData, fetchData],
  );

  const acceptInvite = useCallback(
    async (notificationId: number) => {
      setJoiningTeam(true);
      try {
        await teamService.acceptInvite(notificationId);
        alert("เข้าร่วมกลุ่มสำเร็จ!");
        fetchData();
      } catch (error: any) {
        alert(error.message);
      } finally {
        setJoiningTeam(false);
      }
    },
    [fetchData],
  );

  const rejectInvite = useCallback(
    async (notificationId: number) => {
      setRejectingTeam(true);
      try {
        await teamService.rejectInvite(notificationId);
        alert("ปฏิเสธคำเชิญแล้ว");
        fetchData();
      } catch (error: any) {
        alert(error.message);
      } finally {
        setRejectingTeam(false);
      }
    },
    [fetchData],
  );

  const removeMember = useCallback(
    async (userId: string) => {
      if (!teamData) return;

      const isRemovingSelf = userId === user?.user_id;

      if (isRemovingSelf) {
        if (
          !confirm(
            "คุณต้องการออกจากกลุ่มใช่หรือไม่?\n(ถ้าคุณเป็นสมาชิกคนสุดท้าย กลุ่มจะถูกลบ)",
          )
        ) {
          return;
        }
        try {
          await teamService.leaveTeam();
          alert("ออกจากกลุ่มสำเร็จ!");
          fetchData();
        } catch (error: any) {
          alert(error.message);
        }
      } else {
        if (!confirm("คุณต้องการลบสมาชิกคนนี้ออกจากกลุ่มใช่หรือไม่?")) {
          return;
        }
        try {
          await teamService.removeMember(teamData.team_id, userId);
          alert("ลบสมาชิกสำเร็จ!");
          fetchData();
        } catch (error: any) {
          alert(error.message);
        }
      }
    },
    [teamData, user, fetchData],
  );

  // Project handlers
  const createProject = useCallback(() => {
    setIsEditingProject(false);
    setShowProjectModal(true);
  }, []);

  const editProject = useCallback(() => {
    setIsEditingProject(true);
    setShowProjectModal(true);
  }, []);

  const submitProject = useCallback(
    async (formData: ProjectFormData) => {
      if (!teamData) return;
      setProjectSubmitting(true);
      try {
        if (isEditingProject && projectData) {
          await projectService.updateProject(projectData.project_id, formData);
          alert("แก้ไขหัวข้อโครงงานสำเร็จ!");
        } else {
          await projectService.createProject(teamData.team_id, formData);
          alert("สร้างหัวข้อโครงงานสำเร็จ!");
        }
        setShowProjectModal(false);
        fetchData();
      } catch (error: any) {
        alert(error.message);
      } finally {
        setProjectSubmitting(false);
      }
    },
    [teamData, projectData, isEditingProject, fetchData],
  );

  const deleteProject = useCallback(async () => {
    if (!projectData) return;
    if (!confirm("คุณต้องการลบหัวข้อโครงงานนี้ใช่หรือไม่?")) {
      return;
    }
    try {
      await projectService.deleteProject(projectData.project_id);
      alert("ลบหัวข้อโครงงานสำเร็จ!");
      setProjectData(null);
      fetchData();
    } catch (error: any) {
      alert(error.message);
    }
  }, [projectData, fetchData]);

  return {
    // Session
    user,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",

    // Data
    teamData,
    section,
    projectData,
    pendingInvites,
    availableStudents,
    hasTeam: !!teamData,

    // Loading states
    loading,
    submitting,
    inviting,
    joiningTeam,
    rejectingTeam,
    projectSubmitting,

    // Modal states
    showConfirm,
    setShowConfirm,
    showInviteModal,
    setShowInviteModal,
    showProjectModal,
    setShowProjectModal,
    showAdvisorModal,
    setShowAdvisorModal,
    isEditingProject,

    // Handlers
    handlers: {
      fetchData,
      createTeam,
      openInviteModal,
      inviteMember,
      acceptInvite,
      rejectInvite,
      removeMember,
      createProject,
      editProject,
      submitProject,
      deleteProject,
    },
  };
}
