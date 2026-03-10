"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { useNotification } from "@/lib/notification-context";
import { useAutoMarkRead } from "@/modules/notification/hooks/useAutoMarkRead";
import {
  Home,
  Search,
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
  const { unreadCount, notifications } = useNotification();
  const [project, setProject] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(false);
  const [isProjectExpanded, setIsProjectExpanded] = useState(true);

  // คำนวณ badge count แยกตาม section
  const teamsCount = notifications.filter(
    (n) => !n.isRead && (n.event_type === "TEAM_INVITE" || n.event_type === "TEAM_MEMBER_JOINED")
  ).length;
  const tasksCount = notifications.filter(
    (n) => !n.isRead && (n.event_type === "TASK_ASSIGNED" || n.event_type === "TASK_UPDATED" || n.event_type === "COMMENT_ADDED")
  ).length;
  const eventsCount = notifications.filter(
    (n) => !n.isRead && (
      n.event_type === "EVENT_CREATED" ||
      n.event_type === "SUBMISSION_APPROVED" ||
      n.event_type === "SUBMISSION_REJECTED"
    )
  ).length;
  const dashboardCount = notifications.filter(
    (n) => !n.isRead && (n.event_type === "GRADE_GIVEN" || n.event_type === "PROJECT_APPROVED" || n.event_type === "PROJECT_REJECTED")
  ).length;

  // auto-mark unread notifications เป็น read เมื่อ navigate มาหน้านี้
  useAutoMarkRead();
  useEffect(() => {
    const fetchProject = async () => {
      if (status !== "authenticated") return;

      try {
        setLoading(true);

        // Get team
        const teamData = await api.get<any>("/teams/my-team");
        const team = teamData?.team || teamData?.Team || teamData;
        if (!team?.team_id) return;

        // Get project
        const projectData = await api.get<any>(`/projects?team_id=${team.team_id}`);
        // แสดงใน sidebar เฉพาะโปรเจกต์ที่อนุมัติแล้ว
        if (projectData?.project_id && projectData?.status === "APPROVED") {
          setProject({
            project_id: projectData.project_id,
            projectname: projectData.projectname || "โครงงาน",
          });
        }
      } catch (err) {
        console.error("Sidebar: Failed to fetch project", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [status]);

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

  const contentClass = `
    text-lg font-bold
    whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out
    ${isSidebarOpen
      ? "max-w-[200px] opacity-100 ml-4 translate-x-0"
      : "max-w-0 opacity-0 ml-0 -translate-x-5"
    }
  `;

  const iconClass =
    "min-w-[24px] min-h-[24px] flex justify-center items-center relative";

  // Truncate project name for sidebar display
  const truncateName = (name: string, maxLen: number = 18) =>
    name.length > maxLen ? name.substring(0, maxLen) + "..." : name;

  return (
    <div className={sidebarClassNames}>
      <div className="h-full flex flex-col overflow-y-auto overflow-x-hidden">
        <nav className="flex flex-col gap-2 mt-0">
          <Link href="/dashboard" className={linkBaseClass}>
            <div className={iconClass}>
              <Home size={24} />
              {!isSidebarOpen && dashboardCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-[3px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {dashboardCount > 99 ? "99+" : dashboardCount}
                </span>
              )}
            </div>
            <span className={contentClass}>Dashboard</span>
            {isSidebarOpen && dashboardCount > 0 && (
              <span className="ml-auto flex-shrink-0 min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {dashboardCount > 99 ? "99+" : dashboardCount}
              </span>
            )}
          </Link>

          <Link href="/Search" className={linkBaseClass}>
            <div className={iconClass}>
              <Search size={24} />
            </div>
            <span className={contentClass}>Search</span>
          </Link>

          <Link href="/classmates" className={linkBaseClass}>
            <div className={iconClass}>
              <Users size={24} />
            </div>
            <span className={contentClass}>Classmates</span>
          </Link>

          <Link href="/Teams" className={linkBaseClass}>
            <div className={iconClass}>
              <Users size={24} />
              {!isSidebarOpen && teamsCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-[3px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {teamsCount > 99 ? "99+" : teamsCount}
                </span>
              )}
            </div>
            <span className={contentClass}>Teams</span>
            {isSidebarOpen && teamsCount > 0 && (
              <span className="ml-auto flex-shrink-0 min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {teamsCount > 99 ? "99+" : teamsCount}
              </span>
            )}
          </Link>

          <Link href="/settings" className={linkBaseClass}>
            <div className={iconClass}>
              <Settings size={24} />
            </div>
            <span className={contentClass}>Settings</span>
          </Link>

          {/* Project Section Header */}
          <div className="flex items-center w-full py-3 px-6 text-gray-500 dark:text-gray-500 mt-2">
            <span
              className={`text-sm font-medium uppercase tracking-wider ${isSidebarOpen ? "opacity-100" : "opacity-0 w-0"
                } transition-all duration-300`}
            >
              PROJECT
            </span>
          </div>

          {/* Project Dropdown */}
          {project ? (
            <div className="w-full">
              {/* Project Header - Clickable to expand */}
              <button
                onClick={() => setIsProjectExpanded(!isProjectExpanded)}
                className={`${linkBaseClass} justify-between`}
              >
                <div className="flex items-center">
                  <div className={iconClass}>
                    <Folder size={24} className="text-gray-600 dark:text-gray-400" />
                  </div>
                  <span className={contentClass} title={project.projectname}>
                    {truncateName(project.projectname)}
                  </span>
                </div>
                <div
                  className={`transition-all duration-300 ${isSidebarOpen ? "opacity-100" : "opacity-0"
                    }`}
                >
                  {isProjectExpanded ? (
                    <ChevronDown size={16} />
                  ) : (
                    <ChevronRight size={16} />
                  )}
                </div>
              </button>

              {/* Sub-menu items */}
              {isProjectExpanded && (
                <div className="overflow-hidden bg-gray-50/50 dark:bg-gray-900/20">
                  <Link href="/tasks" className={linkBaseClass}>
                    <div className={`${iconClass} ml-2`}>
                      <div className="absolute -left-3 top-1/2 w-2 h-[1px] bg-gray-300 dark:bg-gray-600"></div>
                      <div className="absolute -left-3 -top-4 w-[1px] h-[calc(100%+16px)] bg-gray-300 dark:bg-gray-600"></div>
                      <ListTodo size={20} className="text-gray-500" />
                    </div>
                    <span className={contentClass}>งาน</span>
                    {isSidebarOpen && tasksCount > 0 && (
                      <span className="ml-auto flex-shrink-0 min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {tasksCount > 99 ? "99+" : tasksCount}
                      </span>
                    )}
                  </Link>
                  <Link href="/events" className={linkBaseClass}>
                    <div className={`${iconClass} ml-2`}>
                      <div className="absolute -left-3 top-1/2 w-2 h-[1px] bg-gray-300 dark:bg-gray-600"></div>
                      <div className="absolute -left-3 -top-4 w-[calc(50%+16px)] h-[1px] bg-transparent border-l border-gray-300 dark:border-gray-600"></div>
                      <div className="absolute -left-3 bottom-1/2 w-[1px] h-10 bg-gray-300 dark:bg-gray-600"></div>
                      <FileText size={20} className="text-gray-500" />
                    </div>
                    <span className={contentClass}>ส่งเอกสาร</span>
                    {isSidebarOpen && eventsCount > 0 && (
                      <span className="ml-auto flex-shrink-0 min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {eventsCount > 99 ? "99+" : eventsCount}
                      </span>
                    )}
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className={linkBaseClass}>
              <div className={iconClass}>
                <Folder size={24} className="text-gray-400" />
              </div>
              <span className={contentClass}>
                {loading ? "Loading..." : "ไม่มีโครงงาน"}
              </span>
            </div>
          )}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
