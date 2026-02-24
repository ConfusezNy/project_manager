"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import {
  Home,
  Timer,
  Search,
  User,
  Settings,
  Users,
  Folder,
  ChevronDown,
  ChevronRight,
  ListTodo,
  FileText,
} from "lucide-react";

interface SidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

interface ProjectData {
  project_id: number;
  projectname: string;
}

const Sidebar = ({ isSidebarOpen }: SidebarProps) => {
  const { status } = useAuth();
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedProjects, setExpandedProjects] = useState<Set<number>>(
    new Set(),
  );

  // Self-contained: Fetch advisor's projects
  useEffect(() => {
    const fetchProjects = async () => {
      if (status !== "authenticated") return;

      try {
        setLoading(true);

        // Get advisor's projects
        const data = await api.get<any[]>("/advisors/my-projects");
        if (Array.isArray(data)) {
          // แสดงเฉพาะโปรเจกต์ที่อนุมัติแล้วใน sidebar
          const projectList = data
            .filter((p: any) => p.status === "APPROVED")
            .map((p: any) => ({
              project_id: p.project_id,
              projectname: p.projectname || "โครงงาน",
            }));
          setProjects(projectList);
          // Expand first project by default
          if (projectList.length > 0) {
            setExpandedProjects(new Set([projectList[0].project_id]));
          }
        }
      } catch (err) {
        console.error("AdvisorSidebar: Failed to fetch projects", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [status]);

  const toggleProject = (projectId: number) => {
    setExpandedProjects((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
      } else {
        newSet.add(projectId);
      }
      return newSet;
    });
  };

  const sidebarClassNames = `
    fixed inset-y-0 left-0 z-50 h-screen bg-white shadow-xl dark:bg-black 
    transition-[width] duration-300 ease-in-out overflow-hidden
    md:relative md:shadow-md
    ${isSidebarOpen
      ? "w-64 translate-x-0"
      : "w-64 -translate-x-full md:w-20 md:translate-x-0"
    }
  `;

  const linkBaseClass =
    "group flex items-center w-full py-4 px-6 transition-colors duration-300 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 cursor-pointer overflow-hidden";

  const subLinkClass =
    "group flex items-center w-full py-3 px-6 pl-12 transition-colors duration-300 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 cursor-pointer overflow-hidden text-sm";

  const contentClass = `
    text-lg font-bold
    whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out
    ${isSidebarOpen
      ? "max-w-[200px] opacity-100 ml-4 translate-x-0"
      : "max-w-0 opacity-0 ml-0 -translate-x-5"
    }
  `;

  const subContentClass = `
    whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out
    ${isSidebarOpen
      ? "max-w-[160px] opacity-100 ml-3 translate-x-0"
      : "max-w-0 opacity-0 ml-0 -translate-x-5"
    }
  `;

  const iconClass =
    "min-w-[24px] min-h-[24px] flex justify-center items-center";

  const smallIconClass =
    "min-w-[18px] min-h-[18px] flex justify-center items-center";

  // Truncate project name
  const truncateName = (name: string, maxLen: number = 18) =>
    name.length > maxLen ? name.substring(0, maxLen) + "..." : name;

  return (
    <div className={sidebarClassNames}>
      <div className="h-full flex flex-col overflow-y-auto overflow-x-hidden">
        <nav className="flex flex-col gap-2 mt-0">
          <Link href="/advisor-dashboard" className={linkBaseClass}>
            <div className={iconClass}>
              <Home size={24} />
            </div>
            <span className={contentClass}>Dashboard</span>
          </Link>

          <Link href="/Timeline" className={linkBaseClass}>
            <div className={iconClass}>
              <Timer size={24} />
            </div>
            <span className={contentClass}>Timeline</span>
          </Link>

          <Link href="/Search" className={linkBaseClass}>
            <div className={iconClass}>
              <Search size={24} />
            </div>
            <span className={contentClass}>Search</span>
          </Link>

          <Link href="/User" className={linkBaseClass}>
            <div className={iconClass}>
              <User size={24} />
            </div>
            <span className={contentClass}>Profile</span>
          </Link>

          <Link href="/advisor-users" className={linkBaseClass}>
            <div className={iconClass}>
              <Users size={24} />
            </div>
            <span className={contentClass}>ผู้ใช้งาน</span>
          </Link>

          <Link href="/advisorteams" className={linkBaseClass}>
            <div className={iconClass}>
              <Users size={24} />
            </div>
            <span className={contentClass}>Teams</span>
          </Link>

          <Link href="/settings" className={linkBaseClass}>
            <div className={iconClass}>
              <Settings size={24} />
            </div>
            <span className={contentClass}>Setting</span>
          </Link>

          {/* Project Section Header */}
          <div className="flex items-center w-full py-3 px-6 text-gray-500 dark:text-gray-500 mt-2">
            <span
              className={`text-sm font-medium uppercase tracking-wider ${isSidebarOpen ? "opacity-100" : "opacity-0 w-0"
                } transition-all duration-300`}
            >
              PROJECTS ({projects.length})
            </span>
          </div>

          {/* Loading State */}
          {loading && (
            <div className={linkBaseClass}>
              <div className={iconClass}>
                <Folder size={24} className="text-gray-400" />
              </div>
              <span className={contentClass}>Loading...</span>
            </div>
          )}

          {/* No Projects */}
          {!loading && projects.length === 0 && (
            <div className={linkBaseClass}>
              <div className={iconClass}>
                <Folder size={24} className="text-gray-400" />
              </div>
              <span className={contentClass}>ไม่มีโครงงาน</span>
            </div>
          )}

          {/* Project List with Dropdowns */}
          {!loading &&
            projects.map((project) => (
              <div key={project.project_id} className="w-full">
                {/* Project Header - Clickable to expand */}
                <button
                  onClick={() => toggleProject(project.project_id)}
                  className={`${linkBaseClass} justify-between`}
                >
                  <div className="flex items-center">
                    <div className={iconClass}>
                      <Folder size={24} className="text-amber-500" />
                    </div>
                    <span className={contentClass} title={project.projectname}>
                      {truncateName(project.projectname)}
                    </span>
                  </div>
                  <div
                    className={`transition-all duration-300 ${isSidebarOpen ? "opacity-100" : "opacity-0"
                      }`}
                  >
                    {expandedProjects.has(project.project_id) ? (
                      <ChevronDown size={16} />
                    ) : (
                      <ChevronRight size={16} />
                    )}
                  </div>
                </button>

                {/* Sub-menu items */}
                {expandedProjects.has(project.project_id) && (
                  <div className="overflow-hidden">
                    <Link
                      href={`/advisor-tasks?project=${project.project_id}`}
                      className={subLinkClass}
                    >
                      <div className={smallIconClass}>
                        <ListTodo size={18} />
                      </div>
                      <span className={subContentClass}>งาน</span>
                    </Link>
                    <Link
                      href={`/advisor-events?project=${project.project_id}`}
                      className={subLinkClass}
                    >
                      <div className={smallIconClass}>
                        <FileText size={18} />
                      </div>
                      <span className={subContentClass}>ส่งเอกสาร</span>
                    </Link>
                  </div>
                )}
              </div>
            ))}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
