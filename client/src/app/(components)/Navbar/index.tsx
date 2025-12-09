"use client";

import React from "react";
import { Search, Sun, Moon, Settings, Bell, Menu } from "lucide-react";
import { useTheme } from "next-themes";
import HamburgerBtn from "../HamburgerBtn";

const Navbar = ({ toggleSidebar }: { toggleSidebar: () => void }) => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex w-full items-center justify-between bg-white px-4 py-1 shadow-md transition-colors duration-200 dark:bg-black">

      <div className="flex items-center gap-4">
        <HamburgerBtn onClick={toggleSidebar}/>
        <h2 className="text-center text-xl font-bold text-gray-800 dark:text-gray-200">
          Project Management
        </h2>
      </div>
      
      {/* --- เมนู (Mobile) + ค้นหา (Desktop) --- */}
      <div className="flex items-center gap-4">
        {/* ปุ่ม Hamburger: โชว์เฉพาะมือถือ */}
        <button
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 md:hidden"
          onClick={toggleSidebar}
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* ช่องค้นหา: ซ่อนในมือถือ (hidden), โชว์ในจอ tablet ขึ้นไป (md:flex) */}
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
        
        {/* 3. ปุ่มค้นหาแบบ Icon: โชว์เฉพาะมือถือ (md:hidden) เผื่อคนอยากค้นหา */}
        <button className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800 md:hidden">
          <Search className="h-5 w-5 text-gray-500 dark:text-gray-300" />
        </button>

        {/* ปุ่มแจ้งเตือน */}
        <button className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800">
          <Bell className="h-5 w-5 text-gray-500 dark:text-gray-300" />
        </button>

        {/* ปุ่มเปลี่ยนโหมด */}
        <button
          className="rounded-full p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
          onClick={() => {
            setTheme(theme === "dark" ? "light" : "dark");
          }}
        >
          {theme === "dark" ? (
            <Sun className="h-6 w-6 text-gray-500 dark:text-gray-300" />
          ) : (
            <Moon className="h-6 w-6 text-gray-500 dark:text-gray-300" />
          )}
        </button>

        {/* ปุ่ม Settings */}
        <button className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800">
          <Settings className="h-6 w-6 text-gray-500 dark:text-gray-300" />
        </button>

        {/* เส้นคั่นแนวตั้ง (สวยงาม) */}
        <div className="mx-1 h-6 w-[1px] bg-gray-200 dark:bg-gray-700"></div>

        {/* รูปโปรไฟล์ */}
        <div className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-blue-600 font-bold text-white">
          A
        </div>

        {/* 4. ปุ่มออกจากระบบ: ซ่อนในมือถือ (hidden), โชว์ในจอ tablet ขึ้นไป (md:block) */}
        <button
          className="hidden ml-2 rounded-md border border-transparent bg-blue-500 px-4 py-2 text-center text-sm text-white shadow-md transition-all hover:bg-blue-800 hover:shadow-lg focus:bg-blue-800 focus:shadow-none active:bg-blue-800 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none md:block"
          type="button"
        >
          ออกจากระบบ
        </button>
      </div>
    </div>
  );
};

export default Navbar;