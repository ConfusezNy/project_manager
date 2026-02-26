"use client";

// Admin Tasks Page — View/manage tasks for any project
// Cloned from advisor-tasks with admin-specific auth
import { useAuth } from "@/lib/auth-context";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { TaskBoard } from "@/modules/task";
import { ClipboardList, Lock, ArrowLeft } from "lucide-react";
import { api } from "@/lib/api";
import Link from "next/link";

interface ProjectData {
    project_id: number;
    project_name: string;
    description?: string;
    team_name?: string;
    group_number?: string;
}

function TasksContent() {
    const { status } = useAuth();
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
                    setError("กรุณาเลือกโครงงานจากหน้าจัดการโครงงาน");
                    return;
                }

                // Admin: fetch all projects and find the matching one
                const data = await api.get<{ projects: any[] }>("/admin/projects");
                if (!data.projects) {
                    setError("ไม่สามารถดึงข้อมูลโครงงานได้");
                    return;
                }

                const projectData = data.projects.find(
                    (p: any) => p.project_id === parseInt(projectIdParam),
                );

                if (!projectData) {
                    setError("ไม่พบโครงงานนี้ในระบบ");
                    return;
                }

                setProject({
                    project_id: projectData.project_id,
                    project_name: projectData.projectname || "โครงงาน",
                    description: projectData.description,
                    team_name: projectData.team?.name,
                    group_number: projectData.team?.groupNumber,
                });

                // Normalize team members so each has users_id at root level
                if (projectData.team?.members) {
                    const normalized = projectData.team.members.map((m: Record<string, unknown>) => ({
                        ...m,
                        users_id: (m as { users_id?: string }).users_id
                            || ((m as { user?: { users_id?: string } }).user?.users_id)
                            || "",
                    }));
                    setTeamMembers(normalized);
                }
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : "เกิดข้อผิดพลาด";
                setError(message);
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
                    <Link
                        href="/admin-projects"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <ArrowLeft size={16} />
                        กลับหน้าโครงงาน
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Main Content */}
            <div className="p-6">
                {/* Project Title */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400 flex items-center gap-3">
                        <ClipboardList size={32} />
                        {project?.project_name || "Project Tasks"}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        {project?.team_name && (
                            <span className="text-blue-500 font-medium">กลุ่ม {project.group_number} — {project.team_name}</span>
                        )}
                        {" • "}จัดการงานและติดตามความคืบหน้าของโครงงาน
                    </p>
                </div>

                {/* Task Board - Full Width (reusing existing component!) */}
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

export default function AdminTasksPage() {
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
