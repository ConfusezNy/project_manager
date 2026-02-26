"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { exportToCSV } from "@/lib/exportCSV";
import { exportToExcel } from "@/modules/export/utils/exportExcel";
import { exportToPdf } from "@/modules/export/utils/exportPdf";
import { AdminTeam, AdminTeamSection } from "../types/adminTeam";

export function useAdminTeams() {
    const [teams, setTeams] = useState<AdminTeam[]>([]);
    const [sections, setSections] = useState<AdminTeamSection[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Modal state
    const [selectedTeam, setSelectedTeam] = useState<AdminTeam | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Filters
    const [sectionFilter, setSectionFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [showExportMenu, setShowExportMenu] = useState(false);

    // Export data helpers
    const getExportRows = () =>
        teams.flatMap((team) =>
            team.members.map((m) => ({
                group: team.groupNumber,
                team_name: team.name,
                section: team.section?.section_code || "-",
                status: team.status,
                student_id: m.user_id,
                firstname: m.firstname || "",
                lastname: m.lastname || "",
                email: m.email || "",
                project: team.project?.projectname || "-",
                project_status: team.project?.status || "-",
            })),
        );

    const handleExportCSV = () => {
        exportToCSV(
            getExportRows(),
            [
                { key: "group", label: "กลุ่ม" },
                { key: "team_name", label: "ชื่อทีม" },
                { key: "section", label: "Section" },
                { key: "status", label: "สถานะทีม" },
                { key: "student_id", label: "รหัสนักศึกษา" },
                { key: "firstname", label: "ชื่อ" },
                { key: "lastname", label: "นามสกุล" },
                { key: "email", label: "อีเมล" },
                { key: "project", label: "ชื่อโครงงาน" },
                { key: "project_status", label: "สถานะโครงงาน" },
            ],
            "teams_report",
        );
    };

    const handleExportExcel = () => {
        exportToExcel(
            getExportRows(),
            [
                { header: "กลุ่ม", key: "group", width: 8 },
                { header: "ชื่อทีม", key: "team_name", width: 20 },
                { header: "Section", key: "section", width: 12 },
                { header: "สถานะทีม", key: "status", width: 12 },
                { header: "รหัสนักศึกษา", key: "student_id", width: 15 },
                { header: "ชื่อ", key: "firstname", width: 15 },
                { header: "นามสกุล", key: "lastname", width: 15 },
                { header: "อีเมล", key: "email", width: 25 },
                { header: "ชื่อโครงงาน", key: "project", width: 30 },
                { header: "สถานะโครงงาน", key: "project_status", width: 12 },
            ],
            "teams_report",
            "รายชื่อทีม",
        );
    };

    const handleExportPdf = () => {
        exportToPdf(
            getExportRows(),
            [
                { header: "Group", key: "group" },
                { header: "Team", key: "team_name" },
                { header: "Section", key: "section" },
                { header: "Status", key: "status" },
                { header: "Student ID", key: "student_id" },
                { header: "Name", key: "firstname" },
                { header: "Surname", key: "lastname" },
                { header: "Project", key: "project" },
            ],
            "teams_report",
            "Admin - Teams Report",
        );
    };

    // Fetch teams
    const fetchTeams = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (sectionFilter) params.append("section_id", sectionFilter);
            if (statusFilter) params.append("status", statusFilter);
            if (searchQuery) params.append("search", searchQuery);

            const data = await api.get<{ teams: AdminTeam[]; total: number }>(
                `/admin/teams?${params.toString()}`,
            );
            setTeams(data.teams);
            setError("");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [sectionFilter, statusFilter, searchQuery]);

    // Fetch sections for filter dropdown
    const fetchSections = useCallback(async () => {
        try {
            const data = await api.get<AdminTeamSection[]>("/sections");
            setSections(data);
        } catch (err) {
            console.error("Failed to fetch sections:", err);
        }
    }, []);

    useEffect(() => {
        fetchTeams();
        fetchSections();
    }, [fetchTeams, fetchSections]);

    // Delete team
    const handleDeleteTeam = async (teamId: number, teamName: string) => {
        if (
            !confirm(
                `คุณแน่ใจหรือไม่ที่จะลบทีม "${teamName}"?\n\nการลบจะลบ:\n- สมาชิกทั้งหมด\n- โปรเจกต์ (ถ้ามี)\n- Tasks ทั้งหมด`,
            )
        ) {
            return;
        }

        try {
            await api.delete("/admin/teams", {
                body: JSON.stringify({ team_id: teamId }),
                headers: { "Content-Type": "application/json" },
            });
            alert("ลบทีมเรียบร้อย");
            fetchTeams();
        } catch (err: any) {
            alert(err.message || "เกิดข้อผิดพลาดในการลบทีม");
        }
    };

    // Status badge color
    const getStatusColor = (status: string) => {
        switch (status) {
            case "APPROVED":
                return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
            case "PENDING":
                return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
            case "REJECTED":
                return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
            default:
                return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
        }
    };

    const clearFilters = () => {
        setSearchQuery("");
        setSectionFilter("");
        setStatusFilter("");
    };

    const openDetail = (team: AdminTeam) => {
        setSelectedTeam(team);
        setIsModalOpen(true);
    };

    const closeDetail = () => {
        setIsModalOpen(false);
        setSelectedTeam(null);
    };

    const handleTeamUpdated = () => {
        fetchTeams();
        if (selectedTeam) {
            const updatedTeam = teams.find(
                (t) => t.team_id === selectedTeam.team_id,
            );
            if (updatedTeam) setSelectedTeam(updatedTeam);
        }
    };

    return {
        teams,
        sections,
        loading,
        error,
        selectedTeam,
        isModalOpen,
        sectionFilter,
        setSectionFilter,
        statusFilter,
        setStatusFilter,
        searchQuery,
        setSearchQuery,
        showExportMenu,
        setShowExportMenu,
        handleExportCSV,
        handleExportExcel,
        handleExportPdf,
        handleDeleteTeam,
        getStatusColor,
        clearFilters,
        openDetail,
        closeDetail,
        handleTeamUpdated,
    };
}
