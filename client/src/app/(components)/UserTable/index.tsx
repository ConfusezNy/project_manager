'use client';
import React from 'react';
import { Pencil, Trash2, MoreHorizontal } from 'lucide-react';

export interface User {
  id: string | number;
  name: string;
  email: string;
  role: 'ADMIN' | 'ADVISOR' | 'STUDENT' | string;
  status: 'Active' | 'Inactive';
  lastActive: string;
  avatar?: string;
}

interface Props { users: User[]; onEdit: (user: User) => void; onDelete: (id: string | number) => void; readOnly?: boolean; }

const UserTable: React.FC<Props> = ({ users, onEdit, onDelete, readOnly = false }) => {
  if (users.length === 0) {
    return (
      <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-slate-100 dark:border-gray-700">
        <p className="text-slate-400 dark:text-slate-500 font-medium">ไม่พบผู้ใช้งานในระบบ</p>
      </div>
    );
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 ring-1 ring-indigo-500/20';
      case 'ADVISOR': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 ring-1 ring-blue-500/20';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300 ring-1 ring-slate-500/20';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-slate-100 dark:border-gray-700 shadow-sm overflow-hidden transition-all">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-gray-900/50 text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider text-[11px]">
            <tr>
              <th className="px-6 py-5">ข้อมูลสมาชิก</th>
              <th className="px-6 py-5">ระดับสิทธิ์</th>
              <th className="px-6 py-5">สถานะ</th>
              <th className="px-6 py-5">การใช้งานล่าสุด</th>
              {!readOnly && <th className="px-6 py-5 text-right">การจัดการ</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-gray-700">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-gray-700/50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm overflow-hidden uppercase">
                      {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover"/> : user.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">{user.name}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black tracking-widest ${getRoleBadge(user.role)}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${user.status === 'Active' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500'}`} />
                    <span className="font-medium text-slate-700 dark:text-slate-300">{user.status}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-medium">{user.lastActive}</td>
                {!readOnly && (
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => onEdit(user)} className="p-2 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition-all">
                        <Pencil size={18} />
                      </button>
                      <button onClick={() => onDelete(user.id)} className="p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/30 text-rose-600 dark:text-rose-400 transition-all">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserTable;