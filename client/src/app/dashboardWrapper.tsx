"use client";

import React, { useState } from "react";
import Navbar from "./(components)/Navbar";
import Sidebar from "./(components)/Sidebar";

const DashboardWrapper = ({ children }: { children: React.ReactNode }) => {
  // Google Classroom: ปกติ Desktop จะเปิด Sidebar ไว้ก่อน (true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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

        <main className="flex-1 overflow-y-auto p-4 md:p-6 transition-all duration-300">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardWrapper;