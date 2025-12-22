'use client';

import { useState } from "react";
import { useSession } from "next-auth/react";
import SettingsTabs from "../(components)/SettingsTabs";
import ProfileSettings from "../(components)/ProfileSettings";
import SystemSettings from "../(components)/SystemsSettings";
import NotificationSettings from "../(components)/NotificationSettings"; // 👈 เพิ่มการ Import นี้

export default function SettingsPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<"profile" | "notification" | "system">("profile");
  
  const userRole = session?.user?.role; 
  const isAdmin = userRole === "ADMIN"; 

  return (
    <div className="w-full p-4 md:p-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">ตั้งค่าการใช้งาน</h1>
        <p className="text-gray-500 dark:text-gray-400">จัดการข้อมูลส่วนตัว{isAdmin && "และการตั้งค่าระบบ"}</p>
      </div>
      
      <SettingsTabs 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isAdmin={isAdmin} 
      />

      <div className="mt-6 w-full">
        {activeTab === "profile" && <ProfileSettings />}
        
        {/* 👈 เปลี่ยนจาก DIV เปล่า เป็น Component ที่เราสร้างขึ้น */}
        {activeTab === "notification" && <NotificationSettings />}

        {activeTab === "system" && isAdmin && <SystemSettings />}
      </div>
    </div>
  );
}