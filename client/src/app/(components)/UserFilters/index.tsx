import React from 'react';
import { Search, Filter } from 'lucide-react';

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
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      {/* Search Bar */}
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="w-5 h-5 text-gray-400" />
        </div>
        <input 
          type="text" 
          placeholder="ค้นหาชื่อ, อีเมล..." 
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 bg-white dark:bg-[#1c1c1e] dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <select 
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2.5 rounded-lg border border-gray-300 bg-white dark:bg-[#1c1c1e] dark:border-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 cursor-pointer"
        >
          <option value="All">ทุกระดับ (All Roles)</option>
          <option value="Admin">Admin</option>
          <option value="Teacher">Teacher</option>
          <option value="Student">Student</option>
        </select>

        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-lg border border-gray-300 bg-white dark:bg-[#1c1c1e] dark:border-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 cursor-pointer"
        >
          <option value="All">ทุกสถานะ (All Status)</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>
    </div>
  );
};

export default UserFilters;