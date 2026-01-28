"use client";

import React, { useState } from "react";
import Navbar from "./(components)/Navbar";
import { usePathname } from "next/navigation";
import AdminSidebar from "./(components)/AdminSidebar";
import { useSession } from "next-auth/react";
import StudentSidebar from "./(components)/StudentSidebar";
import AdvisorSidebar from "./(components)/AdvisorSidebar";

const DashboardWrapper = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role;

  // หน้าที่ไม่ต้องการ navbar/sidebar
  const publicPages = ["/singin", "/singup"];
  const isPublicPage = publicPages.includes(pathname);

  if (isPublicPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen w-full flex-col bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="flex flex-1 overflow-hidden">
        {userRole === "ADMIN" ? (
          <AdminSidebar
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
          />
        ) : userRole === "ADVISOR" ? (
          <AdvisorSidebar
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
          />
        ) : userRole === "STUDENT" ? (
          <StudentSidebar
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
          />
        ) : null}

        <main className="flex-1 overflow-y-auto p-4 md:p-6 transition-all duration-300">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardWrapper;
