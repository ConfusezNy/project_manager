"use client";

// useProjectSearch Hook - State management for project search page
import { useState, useEffect, useCallback } from "react";

export interface ProjectData {
  id: number;
  title: string;
  description?: string;
  category?: string;
  year?: string;
  team?: any;
  advisors?: any[];
}

export function useProjectSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [projectType, setProjectType] = useState("");
  const [year, setYear] = useState("");
  const [results, setResults] = useState<ProjectData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const projectOptions = [
    { label: "ทั้งหมด", value: "" },
    { label: "IoT", value: "internet_of_thing" },
    { label: "Web Application", value: "WebApplication" },
    { label: "อื่น", value: "other" },
  ];

  const yearOptions = [
    { label: "ทั้งหมด", value: "" },
    { label: "2567", value: "2567" },
    { label: "2566", value: "2566" },
    { label: "2565", value: "2565" },
  ];

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("q", searchQuery);
      if (year) params.append("year", year);
      if (projectType) params.append("category", projectType);

      const response = await fetch(`/api/projects?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data: ProjectData[] = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Error fetching projects:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, year, projectType]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchData();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [fetchData]);

  return {
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
  };
}
