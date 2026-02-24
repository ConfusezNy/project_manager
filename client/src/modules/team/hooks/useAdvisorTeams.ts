"use client";

// useAdvisorTeams Hook - Manages advisor teams page state and logic
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

export interface AdvisorProject {
  project_id: number;
  projectname: string;
  projectnameEng?: string;
  project_type?: string;
  description?: string;
  status: string;
  team: {
    team_id: number;
    groupNumber: number;
    semester: string;
    section: {
      section_code: string;
      term?: {
        term_name: string;
        semester: string;
        academicYear: string;
      };
    };
    members: Array<{
      user: {
        users_id: number;
        firstname: string;
        lastname: string;
        email: string;
        titles?: string;
      };
    }>;
  };
  advisors: Array<{
    advisor: {
      users_id: number;
      firstname: string;
      lastname: string;
      email: string;
      titles?: string;
    };
  }>;
}

export function useAdvisorTeams() {
  const { user, status } = useAuth();

  const [projects, setProjects] = useState<AdvisorProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<AdvisorProject | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchProjects = useCallback(
    async (keepSelectedId?: number) => {
      try {
        setLoading(true);
        const data = await api.get<AdvisorProject[]>("/advisors/my-projects");
        if (data) {
          setProjects(data);

          // Keep selected project or auto-select first
          if (keepSelectedId) {
            const updated = data.find(
              (p: AdvisorProject) => p.project_id === keepSelectedId,
            );
            if (updated) {
              setSelectedProject(updated);
            }
          } else if (data.length > 0 && !selectedProject) {
            setSelectedProject(data[0]);
          }
        }
      } catch (error) {
        console.error("Fetch projects error:", error);
      } finally {
        setLoading(false);
      }
    },
    [selectedProject],
  );

  useEffect(() => {
    if (status === "authenticated") {
      fetchProjects();
    }
  }, [status, fetchProjects]);

  const handleApprove = useCallback(async () => {
    if (!selectedProject) return;
    if (!confirm("คุณต้องการอนุมัติโครงงานนี้ใช่หรือไม่?")) return;

    try {
      setActionLoading(true);
      await api.put(`/projects/${selectedProject.project_id}/status`, { status: "APPROVED" });
      alert("อนุมัติโครงงานสำเร็จ!");
      await fetchProjects(selectedProject.project_id);
    } catch (error) {
      alert("เกิดข้อผิดพลาด");
    } finally {
      setActionLoading(false);
    }
  }, [selectedProject, fetchProjects]);

  const handleReject = useCallback(async () => {
    if (!selectedProject) return;
    if (!confirm("คุณต้องการปฏิเสธโครงงานนี้ใช่หรือไม่?")) return;

    try {
      setActionLoading(true);
      await api.put(`/projects/${selectedProject.project_id}/status`, { status: "REJECTED" });
      alert("ปฏิเสธโครงงานแล้ว");
      await fetchProjects(selectedProject.project_id);
    } catch (error) {
      alert("เกิดข้อผิดพลาด");
    } finally {
      setActionLoading(false);
    }
  }, [selectedProject, fetchProjects]);

  return {
    // Session
    user,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",

    // Data
    projects,
    selectedProject,
    setSelectedProject,
    loading,
    actionLoading,

    // Handlers
    handlers: {
      fetchProjects,
      handleApprove,
      handleReject,
    },
  };
}
