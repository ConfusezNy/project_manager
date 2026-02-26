"use client";

import React from "react";
import {
    Search,
    Filter,
    Download,
    Eye,
    ClipboardList,
    FileText,
    FolderOpen,
    CheckCircle,
    Clock,
    XCircle,
    Package,
    X,
    Users,
    GraduationCap,
    Globe,
} from "lucide-react";
import { useAdminProjects } from "../hooks/useAdminProjects";

// Status badge
const StatusBadge = ({ status }: { status: string | null }) => {
    const config: Record<string, { bg: string; text: string; dot: string; label: string }> = {
        APPROVED: { bg: "bg-green-50 dark:bg-green-900/20", text: "text-green-700 dark:text-green-400", dot: "bg-green-500", label: "APPROVED" },
        PENDING: { bg: "bg-amber-50 dark:bg-amber-900/20", text: "text-amber-700 dark:text-amber-400", dot: "bg-amber-500", label: "PENDING" },
        REJECTED: { bg: "bg-red-50 dark:bg-red-900/20", text: "text-red-700 dark:text-red-400", dot: "bg-red-500", label: "REJECTED" },
    };
    const c = config[status || ""] || { bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-500", dot: "bg-gray-400", label: status || "N/A" };
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
            {c.label}
        </span>
    );
};

export const AdminProjectsDashboard: React.FC = () => {
    const {
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
    } = useAdminProjects();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="p-6 max-w-full">
                {/* Page Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <FolderOpen size={32} className="text-blue-600" />
                            จัดการโครงงานทั้งหมด
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            ดูโครงงานของนักศึกษาทุกกลุ่ม + จัดการงาน + ดูเอกสาร
                        </p>
                    </div>
                    <div className="relative">
                        <button
                            onClick={() => setShowExportMenu(!showExportMenu)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold text-sm hover:bg-emerald-700 transition-all shadow-sm hover:shadow-md"
                        >
                            <Download size={16} />
                            Export
                        </button>
                        {showExportMenu && (
                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg z-20 overflow-hidden">
                                <button
                                    onClick={() => { handleExport(); setShowExportMenu(false); }}
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

                {/* Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center">
                            <Package size={22} className="text-white" />
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">โครงงานทั้งหมด</div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center">
                            <CheckCircle size={22} className="text-white" />
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-green-600">{stats.approved}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">อนุมัติแล้ว</div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center">
                            <Clock size={22} className="text-white" />
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-amber-600">{stats.pending}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">รอดำเนินการ</div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 rounded-xl bg-red-500 flex items-center justify-center">
                            <XCircle size={22} className="text-white" />
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-red-600">{stats.rejected}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">ไม่อนุมัติ</div>
                        </div>
                    </div>
                </div>

                {/* Filter Bar */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-6 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                            <Search size={12} className="inline mr-1" />
                            ค้นหา
                        </label>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="ชื่อโครงงาน, ชื่อทีม..."
                            className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                            <Filter size={12} className="inline mr-1" />
                            Section
                        </label>
                        <select
                            value={sectionFilter}
                            onChange={(e) => setSectionFilter(e.target.value)}
                            className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        >
                            <option value="">ทั้งหมด</option>
                            {sections.map((s) => (
                                <option key={s.section_id} value={s.section_id}>
                                    {s.section_code} ({s.course_type}) — {s.Term?.semester}/{s.Term?.academicYear}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                            <Filter size={12} className="inline mr-1" />
                            สถานะ
                        </label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        >
                            <option value="">ทั้งหมด</option>
                            <option value="APPROVED">อนุมัติแล้ว (APPROVED)</option>
                            <option value="PENDING">รอดำเนินการ (PENDING)</option>
                            <option value="REJECTED">ไม่อนุมัติ (REJECTED)</option>
                        </select>
                    </div>
                    <button
                        onClick={clearFilters}
                        className="px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                    >
                        ล้างตัวกรอง
                    </button>
                </div>

                {/* Error */}
                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6 text-red-700 dark:text-red-400">
                        {error}
                    </div>
                )}

                {/* Table */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
                        </div>
                    ) : projects.length === 0 ? (
                        <div className="text-center py-20 text-gray-400">
                            <FolderOpen size={48} className="mx-auto mb-3 opacity-50" />
                            <p>ไม่พบโครงงาน</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                                    <tr>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">ชื่อโครงงาน</th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">ทีม</th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Section</th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">อาจารย์ที่ปรึกษา</th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">สถานะ</th>
                                        <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">จัดการ</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                                    {projects.map((project) => (
                                        <tr key={project.project_id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="font-semibold text-gray-900 dark:text-white max-w-[250px] truncate">{project.projectname}</div>
                                                {project.projectnameEng && (
                                                    <div className="text-xs text-gray-400 max-w-[250px] truncate mt-0.5">{project.projectnameEng}</div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="font-semibold text-blue-600 dark:text-blue-400 font-mono text-xs">กลุ่ม {project.team?.groupNumber}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">{project.team?.name}</div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400">
                                                    {project.team?.section?.section_code}
                                                </span>
                                                <div className="text-[11px] text-gray-400 mt-0.5">
                                                    {project.team?.section?.course_type} • {project.team?.section?.term?.semester}/{project.team?.section?.term?.academicYear}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                {project.advisors.length > 0 ? (
                                                    project.advisors.map((a) => (
                                                        <div key={a.user_id}>
                                                            <div className="font-medium text-gray-700 dark:text-gray-300 text-xs">
                                                                {a.titles} {a.firstname} {a.lastname}
                                                            </div>
                                                            <div className="text-[11px] text-gray-400">{a.email}</div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <span className="text-xs text-gray-400 italic">— ยังไม่มี —</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <StatusBadge status={project.status} />
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => goToTasks(project.project_id)}
                                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all"
                                                        title="ดู Task Board"
                                                    >
                                                        <ClipboardList size={13} />
                                                        ดูงาน
                                                    </button>
                                                    {project.team && (
                                                        <button
                                                            onClick={() => goToSubmissions(project.team!.team_id)}
                                                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-all"
                                                            title="ดูเอกสารส่ง"
                                                        >
                                                            <FileText size={13} />
                                                            เอกสาร
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => openDetail(project)}
                                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                                                        title="ดูรายละเอียด"
                                                    >
                                                        <Eye size={13} />
                                                        ดู
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggleArchive(project.project_id)}
                                                        className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${project.isArchived
                                                            ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40"
                                                            : "bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400 hover:bg-violet-100 dark:hover:bg-violet-900/40"
                                                            }`}
                                                        title={project.isArchived ? "ยกเลิกเผยแพร่" : "เผยแพร่สู่คลังโครงงาน"}
                                                    >
                                                        <Globe size={13} />
                                                        {project.isArchived ? "เผยแพร่แล้ว" : "เผยแพร่"}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Results count */}
                {!loading && projects.length > 0 && (
                    <div className="mt-3 text-sm text-gray-400 text-right">
                        แสดง {projects.length} โครงงาน
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {isModalOpen && selectedProject && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
                    onClick={() => setIsModalOpen(false)}
                >
                    <div
                        className="bg-white dark:bg-gray-800 rounded-2xl w-[600px] max-h-[85vh] overflow-y-auto p-8 shadow-2xl relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close */}
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center transition-all"
                        >
                            <X size={18} />
                        </button>

                        {/* Title */}
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white pr-10">{selectedProject.projectname}</h2>
                        {selectedProject.projectnameEng && (
                            <p className="text-sm text-gray-400 mt-1">{selectedProject.projectnameEng}</p>
                        )}

                        {/* Description */}
                        {selectedProject.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                                {selectedProject.description}
                            </p>
                        )}

                        {/* Info Section */}
                        <div className="mt-6 space-y-5">
                            {/* General */}
                            <div>
                                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 pb-2 border-b border-gray-100 dark:border-gray-700">
                                    ข้อมูลทั่วไป
                                </h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Section</span>
                                        <span className="font-medium">
                                            <span className="px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 text-xs font-semibold">
                                                {selectedProject.team?.section?.section_code}
                                            </span>
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">ทีม</span>
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            กลุ่ม {selectedProject.team?.groupNumber} — {selectedProject.team?.name}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">สถานะ</span>
                                        <StatusBadge status={selectedProject.status} />
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">วันที่สร้าง</span>
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            {new Date(selectedProject.createdAt).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" })}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Advisors */}
                            <div>
                                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 pb-2 border-b border-gray-100 dark:border-gray-700">
                                    <GraduationCap size={14} className="inline mr-1" />
                                    อาจารย์ที่ปรึกษา
                                </h3>
                                {selectedProject.advisors.length > 0 ? (
                                    selectedProject.advisors.map((a) => (
                                        <div key={a.user_id} className="flex items-center gap-3 py-2">
                                            <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs font-bold">
                                                {(a.firstname || "?")[0]}
                                            </div>
                                            <div>
                                                <div className="font-medium text-sm text-gray-900 dark:text-white">{a.titles} {a.firstname} {a.lastname}</div>
                                                <div className="text-xs text-gray-400">{a.email}</div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-400 italic">ยังไม่มีอาจารย์ที่ปรึกษา</p>
                                )}
                            </div>

                            {/* Members */}
                            <div>
                                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 pb-2 border-b border-gray-100 dark:border-gray-700">
                                    <Users size={14} className="inline mr-1" />
                                    สมาชิก ({selectedProject.team?.memberCount || 0} คน)
                                </h3>
                                {selectedProject.team?.members.map((m, i) => (
                                    <div key={m.user_id} className="flex items-center gap-3 py-2">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${["bg-blue-500", "bg-purple-500", "bg-pink-500", "bg-emerald-500"][i % 4]
                                            }`}>
                                            {(m.firstname || "?")[0]}
                                        </div>
                                        <div>
                                            <div className="font-medium text-sm text-gray-900 dark:text-white">{m.firstname} {m.lastname}</div>
                                            <div className="text-xs text-gray-400">{m.email}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Modal Actions */}
                        <div className="grid grid-cols-2 gap-3 mt-8">
                            <button
                                onClick={() => { goToTasks(selectedProject.project_id); setIsModalOpen(false); }}
                                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all"
                            >
                                <ClipboardList size={16} />
                                ดูงาน / Tasks
                            </button>
                            {selectedProject.team && (
                                <button
                                    onClick={() => { goToSubmissions(selectedProject.team!.team_id); setIsModalOpen(false); }}
                                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-all"
                                >
                                    <FileText size={16} />
                                    ดูเอกสารส่ง
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
