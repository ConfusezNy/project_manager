"use client";

import React from "react";
import { Search } from "lucide-react";
import HamburgerBtn from "../HamburgerBtn";
import NotificationDropdown from "../NotificationDropdown"; 
import ThemeToggle from "../ThemeToggle";
import Profile from "../profile"; // คอมโพเนนต์ที่จะแสดงรูป

const Navbar = ({ toggleSidebar }: { toggleSidebar: () => void }) => {
  return (
    <div className="flex w-full items-center justify-between bg-white px-4 py-3 shadow-md transition-colors duration-200 dark:bg-black">
      
      {/* --- Left: Hamburger + Logo --- */}
      <div className="flex items-center gap-4">
        <HamburgerBtn onClick={toggleSidebar} />
        <h2 className="text-center text-xl font-bold text-gray-800 dark:text-gray-200 whitespace-nowrap">
          Project Management
        </h2>
      </div>

      {/* --- Right: Icons & Profile --- */}
      <div className="flex items-center gap-2 md:gap-4">
        
        {/* Mobile Search Icon */}
        <button className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800 md:hidden">
          <Search className="h-5 w-5 text-gray-500 dark:text-gray-300" />
        </button>

        {/* ✅ Notification Component */}
        <NotificationDropdown />

        {/* ✅ ThemeToggle Component */}
        <ThemeToggle />

        <div className="mx-1 h-6 w-[1px] bg-gray-200 dark:bg-gray-700"></div>

        {/* ✅ คอมโพเนนต์ที่แสดงรูปโปรไฟล์ที่เราจะแก้ในขั้นตอนถัดไป */}
        <Profile />
      </div>
    </div>
  );
};

export default Navbar;