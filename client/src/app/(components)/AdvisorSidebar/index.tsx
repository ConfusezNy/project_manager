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
  Folder, // 1. เพิ่มไอคอน Folder
} from "lucide-react";

interface SidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Sidebar = ({ isSidebarOpen,  }: SidebarProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
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

  const linkBaseClass = "group flex items-center w-full py-4 px-6 transition-colors duration-300 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 cursor-pointer overflow-hidden";

  // 2. ปรับ Text ให้ดูแพง (text-sm font-medium)
  const contentClass = `
    text-lg font-bold
    whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out
    ${isSidebarOpen 
      ? "max-w-[200px] opacity-100 ml-4 translate-x-0" 
      : "max-w-0 opacity-0 ml-0 -translate-x-5"        
    }
  `;

  const iconClass = "min-w-[24px] min-h-[24px] flex justify-center items-center";

  return (
    <div className={sidebarClassNames}>
      {/* 3. เอา shadow-md ตรงนี้ออก (ซ้ำซ้อน) */}
      <div className="h-full flex flex-col overflow-y-auto overflow-x-hidden">

        <nav className="flex flex-col gap-2 mt-0">
          
          <Link href="/" className={linkBaseClass}>
            <div className={iconClass}><Home size={24} /></div>
            <span className={contentClass}>Home</span>
          </Link>

          <Link href="/Timeline" className={linkBaseClass}>
            <div className={iconClass}><Timer size={24} /></div>
            <span className={contentClass}>Timeline</span>
          </Link>

          <Link href="/Search" className={linkBaseClass}>
             <div className={iconClass}><Search size={24} /></div>
            <span className={contentClass}>Search</span>
          </Link>

          <Link href="/User" className={linkBaseClass}>
             <div className={iconClass}><User size={24} /></div>
            <span className={contentClass}>User</span>
          </Link>

          <Link href="/advisorteams" className={linkBaseClass}>
             <div className={iconClass}><Users size={24} /></div>
            <span className={contentClass}>Teams</span>
          </Link>

          <Link href="/settings" className={linkBaseClass}>
             <div className={iconClass}><Settings size={24} /></div>
            <span className={contentClass}>Setting</span>
          </Link>

          {/* Dropdown Project */}
          <div className="w-full">
            <button
              type="button"
              onClick={toggleDropdown}
              className={linkBaseClass}
            >
              <div className="flex items-center">
                 <div className={iconClass}>
                    {/* 4. ใช้ไอคอน Folder แทนวงกลม/ลูกศร เพื่อสื่อความหมายว่าเป็น Project */}
                    <Folder size={22} />
                 </div>
              </div>

              {/* Text Project */}
              <span className={`flex-1 text-left ${contentClass}`}>
                Project
              </span>
              
              {/* Chevron Arrow ด้านขวา (จะซ่อนตัวเองเนียนๆ เมื่อ Sidebar ปิด) */}
              <div className={`${contentClass} flex items-center`}>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-300 ${
                        isDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
              </div>

            </button>
          </div>

        </nav>
      </div>
    </div>
  );
};

export default Sidebar;