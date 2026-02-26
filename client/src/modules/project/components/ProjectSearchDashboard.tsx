"use client";

// ProjectSearchDashboard - Table layout for project archive search
import React, { useState } from "react";
import { Search, Calendar, User, GraduationCap, X, FileText } from "lucide-react";
import SelectDropdown from "@/shared/components/SelectDropdown";
import { useProjectSearch, ProjectData } from "../hooks/useProjectSearch";

export const ProjectSearchDashboard: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    projectType,
    setProjectType,
    year,
    setYear,
    advisorFilter,
    setAdvisorFilter,
    results,
    isLoading,
    projectOptions,
    yearOptions,
  } = useProjectSearch();

  // Detail modal
  const [selected, setSelected] = useState<ProjectData | null>(null);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-1 text-gray-800 dark:text-gray-200">
        ค้นหาปริญญานิพนธ์
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        คลังโครงงานที่เผยแพร่แล้ว สำหรับค้นหาอ้างอิง
      </p>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 md:items-end mb-6">
        <div className="relative w-full md:w-[500px] flex">
          <span className="absolute left-1 top-1/2 -translate-y-1/2 p-2">
            <Search className="h-5 w-5 text-gray-500" />
          </span>
          <input
            className="w-full rounded-lg bg-gray-100 p-2.5 pl-10 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
            type="text"
            placeholder="ค้นหาชื่อโครงงาน / ชื่ออาจารย์..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="w-full max-w-[180px]">
          <SelectDropdown
            label="ปีการศึกษา"
            options={yearOptions}
            value={year}
            onChange={setYear}
          />
        </div>

        <div className="w-full max-w-[180px]">
          <SelectDropdown
            label="หมวด"
            options={projectOptions}
            value={projectType}
            onChange={setProjectType}
          />
        </div>

        <div className="w-full max-w-[200px]">
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            อาจารย์ที่ปรึกษา
          </label>
          <div className="relative">
            <span className="absolute left-2 top-1/2 -translate-y-1/2">
              <GraduationCap className="h-4 w-4 text-gray-400" />
            </span>
            <input
              className="w-full rounded-lg bg-gray-100 p-2 pl-8 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
              type="text"
              placeholder="ชื่ออาจารย์..."
              value={advisorFilter}
              onChange={(e) => setAdvisorFilter(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
          </div>
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Search className="h-12 w-12 mb-2 opacity-20" />
            <p>ไม่พบข้อมูลที่ค้นหา</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    ชื่อโครงงาน
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    ทีม
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    SECTION
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    อาจารย์ที่ปรึกษา
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    ปีการศึกษา
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    จัดการ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {results.map((project) => (
                  <tr
                    key={project.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                  >
                    {/* ชื่อโครงงาน */}
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-900 dark:text-white max-w-[280px] truncate">
                        {project.title}
                      </div>
                      {project.titleEng && (
                        <div className="text-xs text-gray-400 max-w-[280px] truncate mt-0.5">
                          {project.titleEng}
                        </div>
                      )}
                    </td>

                    {/* ทีม */}
                    <td className="px-4 py-3">
                      {project.team ? (
                        <>
                          <div className="font-semibold text-blue-600 dark:text-blue-400 text-xs">
                            กลุ่ม {project.team.groupNumber}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {project.team.name}
                          </div>
                        </>
                      ) : (
                        <span className="text-xs text-gray-400 italic">—</span>
                      )}
                    </td>

                    {/* Section */}
                    <td className="px-4 py-3">
                      {project.team?.section ? (
                        <>
                          <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-semibold bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400">
                            {project.team.section}
                          </span>
                          {project.team.semester && (
                            <div className="text-xs text-gray-400 mt-0.5">
                              เทอม {project.team.semester}
                            </div>
                          )}
                        </>
                      ) : (
                        <span className="text-xs text-gray-400 italic">—</span>
                      )}
                    </td>

                    {/* อาจารย์ */}
                    <td className="px-4 py-3">
                      {project.advisors && project.advisors.length > 0 ? (
                        project.advisors.map((a, i) => (
                          <div key={i} className="text-xs text-gray-700 dark:text-gray-300">
                            {a.name}
                          </div>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400 italic">—</span>
                      )}
                    </td>

                    {/* ปี */}
                    <td className="px-4 py-3">
                      {project.year ? (
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <Calendar className="w-3 h-3" />
                          {project.year}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">—</span>
                      )}
                    </td>

                    {/* จัดการ */}
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => setSelected(project)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all"
                      >
                        <FileText size={13} />
                        ดูรายละเอียด
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Results count */}
      {!isLoading && results.length > 0 && (
        <div className="mt-3 text-sm text-gray-400 text-right">
          แสดง {results.length} โครงงาน
        </div>
      )}

      {/* ======== Detail Modal ======== */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl w-[560px] max-h-[85vh] overflow-y-auto p-8 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={() => setSelected(null)}
              className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center transition-all"
            >
              <X size={18} />
            </button>

            {/* Title */}
            <h2 className="text-xl font-bold text-gray-900 dark:text-white pr-10">
              {selected.title}
            </h2>
            {selected.titleEng && (
              <p className="text-sm text-gray-400 mt-1">{selected.titleEng}</p>
            )}

            {/* Description */}
            {selected.description && (
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 leading-relaxed">
                {selected.description}
              </p>
            )}

            {/* Info */}
            <div className="mt-6 space-y-5">
              {/* General */}
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 pb-2 border-b border-gray-100 dark:border-gray-700">
                  ข้อมูลทั่วไป
                </h3>
                <div className="space-y-2 text-sm">
                  {selected.category && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">หมวดหมู่</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {selected.category === "internet_of_thing" ? "IoT" : selected.category}
                      </span>
                    </div>
                  )}
                  {selected.year && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">ปีการศึกษา</span>
                      <span className="font-medium text-gray-900 dark:text-white">{selected.year}</span>
                    </div>
                  )}
                  {selected.team && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Section</span>
                        <span className="px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 text-xs font-semibold">
                          {selected.team.section}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">ทีม</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          กลุ่ม {selected.team.groupNumber} — {selected.team.name}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Advisors */}
              {selected.advisors && selected.advisors.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 pb-2 border-b border-gray-100 dark:border-gray-700">
                    <GraduationCap size={14} className="inline mr-1" />
                    อาจารย์ที่ปรึกษา
                  </h3>
                  {selected.advisors.map((a, i) => (
                    <div key={i} className="flex items-center gap-3 py-2">
                      <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs font-bold">
                        {a.name[0] || "?"}
                      </div>
                      <div className="font-medium text-sm text-gray-900 dark:text-white">
                        {a.name}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Author / Members */}
              {selected.author && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 pb-2 border-b border-gray-100 dark:border-gray-700">
                    <User size={14} className="inline mr-1" />
                    ผู้จัดทำ
                  </h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{selected.author}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
