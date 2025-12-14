import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'Admin' | 'Teacher' | 'Student';
  status: 'Active' | 'Inactive';
  lastActive: string;
  avatar?: string;
}

interface Props {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (id: number) => void;
  readOnly?: boolean; // ✅ เพิ่ม Prop นี้ (Optional)
}

const UserTable: React.FC<Props> = ({ users, onEdit, onDelete, readOnly = false }) => {
  if (users.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-[#1c1c1e] rounded-xl border border-gray-200 dark:border-gray-700">
        <p className="text-gray-500 dark:text-gray-400">ไม่พบผู้ใช้งานตามเงื่อนไข</p>
      </div>
    );
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'Admin': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
      case 'Teacher': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-50 dark:bg-[#2c2c2e] text-gray-700 dark:text-gray-300 uppercase font-medium">
          <tr>
            <th className="px-6 py-4">ชื่อ - นามสกุล</th>
            <th className="px-6 py-4">ระดับสิทธิ์ (Role)</th>
            <th className="px-6 py-4">สถานะ</th>
            <th className="px-6 py-4">ใช้งานล่าสุด</th>
            {/* ✅ ซ่อนหัวตาราง "จัดการ" ถ้าเป็น readOnly */}
            {!readOnly && <th className="px-6 py-4 text-right">จัดการ</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-[#1c1c1e]">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-[#252527] transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 font-bold overflow-hidden">
                    {user.avatar ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover"/> : user.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">{user.name}</div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${getRoleBadge(user.role)}`}>
                  {user.role}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${user.status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  <span className="text-gray-700 dark:text-gray-300">{user.status}</span>
                </div>
              </td>
              <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{user.lastActive}</td>
              
              {/* ✅ ซ่อนปุ่ม Action ถ้าเป็น readOnly */}
              {!readOnly && (
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => onEdit(user)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-blue-600 dark:text-blue-400">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => onDelete(user.id)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600 dark:text-red-400">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;