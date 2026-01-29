"use client";

// ProjectContext - Share project data across components
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useSession } from "next-auth/react";
import { projectService } from "@/modules/team/services/projectService";
import { teamService } from "@/modules/team/services/teamService";

interface ProjectData {
  project_id: number;
  projectname: string;
  description?: string;
  status?: string;
}

interface ProjectContextType {
  project: ProjectData | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const { data: session, status: authStatus } = useSession();
  const [project, setProject] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProject = async () => {
    if (authStatus !== "authenticated") {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get user's team
      const team = await teamService.getMyTeam();
      if (!team) {
        setProject(null);
        return;
      }

      // Get project for this team
      const projectData = await projectService.getProjectByTeamId(team.team_id);
      if (!projectData) {
        setProject(null);
        return;
      }

      setProject({
        project_id: projectData.project_id,
        projectname: projectData.projectname || "โครงงาน",
        description: projectData.description,
        status: projectData.status,
      });
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาด");
      setProject(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [authStatus]);

  return (
    <ProjectContext.Provider
      value={{
        project,
        loading,
        error,
        refresh: fetchProject,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
}
