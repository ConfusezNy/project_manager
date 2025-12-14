import React from 'react';
import { Users, Shield, UserCheck } from 'lucide-react';

interface Props {
  total: number;
  active: number;
  admins: number;
}

const UserStats: React.FC<Props> = ({ total, active, admins }) => {
  const stats = [
    { label: 'ผู้ใช้งานทั้งหมด', value: total, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/20' },
    { label: 'ใช้งานปกติ (Active)', value: active, icon: UserCheck, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/20' },
    { label: 'ผู้ดูแลระบบ (Admin)', value: admins, icon: Shield, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/20' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      {stats.map((stat, index) => (
        <div key={index} className="flex items-center p-4 bg-white dark:bg-[#1c1c1e] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className={`p-3 rounded-full ${stat.bg} ${stat.color} mr-4`}>
            <stat.icon size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</h3>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserStats;