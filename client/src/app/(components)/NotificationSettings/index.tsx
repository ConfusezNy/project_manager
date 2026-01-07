'use client';

import React, { useState } from 'react';
import { Bell, Mail, MessageSquare, Calendar, ShieldCheck } from 'lucide-react';

export default function NotificationSettings() {
  // สร้าง State สำหรับเก็บค่าการตั้งค่า (ในอนาคตใช้ดึงจาก DB)
  const [settings, setSettings] = useState({
    emailComment: true,
    emailStatusChange: true,
    emailDeadline: true,
    appAnnouncement: true,
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 space-y-8 animate-in fade-in duration-300">
      
      <div>
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 flex items-center gap-2">
          <Mail size={20} className="text-blue-500" /> การแจ้งเตือนผ่านอีเมล
        </h2>
        
        <div className="space-y-6">
          {/* รายการที่ 1: คอมเมนต์ */}
          <div className="flex items-center justify-between">
            <div className="flex gap-3">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                <MessageSquare size={20} />
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">เมื่อมีการคอมเมนต์งาน</p>
                <p className="text-sm text-gray-500">ส่งอีเมลแจ้งเตือนเมื่ออาจารย์หรือนักศึกษาในกลุ่มคอมเมนต์งานของคุณ</p>
              </div>
            </div>
            <Switch active={settings.emailComment} onClick={() => toggleSetting('emailComment')} />
          </div>

          {/* รายการที่ 2: สถานะเปลี่ยน */}
          <div className="flex items-center justify-between">
            <div className="flex gap-3">
              <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
                <ShieldCheck size={20} />
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">การอัปเดตสถานะโครงงาน</p>
                <p className="text-sm text-gray-500">แจ้งเตือนเมื่อโครงงานถูกอนุมัติ หรือได้รับการแก้ไข</p>
              </div>
            </div>
            <Switch active={settings.emailStatusChange} onClick={() => toggleSetting('emailStatusChange')} />
          </div>

          {/* รายการที่ 3: กำหนดการ */}
          <div className="flex items-center justify-between">
            <div className="flex gap-3">
              <div className="p-2 bg-amber-50 dark:bg-amber-900/30 rounded-lg text-amber-600 dark:text-amber-400">
                <Calendar size={20} />
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">แจ้งเตือนกำหนดการ (Deadline)</p>
                <p className="text-sm text-gray-500">แจ้งเตือนล่วงหน้า 3 วันก่อนถึงกำหนดส่งงานหรือวันสอบ</p>
              </div>
            </div>
            <Switch active={settings.emailDeadline} onClick={() => toggleSetting('emailDeadline')} />
          </div>
        </div>
      </div>

      {/* ส่วนที่ 2: การแจ้งเตือนในระบบ */}
      <div>
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 flex items-center gap-2">
          <Bell size={20} className="text-purple-500" /> การแจ้งเตือนภายในระบบ
        </h2>
        <div className="flex items-center justify-between">
          <div className="flex gap-3">
            <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
              <Bell size={20} />
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">ประกาศจากภาควิชา</p>
              <p className="text-sm text-gray-500">แสดงแถบแจ้งเตือนเมื่อมีการประกาศข่าวสารใหม่จากแอดมิน</p>
            </div>
          </div>
          <Switch active={settings.appAnnouncement} onClick={() => toggleSetting('appAnnouncement')} />
        </div>
      </div>

      <div className="pt-4 flex justify-end">
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-bold transition shadow-sm">
          บันทึกการตั้งค่า
        </button>
      </div>
    </div>
  );
}

// Component ย่อยสำหรับปุ่ม Switch
function Switch({ active, onClick }: { active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
        active ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          active ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}