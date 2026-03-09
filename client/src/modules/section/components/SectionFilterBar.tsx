"use client";

import React from "react";
import { Search, X } from "lucide-react";

interface Props {
  query: string;
  setQuery: (v: string) => void;
  academicYear: string;
  setAcademicYear: (v: string) => void;
  lockStatus: "all" | "locked" | "unlocked";
  setLockStatus: (v: "all" | "locked" | "unlocked") => void;
  availableYears: string[];
}

export const SectionFilterBar: React.FC<Props> = ({
  query,
  setQuery,
  academicYear,
  setAcademicYear,
  lockStatus,
  setLockStatus,
  availableYears,
}) => {
  const hasFilter = query || academicYear || lockStatus !== "all";

  const clearAll = () => {
    setQuery("");
    setAcademicYear("");
    setLockStatus("all");
  };

  return (
    <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        {/* Search input */}
        <div className="relative flex-1 min-w-0">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
            size={16}
          />
          <input
            type="text"
            placeholder="ค้นหารหัสหมู่เรียน เช่น 66346CPE..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Academic Year Filter */}
        <div className="flex-shrink-0">
          <select
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            className="text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition cursor-pointer"
          >
            <option value="">ทุกปีการศึกษา</option>
            {availableYears.map((y) => (
              <option key={y} value={y}>
                ปีการศึกษา {y}
              </option>
            ))}
          </select>
        </div>

        {/* Lock Status Filter */}
        <div className="flex-shrink-0">
          <select
            value={lockStatus}
            onChange={(e) =>
              setLockStatus(e.target.value as "all" | "locked" | "unlocked")
            }
            className="text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition cursor-pointer"
          >
            <option value="all">สถานะล็อคทั้งหมด</option>
            <option value="unlocked">ยังไม่ล็อคทีม 🔓</option>
            <option value="locked">ล็อคทีมแล้ว 🔒</option>
          </select>
        </div>

        {/* Clear All */}
        {hasFilter && (
          <button
            onClick={clearAll}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition"
          >
            <X size={14} />
            ล้างตัวกรอง
          </button>
        )}
      </div>

      {/* Active filter summary */}
      {hasFilter && (
        <div className="mt-3 flex flex-wrap gap-2">
          {query && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs rounded-full font-medium">
              🔍 &quot;{query}&quot;
              <button onClick={() => setQuery("")} className="hover:opacity-70">
                <X size={10} />
              </button>
            </span>
          )}
          {academicYear && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs rounded-full font-medium">
              📅 ปี {academicYear}
              <button
                onClick={() => setAcademicYear("")}
                className="hover:opacity-70"
              >
                <X size={10} />
              </button>
            </span>
          )}
          {lockStatus !== "all" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-xs rounded-full font-medium">
              {lockStatus === "locked" ? "🔒 ล็อคแล้ว" : "🔓 ยังไม่ล็อค"}
              <button
                onClick={() => setLockStatus("all")}
                className="hover:opacity-70"
              >
                <X size={10} />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};
