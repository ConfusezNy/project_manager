"use client";

// Student Tasks Page - View tasks for student's own project
import { useAuth } from "@/lib/auth-context";
import { useEffect, useState } from "react";
import { TaskBoard } from "@/modules/task";
import { projectService } from "@/modules/team/services/projectService";
import { teamService } from "@/modules/team/services/teamService";
import { ClipboardList, Lock } from "lucide-react";

interface ProjectData {
  project_id: number;
  project_name: string;
  description?: string;
}

export default function StudentTasksPage() {
  const { status } = useAuth();
  const [project, setProject] = useState<ProjectData | null>(null);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Get user's team
        const team = await teamService.getMyTeam();
        if (!team) {
          setError("คุณยังไม่มีทีม กรุณาสร้างทีมก่อน");
          return;
        }

        // Get project for this team
        const projectData = await projectService.getProjectByTeamId(
          team.team_id,
        );
        if (!projectData) {
          setError("ทีมของคุณยังไม่มีโครงงาน กรุณาสร้างหัวข้อโครงงานก่อน");
          return;
        }

        // Check if project is approved
        if (projectData.status !== "APPROVED") {
          setError("โครงงานของคุณยังไม่ได้รับการอนุมัติจากอาจารย์");
          return;
        }

        setProject({
          project_id: projectData.project_id,
          project_name: projectData.projectname || "โครงงาน",
          description: projectData.description,
        });
        setTeamMembers(team.members || []);
      } catch (err: any) {
        setError(err.message || "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchData();
    }
  }, [status]);

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <div className="text-center max-w-md">
          <Lock
            size={64}
            className="mx-auto text-gray-300 dark:text-gray-600 mb-6"
          />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            ไม่สามารถเข้าถึง Tasks ได้
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">{error}</p>
          <a
            href="/Teams"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ไปหน้าจัดการทีม
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Main Content - Full Width */}
      <div className="p-6">
        {/* Project Title */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400 flex items-center gap-3">
            <ClipboardList size={32} />
            {project?.project_name || "Student Project Manager"}
          </h1>
          <p className="text-blue-500 dark:text-blue-400 mt-1">
            จัดการงานและติดตามความคืบหน้าของโครงงาน
          </p>
        </div>

        {/* Task Board - Full Width */}
        {project && (
          <TaskBoard
            projectId={project.project_id}
            teamMembers={teamMembers}
            projectName={project.project_name}
          />
        )}
      </div>
    </div>
  );
}
