"use client";

// Advisor Tasks Page - View tasks for supervised projects
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { TaskBoard } from "@/modules/task";
import { ClipboardList, Lock } from "lucide-react";

interface ProjectData {
  project_id: number;
  project_name: string;
  description?: string;
}

function TasksContent() {
  const { status } = useSession();
  const searchParams = useSearchParams();
  const projectIdParam = searchParams.get("project");

  const [project, setProject] = useState<ProjectData | null>(null);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        if (!projectIdParam) {
          setError("กรุณาเลือกโครงงานจาก Sidebar");
          return;
        }

        // Get advisor's projects to verify access
        const res = await fetch("/api/advisors/my-projects", {
          credentials: "include",
        });
        if (!res.ok) {
          setError("ไม่สามารถดึงข้อมูลโครงงานได้");
          return;
        }

        const projects = await res.json();
        const projectData = projects.find(
          (p: any) => p.project_id === parseInt(projectIdParam),
        );

        if (!projectData) {
          setError("คุณไม่มีสิทธิ์เข้าถึงโครงงานนี้");
          return;
        }

        setProject({
          project_id: projectData.project_id,
          project_name: projectData.projectname || "โครงงาน",
          description: projectData.description,
        });

        // Get team members from project
        if (projectData.team?.members) {
          setTeamMembers(projectData.team.members);
        }
      } catch (err: any) {
        setError(err.message || "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchData();
    }
  }, [status, projectIdParam]);

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
            href="/advisorteams"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            กลับหน้าโครงงาน
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header Bar - Full Width */}
      <div className="bg-gradient-to-r from-blue-400 to-blue-500 px-6 py-3">
        <span className="text-white font-medium">Advisor Panel</span>
      </div>

      {/* Main Content - Full Width */}
      <div className="p-6">
        {/* Project Title */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400 flex items-center gap-3">
            <ClipboardList size={32} />
            {project?.project_name || "Project Tasks"}
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

export default function AdvisorTasksPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <TasksContent />
    </Suspense>
  );
}
