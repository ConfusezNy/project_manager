"use client";

// useProjectSearch Hook - State management for project search page
import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { PROJECT_TYPES } from "@/shared/constants/project-types";

export interface ProjectData {
  id: number;
  title: string;
  titleEng?: string;
  description?: string;
  category: string;
  year: string;
  team?: {
    name: string;
    groupNumber: string;
    section?: string;
    semester?: number;
  };
  advisors?: { name: string }[];
  author: string;
}

interface FilterOption {
  label: string;
  value: string;
}

// Generated from shared PROJECT_TYPES constant
const CATEGORY_OPTIONS: FilterOption[] = [
  { label: "ทั้งหมด", value: "" },
  ...PROJECT_TYPES.map((type) => ({ label: type, value: type })),
];

export function useProjectSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [projectType, setProjectType] = useState("");
  const [year, setYear] = useState("");
  const [advisorFilter, setAdvisorFilter] = useState("");
  const [results, setResults] = useState<ProjectData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Categories are hardcoded
  const projectOptions = CATEGORY_OPTIONS;

  // Dynamic year options from backend
  const [yearOptions, setYearOptions] = useState<FilterOption[]>([
    { label: "ทั้งหมด", value: "" },
  ]);

  // Fetch year options from Term table
  const fetchFilters = useCallback(async () => {
    try {
      const data = await api.get<{ years: number[] }>(
        "/projects/archive/filters",
      );

      const yOpts: FilterOption[] = [{ label: "ทั้งหมด", value: "" }];
      for (const y of data.years) {
        yOpts.push({ label: String(y), value: String(y) });
      }
      setYearOptions(yOpts);
    } catch (error) {
      console.error("Error fetching archive filters:", error);
    }
  }, []);

  useEffect(() => {
    fetchFilters();
  }, [fetchFilters]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("q", searchQuery);
      if (year) params.append("year", year);
      if (projectType) params.append("category", projectType);
      if (advisorFilter) params.append("advisor", advisorFilter);

      const data = await api.get<ProjectData[]>(`/projects/archive?${params.toString()}`);
      setResults(data);
    } catch (error) {
      console.error("Error fetching archived projects:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, year, projectType, advisorFilter]);

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
    advisorFilter,
    setAdvisorFilter,
    results,
    isLoading,
    projectOptions,
    yearOptions,
  };
}
