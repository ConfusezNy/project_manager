"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Home,
  Timer,
  Search,
  User,
  Settings,
  Users,
  Folder,
  ChevronDown,
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
  const { status } = useSession();
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(false);

  // Self-contained: Fetch advisor's projects
  useEffect(() => {
    const fetchProjects = async () => {
      if (status !== "authenticated") return;

      try {
        setLoading(true);

        // Get advisor's projects
        const res = await fetch("/api/advisors/my-projects", {
          credentials: "include",
        });
        if (!res.ok) return;

        const data = await res.json();
        if (Array.isArray(data)) {
          setProjects(
            data.map((p: any) => ({
              project_id: p.project_id,
              projectname: p.projectname || "โครงงาน",
            })),
          );
        }
      } catch (err) {
        console.error("AdvisorSidebar: Failed to fetch projects", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [status]);

  const sidebarClassNames = `
    fixed inset-y-0 left-0 z-50 h-screen bg-white shadow-xl dark:bg-black 
    transition-[width] duration-300 ease-in-out overflow-hidden
    md:relative md:shadow-md
    ${
      isSidebarOpen
        ? "w-64 translate-x-0"
        : "w-64 -translate-x-full md:w-20 md:translate-x-0"
    }
  `;

  const linkBaseClass =
    "group flex items-center w-full py-4 px-6 transition-colors duration-300 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 cursor-pointer overflow-hidden";

  const subLinkClass =
    "group flex items-center w-full py-3 px-6 pl-10 transition-colors duration-300 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 cursor-pointer overflow-hidden text-sm";

  const contentClass = `
    text-lg font-bold
    whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out
    ${
      isSidebarOpen
        ? "max-w-[200px] opacity-100 ml-4 translate-x-0"
        : "max-w-0 opacity-0 ml-0 -translate-x-5"
    }
  `;

  const subContentClass = `
    whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out
    ${
      isSidebarOpen
        ? "max-w-[180px] opacity-100 ml-3 translate-x-0"
        : "max-w-0 opacity-0 ml-0 -translate-x-5"
    }
  `;

  const iconClass =
    "min-w-[24px] min-h-[24px] flex justify-center items-center";

  // Truncate project name
  const truncateName = (name: string, maxLen: number = 18) =>
    name.length > maxLen ? name.substring(0, maxLen) + "..." : name;

  return (
    <div className={sidebarClassNames}>
      <div className="h-full flex flex-col overflow-y-auto overflow-x-hidden">
        <nav className="flex flex-col gap-2 mt-0">
          <Link href="/" className={linkBaseClass}>
            <div className={iconClass}>
              <Home size={24} />
            </div>
            <span className={contentClass}>Home</span>
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
            <span className={contentClass}>User</span>
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

          {/* Project Section - Always Expanded */}
          <div className="w-full">
            {/* Section Header */}
            <div className="flex items-center w-full py-3 px-6 text-gray-500 dark:text-gray-500">
              <span
                className={`text-sm font-medium uppercase tracking-wider ${
                  isSidebarOpen ? "opacity-100" : "opacity-0 w-0"
                } transition-all duration-300`}
              >
                Projects ({projects.length})
              </span>
              <ChevronDown
                size={14}
                className={`ml-auto ${
                  isSidebarOpen ? "opacity-100" : "opacity-0"
                } transition-opacity duration-300`}
              />
            </div>

            {/* Loading State */}
            {loading && (
              <div className={subLinkClass}>
                <span className={subContentClass}>Loading...</span>
              </div>
            )}

            {/* Project List */}
            {!loading &&
              projects.length > 0 &&
              projects.map((project) => (
                <Link
                  key={project.project_id}
                  href={`/advisor-tasks?project=${project.project_id}`}
                  className={subLinkClass}
                >
                  <div className={iconClass}>
                    <Folder size={18} />
                  </div>
                  <span className={subContentClass} title={project.projectname}>
                    {truncateName(project.projectname)}
                  </span>
                </Link>
              ))}

            {/* No Projects */}
            {!loading && projects.length === 0 && (
              <div className={subLinkClass}>
                <div className={iconClass}>
                  <Folder size={18} className="text-gray-400" />
                </div>
                <span className={subContentClass}>ไม่มีโครงงาน</span>
              </div>
            )}
          </div>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
