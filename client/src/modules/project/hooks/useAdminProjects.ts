"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { exportToCSV } from "@/lib/exportCSV";
import { exportToExcel } from "@/modules/export/utils/exportExcel";
import { exportToPdf } from "@/modules/export/utils/exportPdf";
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

    // Export menu
    const [showExportMenu, setShowExportMenu] = useState(false);

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
            { key: "project_id", label: "Project ID" },
            { key: "projectname", label: "ชื่อโครงงาน (TH)" },
            { key: "projectnameEng", label: "ชื่อโครงงาน (EN)" },
            { key: "status", label: "สถานะ" },
            { key: "team", label: "ทีม" },
            { key: "group", label: "กลุ่ม" },
            { key: "section", label: "Section" },
            { key: "advisor", label: "อาจารย์ที่ปรึกษา" },
            { key: "memberCount", label: "จำนวนสมาชิก" },
        ];
        const rows = projects.map((p) => ({
            project_id: p.project_id,
            projectname: p.projectname || "",
            projectnameEng: p.projectnameEng || "",
            status: p.status || "",
            team: p.team?.name || "",
            group: p.team?.groupNumber || "",
            section: p.team?.section?.section_code || "",
            advisor: p.advisors.map((a) => `${a.titles || ""} ${a.firstname} ${a.lastname}`).join(", "),
            memberCount: p.team?.memberCount || 0,
        }));
        exportToCSV(rows, headers, "admin-projects-export");
    };

    // Excel Export
    const handleExportExcel = () => {
        const columns = [
            { header: "Project ID", key: "project_id", width: 12 },
            { header: "ชื่อโครงงาน (TH)", key: "projectname", width: 35 },
            { header: "ชื่อโครงงาน (EN)", key: "projectnameEng", width: 35 },
            { header: "สถานะ", key: "status", width: 12 },
            { header: "ทีม", key: "team", width: 20 },
            { header: "กลุ่ม", key: "group", width: 8 },
            { header: "Section", key: "section", width: 12 },
            { header: "อาจารย์ที่ปรึกษา", key: "advisor", width: 30 },
            { header: "จำนวนสมาชิก", key: "memberCount", width: 12 },
        ];
        const rows = projects.map((p) => ({
            project_id: p.project_id,
            projectname: p.projectname || "",
            projectnameEng: p.projectnameEng || "",
            status: p.status || "",
            team: p.team?.name || "",
            group: p.team?.groupNumber || "",
            section: p.team?.section?.section_code || "",
            advisor: p.advisors.map((a) => `${a.titles || ""} ${a.firstname} ${a.lastname}`).join(", "),
            memberCount: p.team?.memberCount || 0,
        }));
        exportToExcel(rows, columns, "admin-projects-export", "โครงงานทั้งหมด");
    };

    // PDF Export
    const handleExportPdf = () => {
        const columns = [
            { header: "ID", key: "project_id" },
            { header: "Project Name (TH)", key: "projectname" },
            { header: "Status", key: "status" },
            { header: "Team", key: "team" },
            { header: "Section", key: "section" },
            { header: "Advisor", key: "advisor" },
        ];
        const rows = projects.map((p) => ({
            project_id: p.project_id,
            projectname: p.projectname || "",
            status: p.status || "",
            team: p.team?.name || "",
            section: p.team?.section?.section_code || "",
            advisor: p.advisors.map((a) => `${a.titles || ""} ${a.firstname} ${a.lastname}`).join(", "),
        }));
        exportToPdf(rows, columns, "admin-projects-export", "Admin - Projects Report");
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
        showExportMenu,
        setShowExportMenu,
        goToTasks,
        goToSubmissions,
        openDetail,
        handleToggleArchive,
        handleExport,
        handleExportExcel,
        handleExportPdf,
        clearFilters,
    };
}
