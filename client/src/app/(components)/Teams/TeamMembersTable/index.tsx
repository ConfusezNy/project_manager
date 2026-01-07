'use client';

import React from 'react';
import { ShieldCheck } from 'lucide-react';

// ✅ รับ members มาจาก parent
export const TeamMembersTable = ({members, onInviteClick}: { members: any[], onInviteClick?: () => void }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
        <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <ShieldCheck size={18} className="text-emerald-500" />
          สมาชิกภายในกลุ่ม
        </h2>
        <button onClick={onInviteClick} className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline">เชิญเพื่อนเข้ากลุ่ม +</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-700">
              <th className="px-6 py-4 font-bold text-gray-400 uppercase text-[10px] tracking-widest text-center">ลำดับ</th>
              <th className="px-6 py-4 font-bold text-gray-400 uppercase text-[10px] tracking-widest">รหัสนักศึกษา</th>
              <th className="px-6 py-4 font-bold text-gray-400 uppercase text-[10px] tracking-widest">ชื่อ - นามสกุล</th>
              <th className="px-6 py-4 font-bold text-gray-400 uppercase text-[10px] tracking-widest">บทบาท</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {/* ✅ วนลูปข้อมูลสมาชิกจริง */}
            {members && members.length > 0 ? (
              members.map((member, index) => (
                <tr key={member.user?.users_id || index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4 text-gray-500 text-center">{(index + 1).toString().padStart(2, '0')}</td>
                  <td className="px-6 py-4 font-mono text-blue-600 dark:text-blue-400">{member.user?.users_id || member.users_id}</td>
                  <td className="px-6 py-4 font-medium dark:text-gray-200">{member.user?.firstname || member.firstname} {member.user?.lastname || member.lastname}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800">
                      {index === 0 ? "หัวหน้ากลุ่ม" : "สมาชิก"}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-400">ไม่พบข้อมูลสมาชิก</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};