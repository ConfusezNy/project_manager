'use client';

import React from 'react';
import { FileText } from 'lucide-react';

// ✅ เปลี่ยนการรับค่าจาก { project } เป็น { data }
export const TeamProjectDetail = ({ data }: { data: any }) => {
  if (!data) return null;

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <FileText size={20} className="text-amber-500" />
          รายละเอียดหัวข้อโครงการ
        </h2>
        <button className="text-[11px] font-bold text-gray-500 hover:text-blue-600 transition-colors uppercase tracking-widest">แก้ไขหัวข้อ</button>
      </div>
      <div className="space-y-6">
        <div>
          <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Project Title (Thai)</p>
          {/* ✅ แสดงชื่อหัวข้อที่กรอกไปจริงๆ */}
          <p className="text-base font-bold mt-1 text-gray-900 dark:text-white leading-tight">
            {data.topicThai || "ยังไม่ได้ระบุหัวข้อโครงการ"}
          </p>
        </div>
        <div className="pt-4 border-t border-gray-100 dark:border-gray-700/50">
          <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">คำอธิบายโครงการ</p>
          {/* ✅ แสดงคำอธิบายที่กรอกไปจริงๆ */}
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">
            {data.description || "ยังไม่ได้ระบุคำอธิบายโครงการ"}
          </p>
        </div>
      </div>
    </div>
  );
};