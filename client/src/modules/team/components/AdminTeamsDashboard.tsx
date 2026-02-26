"use client";

import React from "react";
import { Trash2 } from "lucide-react";
import { useAdminTeams } from "../hooks/useAdminTeams";
import { AdminTeamDetailModal } from "./AdminTeamDetailModal";

export const AdminTeamsDashboard: React.FC = () => {
    const {
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
    } = useAdminTeams();

    if (loading && teams.length === 0) {
        return (
            <div className="p-6 flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <>
            <div className="p-6 min-h-screen bg-gray-50 dark:bg-gray-900">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            จัดการทีมทั้งหมด
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Admin Teams Management
                        </p>
                    </div>
                    {/* Export Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setShowExportMenu(!showExportMenu)}
                            disabled={teams.length === 0}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition shadow-sm disabled:opacity-50"
                        >
                            Export
                        </button>
                        {showExportMenu && (
                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg z-20 overflow-hidden">
                                <button
                                    onClick={() => { handleExportCSV(); setShowExportMenu(false); }}
                                    className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition"
                                >
                                    Export CSV
                                </button>
                                <button
                                    onClick={() => { handleExportExcel(); setShowExportMenu(false); }}
                                    className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition"
                                >
                                    Export Excel
                                </button>
                                <button
                                    onClick={() => { handleExportPdf(); setShowExportMenu(false); }}
                                    className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition"
                                >
                                    Export PDF
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="text-3xl font-bold text-blue-600">
                            {teams.length}
                        </div>
                        <div className="text-gray-500 dark:text-gray-400 text-sm">
                            ทีมทั้งหมด
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="text-3xl font-bold text-green-600">
                            {teams.filter((t) => t.project?.status === "APPROVED").length}
                        </div>
                        <div className="text-gray-500 dark:text-gray-400 text-sm">
                            อนุมัติแล้ว
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="text-3xl font-bold text-amber-600">
                            {
                                teams.filter(
                                    (t) => !t.project || t.project?.status === "PENDING",
                                ).length
                            }
                        </div>
                        <div className="text-gray-500 dark:text-gray-400 text-sm">
                            รอดำเนินการ
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="text-3xl font-bold text-purple-600">
                            {teams.reduce((acc, t) => acc + t.memberCount, 0)}
                        </div>
                        <div className="text-gray-500 dark:text-gray-400 text-sm">
                            สมาชิกทั้งหมด
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                ค้นหา
                            </label>
                            <input
                                type="text"
                                placeholder="ชื่อทีม, รหัสกลุ่ม, ชื่อโปรเจกต์..."
                                className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Section
                            </label>
                            <select
                                className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                value={sectionFilter}
                                onChange={(e) => setSectionFilter(e.target.value)}
                            >
                                <option value="">ทั้งหมด</option>
                                {sections.map((s) => (
                                    <option key={s.section_id} value={s.section_id}>
                                        {s.section_code} ({s.course_type}) - {s.Term?.semester}/
                                        {s.Term?.academicYear}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                สถานะโปรเจกต์
                            </label>
                            <select
                                className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="">ทั้งหมด</option>
                                <option value="APPROVED">อนุมัติแล้ว</option>
                                <option value="PENDING">รอดำเนินการ</option>
                                <option value="REJECTED">ไม่อนุมัติ</option>
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={clearFilters}
                                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition"
                            >
                                ล้างตัวกรอง
                            </button>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl mb-6">
                        {error}
                    </div>
                )}

                {/* Teams Table */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">
                                        รหัสกลุ่ม
                                    </th>
                                    <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">
                                        Section
                                    </th>
                                    <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">
                                        ชื่อโปรเจกต์
                                    </th>
                                    <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">
                                        สมาชิก
                                    </th>
                                    <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">
                                        สถานะ
                                    </th>
                                    <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">
                                        ล็อคทีม
                                    </th>
                                    <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400 text-center">
                                        จัดการ
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {teams.map((team) => (
                                    <tr
                                        key={team.team_id}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors cursor-pointer"
                                        onClick={() => openDetail(team)}
                                    >
                                        <td className="px-4 py-3">
                                            <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                                                {team.groupNumber}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-gray-900 dark:text-white">
                                                {team.section.section_code}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                {team.section.course_type} •{" "}
                                                {team.section.term?.semester}/
                                                {team.section.term?.academicYear}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            {team.project ? (
                                                <div className="max-w-xs truncate">
                                                    <div
                                                        className="font-medium text-gray-900 dark:text-white"
                                                        title={team.project.projectname}
                                                    >
                                                        {team.project.projectname}
                                                    </div>
                                                    {team.project.projectnameEng && (
                                                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                            {team.project.projectnameEng}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 italic">
                                                    ยังไม่มีโปรเจกต์
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1">
                                                <span className="font-medium">{team.memberCount}</span>
                                                <span className="text-gray-500">คน</span>
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                {team.members
                                                    .slice(0, 2)
                                                    .map((m) => `${m.firstname}`)
                                                    .join(", ")}
                                                {team.members.length > 2 &&
                                                    ` +${team.members.length - 2}`}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                                                    team.project?.status || "PENDING",
                                                )}`}
                                            >
                                                {team.project?.status || "PENDING"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {team.section.team_locked ? (
                                                <span className="text-red-500 font-medium">
                                                    ล็อค
                                                </span>
                                            ) : (
                                                <span className="text-green-500 font-medium">
                                                    ปลด
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteTeam(
                                                            team.team_id,
                                                            team.name || team.groupNumber,
                                                        );
                                                    }}
                                                    className="flex items-center gap-1 px-3 py-1.5 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium transition"
                                                    title="ลบทีม"
                                                >
                                                    <Trash2 size={14} />
                                                    ลบ
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {teams.length === 0 && !loading && (
                        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                            ไม่พบทีมที่ตรงกับเงื่อนไข
                        </div>
                    )}
                </div>
            </div>

            {/* Team Detail Modal */}
            <AdminTeamDetailModal
                isOpen={isModalOpen}
                team={selectedTeam}
                onClose={closeDetail}
                onTeamUpdated={handleTeamUpdated}
            />
        </>
    );
};
