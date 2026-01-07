'use client';

import React from 'react';
import { Users, CheckCircle, Clock } from 'lucide-react';

interface StatsProps {
  totalTeams: number;
  term: string;
}

export const TeamAdminStats = ({ totalTeams, term }: StatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      {/* การ์ดจำนวนกลุ่มทั้งหมด */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-all">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">กลุ่มทั้งหมดในเทอม {term}</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{totalTeams} <span className="text-sm font-normal text-gray-400">กลุ่ม</span></h3>
          </div>
        </div>
      </div>

      {/* คุณสามารถเพิ่มการ์ดอื่นๆ เช่น กลุ่มที่ผ่านแล้ว (Mockup) */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">อนุมัติหัวข้อแล้ว</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">0 <span className="text-sm font-normal text-gray-400">กลุ่ม</span></h3>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-amber-50 dark:bg-amber-900/30 rounded-lg text-amber-600 dark:text-amber-400">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">รอการตรวจสอบ</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{totalTeams} <span className="text-sm font-normal text-gray-400">กลุ่ม</span></h3>
          </div>
        </div>
      </div>
    </div>
  );
};