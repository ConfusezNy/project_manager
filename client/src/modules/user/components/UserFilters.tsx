'use client';
import React from 'react';
import { Search } from 'lucide-react';

interface Props {
    searchQuery: string;
    setSearchQuery: (val: string) => void;
    roleFilter: string;
    setRoleFilter: (val: string) => void;
    statusFilter: string;
    setStatusFilter: (val: string) => void;
}

const UserFilters: React.FC<Props> = ({
    searchQuery, setSearchQuery, roleFilter, setRoleFilter, statusFilter, setStatusFilter
}) => {
    return (
        <div className="flex flex-col md:flex-row gap-4 mb-6 animate-in fade-in duration-500">
            {/* Search Bar */}
            <div className="relative flex-1 group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                    <Search className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                    type="text"
                    placeholder="ค้นหาชื่อ, อีเมล..."
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm shadow-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Filters */}
            <div className="flex gap-3">
                <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="px-4 py-3 rounded-xl border border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none cursor-pointer shadow-sm transition-all"
                >
                    <option value="All">ทุกระดับสิทธิ์</option>
                    <option value="ADMIN">Admin</option>
                    <option value="ADVISOR">Advisor (Teacher)</option>
                    <option value="STUDENT">Student</option>
                </select>

                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-3 rounded-xl border border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none cursor-pointer shadow-sm transition-all"
                >
                    <option value="All">ทุกสถานะ</option>
                    <option value="Active">ใช้งานปกติ</option>
                    <option value="Inactive">ปิดการใช้งาน</option>
                </select>
            </div>
        </div>
    );
};

export default UserFilters;
