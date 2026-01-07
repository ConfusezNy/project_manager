'use client';

type Tab = { id: "profile" | "notification" | "system"; label: string };

export default function SettingsTabs({ activeTab, setActiveTab, isAdmin }: any) {
  // กำหนดรายการเมนู
  const allTabs: Tab[] = [
    { id: "profile", label: "โปรไฟล์ส่วนตัว" },
    { id: "notification", label: "การแจ้งเตือน" },
    { id: "system", label: "ตั้งค่าระบบปริญญานิพนธ์" }, // เมนูนี้จะถูกกรองออกถ้าไม่ใช่ Admin
  ];

  // 🔍 กรองเมนู: ถ้าไม่ใช่ Admin ให้ตัด 'system' ออกจากรายการ
  const visibleTabs = allTabs.filter(tab => {
    if (tab.id === "system") return isAdmin;
    return true;
  });

  return (
    <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
      {visibleTabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`px-4 py-2 text-sm font-medium transition-all duration-200 whitespace-nowrap border-b-2 ${
            activeTab === tab.id
              ? "border-blue-500 text-blue-600 dark:text-blue-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}