"use client";

import React, { useState } from "react"; // 1. อย่าลืม import useState
import Navbar from "./(components)/Navbar";
import Sidebar from "./(components)/Sidebar";

const DashboardWrapper = ({ children }: { children: React.ReactNode }) => {
  // 2. สร้าง State กลาง (false = เริ่มต้นปิดไว้ก่อนสำหรับมือถือ)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full flex-col bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      
      {/* 3. ส่ง "ฟังก์ชันสลับ" ไปให้ Navbar (เพื่อเอาไปใส่ปุ่ม) */}
      <Navbar 
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
      />

      <div className="flex flex-1 overflow-hidden">
        
        {/* 4. ส่ง "สถานะ" ไปให้ Sidebar (เพื่อบอกว่าให้โผล่หรือซ่อน) */}
        <Sidebar 
           isSidebarOpen={isSidebarOpen} 
           setIsSidebarOpen={setIsSidebarOpen} 
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardWrapper;