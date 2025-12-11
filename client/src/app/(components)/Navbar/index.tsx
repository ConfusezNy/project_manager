"use client";

import React, { useState, useEffect } from "react";
import { Search, Sun, Moon, Settings, Bell } from "lucide-react";
import { useTheme } from "next-themes";
import HamburgerBtn from "../HamburgerBtn";

const Navbar = ({ toggleSidebar }: { toggleSidebar: () => void }) => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // รอให้ Component โหลดเสร็จก่อน (แก้ Hydration Error)
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex w-full items-center justify-between bg-white px-4 py-3 shadow-md transition-colors duration-200 dark:bg-black">
      
      {/* --- ส่วนซ้าย: Hamburger + Logo --- */}
      <div className="flex items-center gap-4">
        <HamburgerBtn onClick={toggleSidebar} />
        <h2 className="text-center text-xl font-bold text-gray-800 dark:text-gray-200 whitespace-nowrap">
          Project Management
        </h2>
      </div>

      {/* --- ส่วนกลาง: Search Bar --- */}
      <div className="flex items-center gap-4">
        <div className="relative hidden h-min w-[200px] lg:w-[400px] md:flex">
          <span className="absolute left-1 top-1/2 -translate-y-1/2 p-2">
            <Search className="h-5 w-5 text-gray-500" />
          </span>
          <input
            className="w-full rounded bg-gray-100 p-2 pl-10 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
            type="text"
            placeholder="ค้นหา..."
          />
        </div>
      </div>

      {/* --- ส่วนขวา: Icons & Profile --- */}
      <div className="flex items-center gap-2 md:gap-4">
        
        {/* Mobile Search Icon */}
        <button className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800 md:hidden">
          <Search className="h-5 w-5 text-gray-500 dark:text-gray-300" />
        </button>

        {/* Notification */}
        <button className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800">
          <Bell className="h-5 w-5 text-gray-500 dark:text-gray-300" />
        </button>

        {/* --- ปุ่มเปลี่ยนโหมด (จุดที่แก้: เพิ่มการเช็ค mounted) --- */}
        <button
          className="rounded-full p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {/* ถ้ายังไม่ mounted ให้แสดงช่องว่าง หรือถ้า mounted แล้วให้เช็ค theme */}
          {mounted ? (
            theme === "dark" ? (
              <Sun className="h-6 w-6 text-gray-500 dark:text-gray-300" />
            ) : (
              <Moon className="h-6 w-6 text-gray-500 dark:text-gray-300" />
            )
          ) : (
            // Placeholder กันกระพริบตอนโหลด
            <div className="h-6 w-6" />
          )}
        </button>

        {/* Settings */}
        <button className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800">
          <Settings className="h-6 w-6 text-gray-500 dark:text-gray-300" />
        </button>

        <div className="mx-1 h-6 w-[1px] bg-gray-200 dark:bg-gray-700"></div>

        {/* Profile */}
        <div className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-blue-600 font-bold text-white">
          A
        </div>

        {/* Logout */}
        <button
          className="hidden ml-2 rounded-md border border-transparent bg-blue-500 px-4 py-2 text-center text-sm text-white shadow-md transition-all hover:bg-blue-800 hover:shadow-lg focus:bg-blue-800 focus:shadow-none md:block"
          type="button"
        >
          ออกจากระบบ
        </button>
      </div>
    </div>
  );
};

export default Navbar;