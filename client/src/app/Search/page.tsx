"use client";

import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import SelectDropdown from '../(components)/SelectDropdown'; 
import ProjectCard, { ProjectCardSkeleton, ProjectData } from '../(components)/ProjectCard'; 

const SearchPage = () => {
  // --- ส่วนที่ 1: Logic และ State ---
  
  const [searchQuery, setSearchQuery] = useState("");
  const [projectType, setProjectType] = useState("");
  const [year, setYear] = useState("");

  // --- 2. แก้ไขจุดที่แดง: ระบุ Type ให้ useState รู้ว่าเป็นอาเรย์ของ ProjectData ---
  const [results, setResults] = useState<ProjectData[]>([]); 
  const [isLoading, setIsLoading] = useState(false);

  const projectOptions = [
    { label: "ทั้งหมด", value: "" },
    { label: "IoT", value: "internet_of_thing" },
    { label: "Web Application", value: "WebApplication" },
    { label: "อื่น", value: "other" }
  ];

  const yearOptions = [
    { label: "ทั้งหมด", value: "" },
    { label: "2567", value: "2567" },
    { label: "2566", value: "2566" },
    { label: "2565", value: "2565" }
  ];

  // --- ส่วนที่ 2: ฟังก์ชันดึงข้อมูล (Fetch Data) ---
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (searchQuery) params.append("q", searchQuery);
        if (year) params.append("year", year);
        if (projectType) params.append("category", projectType);

        // API Endpoint
        const response = await fetch(`/api/projects?${params.toString()}`);
        
        if (!response.ok) {
           throw new Error("Network response was not ok");
        } 
        
        // 3. (Optional) ระบุ Type ตอนรับค่ากลับมาเพื่อความชัวร์
        const data: ProjectData[] = await response.json();
        setResults(data);

      } catch (error) {
        console.error("Error fetching projects:", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchData();
    }, 500);

    return () => clearTimeout(timeoutId);

  }, [searchQuery, year, projectType]);

  // --- ส่วนที่ 3: แสดงผลหน้าจอ (Return JSX) ---
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">
        ค้นหาปริญญานิพนธ์
      </h1>

      {/* --- Filter Section --- */}
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

      {/* --- Results Section --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {isLoading && (
          <>
            {[...Array(6)].map((_, index) => (
              <ProjectCardSkeleton key={index} />
            ))}
          </>
        )}

        {/* ตอนนี้ item จะไม่แดงแล้ว เพราะ TS รู้จัก Type ของมัน */}
        {!isLoading && results.length > 0 && results.map((item) => (
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

export default SearchPage;