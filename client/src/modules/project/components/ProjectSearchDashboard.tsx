"use client";

// ProjectSearchDashboard - Main container for project search page
import React from "react";
import { Search } from "lucide-react";
import SelectDropdown from "@/app/(components)/SelectDropdown";
import ProjectCard, {
  ProjectCardSkeleton,
} from "@/app/(components)/ProjectCard";
import { useProjectSearch } from "../hooks/useProjectSearch";

export const ProjectSearchDashboard: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    projectType,
    setProjectType,
    year,
    setYear,
    results,
    isLoading,
    projectOptions,
    yearOptions,
  } = useProjectSearch();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">
        ค้นหาปริญญานิพนธ์
      </h1>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 md:items-end mb-8">
        <div className="relative w-full md:w-[600px] flex">
          <span className="absolute left-1 top-1/2 -translate-y-1/2 p-2">
            <Search className="h-5 w-5 text-gray-500" />
          </span>
          <input
            className="w-full rounded bg-gray-100 p-2 pl-10 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
            type="text"
            placeholder="ค้นหาชื่อโครงงาน..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="w-full max-w-xs">
          <SelectDropdown
            label="ปีการศึกษา"
            options={yearOptions}
            value={year}
            onChange={setYear}
          />
        </div>

        <div className="w-full max-w-xs">
          <SelectDropdown
            label="หมวด"
            options={projectOptions}
            value={projectType}
            onChange={setProjectType}
          />
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading && (
          <>
            {[...Array(6)].map((_, index) => (
              <ProjectCardSkeleton key={index} />
            ))}
          </>
        )}

        {!isLoading &&
          results.length > 0 &&
          results.map((item) => (
            <ProjectCard
              key={item.id}
              data={item}
              onClick={(id) => console.log("Navigate to project:", id)}
            />
          ))}

        {!isLoading && results.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-500">
            <Search className="h-12 w-12 mb-2 opacity-20" />
            <p>ไม่พบข้อมูลที่ค้นหา</p>
          </div>
        )}
      </div>
    </div>
  );
};
