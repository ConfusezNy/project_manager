"use client";

import Link from "next/link";
import React, { useState } from "react";
import {
  ChevronDown,
  Home,
  Timer,
  Search,
  User,
  Settings,
  Users,
} from "lucide-react";

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen }: any) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // ฟังก์ชันสลับสถานะ Dropdown
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (

    
    <div className="fixed inset-y-0 left-0 z-50 h-screen w-64 overflow-y-auto bg-white shadow-md dark:bg-black md:relative md:h-full">
      <div className="p-4">

        <nav className="flex flex-col gap-8">
          {/* Menu: Home */}
          <Link
            href="/"
            className="flex w-full items-center gap-3 text-xl font-semibold text-gray-700 transition-colors hover:text-blue-500 dark:text-gray-300"
          >
            <Home size={24} />
            Home
          </Link>

          {/* Menu: Timeline */}
          <Link
            href="/Timeline"
            className="flex w-full items-center gap-3 text-xl font-semibold text-gray-700 transition-colors hover:text-blue-500 dark:text-gray-300"
          >
            <Timer size={24} />
            Timeline
          </Link>

          {/* Menu: Search */}
          <Link
            href="/Search"
            className="flex w-full items-center gap-3 text-xl font-semibold text-gray-700 transition-colors hover:text-blue-500 dark:text-gray-300"
          >
            <Search size={24} />
            Search
          </Link>

          {/* Menu: User */}
          <Link
            href="/User"
            className="flex w-full items-center gap-3 text-xl font-semibold text-gray-700 transition-colors hover:text-blue-500 dark:text-gray-300"
          >
            <User size={24} />
            User
          </Link>

          {/* Menu: Teams */}
          <Link
            href="/Teams"
            className="flex w-full items-center gap-3 text-xl font-semibold text-gray-700 transition-colors hover:text-blue-500 dark:text-gray-300"
          >
            <Users size={24} />
            Teams
          </Link>

          {/* Menu: Settings */}
          <Link
            href="/settings"
            className="flex w-full items-center gap-3 text-xl font-semibold text-gray-700 transition-colors hover:text-blue-500 dark:text-gray-300"
          >
            <Settings size={24} />
            Setting
          </Link>

          {/* Dropdown Project */}
          <div className="w-full">
            <button
              type="button"
              onClick={toggleDropdown}
              className="group flex w-full items-center justify-between rounded-base px-2 py-1.5 text-body transition-colors hover:bg-gray-100 hover:text-fg-brand dark:hover:bg-gray-800"
            >
              <span className="flex-1 whitespace-nowrap text-left text-xl font-semibold text-gray-700 rtl:text-right dark:text-gray-300">
                Project
              </span>

              <ChevronDown
                className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

          </div>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;