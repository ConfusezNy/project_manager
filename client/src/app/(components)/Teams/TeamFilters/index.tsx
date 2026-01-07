'use client';

import React from 'react';
import { Calendar, ChevronDown, Search } from 'lucide-react';

interface FilterProps {
  selectedTerm: string;
  setSelectedTerm: (term: string) => void;
}

export const TeamFilters = ({ selectedTerm, setSelectedTerm }: FilterProps) => {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex items-center gap-3 w-full md:w-auto">
        <div className="relative flex-1 md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="ค้นหาชื่อกลุ่ม หรือรหัส..." 
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0">
        <Calendar size={18} className="text-gray-400" />
        <span className="text-sm text-gray-500 dark:text-gray-400">ปีการศึกษา:</span>
        <div className="relative">
          <select 
            value={selectedTerm} 
            onChange={(e) => setSelectedTerm(e.target.value)}
            className="appearance-none pl-3 pr-8 py-1.5 bg-gray-50 dark:bg-gray-700 border-none rounded-lg text-sm font-bold text-blue-600 dark:text-blue-400 outline-none cursor-pointer"
          >
            <option value="1/2568">1/2568</option>
            <option value="2/2567">2/2567</option>
            <option value="1/2567">1/2567</option>
          </select>
          <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>
    </div>
  );
};