"use client";

import React, { useState } from "react";
import Navbar from "./(components)/Navbar";
import Sidebar from "./(components)/Sidebar";
import { usePathname } from "next/navigation"; // เพิ่มบรรทัดนี้

const DashboardWrapper = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname(); // เพิ่มบรรทัดนี้

  // หน้าที่ไม่ต้องการ navbar/sidebar
  const publicPages = ['/singin', '/signup'];
  const isPublicPage = publicPages.includes(pathname);

  // ถ้าเป็นหน้า public ให้แสดงแค่ children 0
  if (isPublicPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen w-full flex-col bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      <Navbar 
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
      />

      <div className="flex flex-1 overflow-hidden">
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