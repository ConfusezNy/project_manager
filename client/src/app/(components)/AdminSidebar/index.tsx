"use client";

import Link from "next/link";
import React from "react";
import {
  Home,
  Book,
  Timer,
  Search,
  User,
  Settings,
  Users,
  Folder,
  Calendar,
  Award,
} from "lucide-react";

interface SidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const AdminSidebar = ({ isSidebarOpen }: SidebarProps) => {
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
    "min-w-[24px] min-h-[24px] flex justify-center items-center";

  return (
    <div className={sidebarClassNames}>
      <div className="h-full flex flex-col overflow-y-auto overflow-x-hidden">
        <nav className="flex flex-col gap-2 mt-0">
          <Link href="/admin-dashboard" className={linkBaseClass}>
            <div className={iconClass}>
              <Home size={24} />
            </div>
            <span className={contentClass}>Dashboard</span>
          </Link>

          <Link href="/sections" className={linkBaseClass}>
            <div className={iconClass}>
              <Book size={24} />
            </div>
            <span className={contentClass}>Section</span>
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

          <Link href="/admin-teams" className={linkBaseClass}>
            <div className={iconClass}>
              <Users size={24} />
            </div>
            <span className={contentClass}>จัดการทีม</span>
          </Link>

          <Link href="/admin-events" className={linkBaseClass}>
            <div className={iconClass}>
              <Calendar size={24} />
            </div>
            <span className={contentClass}>กำหนดการ</span>
          </Link>

          <Link href="/admin-grades" className={linkBaseClass}>
            <div className={iconClass}>
              <Award size={24} />
            </div>
            <span className={contentClass}>ให้เกรด</span>
          </Link>

          <Link href="/admin-projects" className={linkBaseClass}>
            <div className={iconClass}>
              <Folder size={24} />
            </div>
            <span className={contentClass}>โครงงานทั้งหมด</span>
          </Link>

          <Link href="/settings" className={linkBaseClass}>
            <div className={iconClass}>
              <Settings size={24} />
            </div>
            <span className={contentClass}>Setting</span>
          </Link>
        </nav>
      </div>
    </div>
  );
};

export default AdminSidebar;

