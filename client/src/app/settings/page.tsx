"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import SettingsTabs from "../(components)/SettingsTabs";
import ProfileSettings from "../(components)/ProfileSettings";
import AdvisorSkillsSettings from "../(components)/AdvisorSkillsSettings";

export default function SettingsPage() {
  const { user: session } = useAuth();
  const [activeTab, setActiveTab] = useState<"profile" | "skills">("profile");

  const userRole = session?.role;
  const isAdvisor = userRole === "ADVISOR";

  return (
    <div className="w-full p-4 md:p-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          ตั้งค่าการใช้งาน
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          จัดการข้อมูลส่วนตัว{isAdvisor && "และความเชี่ยวชาญของคุณ"}
        </p>
      </div>

      <SettingsTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isAdvisor={isAdvisor}
      />

      <div className="mt-6 w-full">
        {activeTab === "profile" && <ProfileSettings />}
        {activeTab === "skills" && isAdvisor && <AdvisorSkillsSettings />}
      </div>
    </div>
  );
}
