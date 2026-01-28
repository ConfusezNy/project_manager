"use client";

// useAdvisorTeams Hook - Manages advisor teams page state and logic
import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

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
  const { data: session, status } = useSession();
  const user = session?.user as any;

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
        const response = await fetch("/api/advisors/my-projects");

        if (response.ok) {
          const data = await response.json();
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
      const response = await fetch(
        `/api/projects/${selectedProject.project_id}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "APPROVED" }),
        },
      );

      if (response.ok) {
        alert("อนุมัติโครงงานสำเร็จ!");
        await fetchProjects(selectedProject.project_id);
      } else {
        const data = await response.json();
        alert(data.message || "เกิดข้อผิดพลาด");
      }
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
      const response = await fetch(
        `/api/projects/${selectedProject.project_id}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "REJECTED" }),
        },
      );

      if (response.ok) {
        alert("ปฏิเสธโครงงานแล้ว");
        await fetchProjects(selectedProject.project_id);
      } else {
        const data = await response.json();
        alert(data.message || "เกิดข้อผิดพลาด");
      }
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
