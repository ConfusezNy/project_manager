"use client";

import React from "react";
import { Menu } from "lucide-react"; // ใช้ไอคอนจาก Lucide

// รับ props: onClick (ฟังก์ชันที่จะทำงานเมื่อกดปุ่ม)
interface HamburgerBtnProps {
  onClick: () => void;
  className?: string; // เผื่ออยากปรับแต่งเพิ่มเติม
}

const HamburgerBtn = ({ onClick, className = "" }: HamburgerBtnProps) => {
  return (
    <button
      onClick={onClick}
      className={`p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors ${className}`}
      aria-label="Toggle Menu"
    >
      <Menu size={24} />
    </button>
  );
};

export default HamburgerBtn;