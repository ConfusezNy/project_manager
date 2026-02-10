"use client";

import React, { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { TeamDetailModal } from "./TeamDetailModal";
import { exportToCSV } from "@/lib/exportCSV";

interface TeamMember {
  user_id: string;
  firstname: string | null;
  lastname: string | null;
  email: string | null;
}

interface Team {
  team_id: number;
  name: string;
  groupNumber: string;
  status: string;
  semester: string;
  memberCount: number;
  members: TeamMember[];
  section: {
    section_id: number;
    section_code: string;
    course_type: string;
    study_type: string;
    team_locked: boolean;
    term: {
      term_id: number;
      academicYear: string;
      semester: string;
    };
  };
  project: {
    project_id: number;
    projectname: string;
    projectnameEng: string | null;
    status: string | null;
  } | null;
}

interface Section {
  section_id: number;
  section_code: string;
  course_type: string;
  study_type: string;
  Term: {
    term_id: number;
    academicYear: number;
    semester: number;
  };
}

export default function AdminTeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal state
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filters
  const [sectionFilter, setSectionFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch teams
  const fetchTeams = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (sectionFilter) params.append("section_id", sectionFilter);
      if (statusFilter) params.append("status", statusFilter);
      if (searchQuery) params.append("search", searchQuery);

      const data = await api.get<{ teams: Team[]; total: number }>(
        `/api/admin/teams?${params.toString()}`,
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
      const data = await api.get<Section[]>("/api/sections");
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
      await api.delete("/api/admin/teams", {
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
          <button
            onClick={() => {
              const rows = teams.flatMap((team) =>
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
              exportToCSV(
                rows,
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
            }}
            disabled={teams.length === 0}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition shadow-sm disabled:opacity-50"
          >
            ⚡ Export CSV
          </button>
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
                onClick={() => {
                  setSearchQuery("");
                  setSectionFilter("");
                  setStatusFilter("");
                }}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition"
              >
                🔄 ล้างตัวกรอง
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
                    onClick={() => {
                      setSelectedTeam(team);
                      setIsModalOpen(true);
                    }}
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
                          🔒 ล็อค
                        </span>
                      ) : (
                        <span className="text-green-500 font-medium">
                          🔓 ปลด
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
                          className="px-3 py-1.5 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium transition"
                          title="ลบทีม"
                        >
                          🗑️ ลบ
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
      <TeamDetailModal
        isOpen={isModalOpen}
        team={selectedTeam}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTeam(null);
        }}
        onTeamUpdated={() => {
          fetchTeams();
          // Refresh selected team data
          if (selectedTeam) {
            const updatedTeam = teams.find(
              (t) => t.team_id === selectedTeam.team_id,
            );
            if (updatedTeam) setSelectedTeam(updatedTeam);
          }
        }}
      />
    </>
  );
}
