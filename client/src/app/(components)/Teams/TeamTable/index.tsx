'use client';

import React from 'react';
import { Eye, MoreHorizontal } from 'lucide-react';

interface TeamTableProps {
  teams: any[];
}

export const TeamTable = ({ teams }: TeamTableProps) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
            <tr>
              <th className="px-6 py-4 font-bold text-gray-500 dark:text-gray-400 uppercase text-[10px] tracking-widest">รหัสกลุ่ม</th>
              <th className="px-6 py-4 font-bold text-gray-500 dark:text-gray-400 uppercase text-[10px] tracking-widest">ชื่อโครงการ (ภาษาไทย)</th>
              <th className="px-6 py-4 font-bold text-gray-500 dark:text-gray-400 uppercase text-[10px] tracking-widest">อาจารย์ที่ปรึกษา</th>
              <th className="px-6 py-4 font-bold text-gray-500 dark:text-gray-400 uppercase text-[10px] tracking-widest">สถานะ</th>
              <th className="px-6 py-4 font-bold text-gray-500 dark:text-gray-400 uppercase text-[10px] tracking-widest text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {teams.map((team) => (
              <tr key={team.team_id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group">
                <td className="px-6 py-4">
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{team.groupNumber}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="max-w-xs truncate font-medium text-gray-900 dark:text-white" title={team.topicThai || team.name}>
                    {team.topicThai || team.name}
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                  {team.advisorName}
                </td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30 uppercase">
                    {team.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-400 hover:text-blue-600 transition-all">
                    <Eye size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};