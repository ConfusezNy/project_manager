'use client';

/**
 * SettingsTabs — แถบเมนูในหน้า Settings
 * - ทุก role: แสดงเฉพาะ "โปรไฟล์ส่วนตัว"
 * - ADVISOR: แสดงเพิ่ม "ความเชี่ยวชาญ / วิชาที่สอน"
 * ลบ: notification, system (ยังไม่ connect backend จริง)
 */

type Tab = { id: 'profile' | 'skills'; label: string };

interface SettingsTabsProps {
  activeTab: 'profile' | 'skills';
  setActiveTab: (tab: 'profile' | 'skills') => void;
  isAdvisor: boolean;
}

export default function SettingsTabs({ activeTab, setActiveTab, isAdvisor }: SettingsTabsProps) {
  const allTabs: Tab[] = [
    { id: 'profile', label: 'โปรไฟล์ส่วนตัว' },
    { id: 'skills', label: 'ความเชี่ยวชาญ / วิชาที่สอน' }, // เฉพาะ ADVISOR
  ];

  // กรองเมนู: แสดง skills เฉพาะ ADVISOR
  const visibleTabs = allTabs.filter((tab) => {
    if (tab.id === 'skills') return isAdvisor;
    return true;
  });

  return (
    <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
      {visibleTabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`px-4 py-2 text-sm font-medium transition-all duration-200 whitespace-nowrap border-b-2 ${activeTab === tab.id
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}