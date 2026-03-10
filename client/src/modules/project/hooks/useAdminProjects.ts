"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { exportToCSV } from "@/lib/exportCSV";
import { Project, ProjectStats, Section } from "../types/adminProject";

export function useAdminProjects() {
    const router = useRouter();
    const [projects, setProjects] = useState<Project[]>([]);
    const [stats, setStats] = useState<ProjectStats>({ total: 0, approved: 0, pending: 0, rejected: 0 });
    const [sections, setSections] = useState<Section[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Modal
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Filters
    const [sectionFilter, setSectionFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [searchQuery, setSearchQuery] = useState("");



    // Fetch projects
    const fetchProjects = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (sectionFilter) params.append("section_id", sectionFilter);
            if (statusFilter) params.append("status", statusFilter);
            if (searchQuery) params.append("search", searchQuery);

            const data = await api.get<{ projects: Project[]; stats: ProjectStats }>(
                `/admin/projects?${params.toString()}`,
            );
            setProjects(data.projects);
            setStats(data.stats);
            setError("");
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "เกิดข้อผิดพลาด";
            setError(message);
        } finally {
            setLoading(false);
        }
    }, [sectionFilter, statusFilter, searchQuery]);

    // Fetch sections for filter
    const fetchSections = useCallback(async () => {
        try {
            const data = await api.get<Section[]>("/sections");
            setSections(data);
        } catch (err) {
            console.error("Failed to fetch sections:", err);
        }
    }, []);

    useEffect(() => {
        fetchProjects();
        fetchSections();
    }, [fetchProjects, fetchSections]);

    // Navigation handlers
    const goToTasks = (projectId: number) => {
        router.push(`/admin-tasks?project=${projectId}`);
    };

    const goToSubmissions = (teamId: number) => {
        router.push(`/admin-events?team_id=${teamId}`);
    };

    const openDetail = (project: Project) => {
        setSelectedProject(project);
        setIsModalOpen(true);
    };

    // Toggle archive
    const handleToggleArchive = async (projectId: number) => {
        try {
            await api.patch(`/admin/projects/${projectId}/archive`, {});
            fetchProjects();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "เกิดข้อผิดพลาด";
            alert(message);
        }
    };

    // CSV Export
    const handleExport = () => {
        const headers = [
            { key: "courseType", label: "ประเภทรายวิชา" },
            { key: "academicTerm", label: "ปีการศึกษา" },
            { key: "projectname", label: "ชื่อโครงงาน (TH)" },
            { key: "projectnameEng", label: "ชื่อโครงงาน (EN)" },
            { key: "status", label: "สถานะ" },
            { key: "team", label: "ทีม" },
            { key: "group", label: "กลุ่ม" },
            { key: "section", label: "Section" },
            { key: "advisor", label: "อาจารย์ที่ปรึกษา" },
            { key: "memberCount", label: "จำนวนสมาชิก" },
        ];
        const rows = projects.map((p) => {
            const courseType = p.team?.section?.course_type || "N/A";
            const semester = p.team?.section?.term?.semester || "-";
            const year = p.team?.section?.term?.academicYear || "-";

            return {
                courseType: courseType,
                academicTerm: `${semester}/${year}`,
                projectname: p.projectname || "",
                projectnameEng: p.projectnameEng || "",
                status: p.status || "",
                team: p.team?.name || "",
                group: p.team?.groupNumber || "",
                section: p.team?.section?.section_code || "",
                advisor: p.advisors.map((a) => `${a.titles || ""} ${a.firstname} ${a.lastname}`).join(", "),
                memberCount: p.team?.memberCount || 0,
            };
        });
        exportToCSV(rows, headers, "admin-projects-export");
    };



    // Clear filters
    const clearFilters = () => {
        setSectionFilter("");
        setStatusFilter("");
        setSearchQuery("");
    };

    return {
        projects,
        stats,
        sections,
        loading,
        error,
        selectedProject,
        isModalOpen,
        setIsModalOpen,
        sectionFilter,
        setSectionFilter,
        statusFilter,
        setStatusFilter,
        searchQuery,
        setSearchQuery,
        goToTasks,
        goToSubmissions,
        openDetail,
        handleToggleArchive,
        handleExport,
        clearFilters,
    };
}
