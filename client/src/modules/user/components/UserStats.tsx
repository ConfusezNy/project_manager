'use client';
import React from 'react';
import { Users, Shield, UserCheck } from 'lucide-react';

interface Props { total: number; active: number; admins: number; }

const UserStats: React.FC<Props> = ({ total, active, admins }) => {
    const stats = [
        { label: 'ผู้ใช้งานทั้งหมด', value: total, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-500/10' },
        { label: 'ใช้งานปกติ (Active)', value: active, icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
        { label: 'ผู้ดูแลระบบ (Admin)', value: admins, icon: Shield, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            {stats.map((stat, index) => (
                <div key={index} className="flex items-center p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-100 dark:border-gray-700 transition-all hover:shadow-md">
                    <div className={`p-4 rounded-xl ${stat.bg} ${stat.color} mr-5`}>
                        <stat.icon size={28} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{stat.label}</p>
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">{stat.value}</h3>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default UserStats;
