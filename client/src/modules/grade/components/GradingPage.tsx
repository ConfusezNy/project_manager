"use client";

import React from "react";
import {
  GraduationCap,
  ChevronDown,
  Users,
  Save,
  RotateCcw,
  CheckCircle,
  Loader2,
  Search,
  Filter,
  Download,
} from "lucide-react";
import { exportToCSV, formatGradeLabel } from "@/lib/exportCSV";
import {
  useGrading,
  GRADE_OPTIONS,
  GradeScore,
  GradeFilter,
} from "../hooks/useGrading";

// สีของแต่ละเกรด
const gradeColorMap: Record<
  GradeScore,
  { bg: string; text: string; ring: string }
> = {
  A: {
    bg: "bg-emerald-500",
    text: "text-white",
    ring: "ring-emerald-500",
  },
  B_PLUS: {
    bg: "bg-blue-500",
    text: "text-white",
    ring: "ring-blue-500",
  },
  B: {
    bg: "bg-blue-400",
    text: "text-white",
    ring: "ring-blue-400",
  },
  C_PLUS: {
    bg: "bg-amber-500",
    text: "text-white",
    ring: "ring-amber-500",
  },
  C: {
    bg: "bg-amber-400",
    text: "text-white",
    ring: "ring-amber-400",
  },
  D_PLUS: {
    bg: "bg-orange-500",
    text: "text-white",
    ring: "ring-orange-500",
  },
  D: {
    bg: "bg-orange-400",
    text: "text-white",
    ring: "ring-orange-400",
  },
  F: {
    bg: "bg-red-500",
    text: "text-white",
    ring: "ring-red-500",
  },
};

// Team Card ขอบสี
const teamBorderColors = [
  "border-l-blue-500",
  "border-l-purple-500",
  "border-l-emerald-500",
  "border-l-orange-500",
  "border-l-pink-500",
  "border-l-cyan-500",
  "border-l-amber-500",
  "border-l-indigo-500",
];

const filterOptions: { value: GradeFilter; label: string }[] = [
  { value: "ALL", label: "ทั้งหมด" },
  { value: "GRADED", label: "ให้เกรดแล้ว" },
  { value: "NOT_GRADED", label: "ยังไม่ได้ให้เกรด" },
];

export const GradingPage: React.FC = () => {
  const {
    sections,
    selectedSection,
    setSelectedSection,
    teams,
    allTeams,
    gradeMap,
    loading,
    saving,
    error,
    successMessage,
    totalStudents,
    gradedCount,
    hasChanges,
    searchQuery,
    setSearchQuery,
    gradeFilter,
    setGradeFilter,
    setGrade,
    resetGrades,
    saveGrades,
  } = useGrading();

  // Export CSV
  const handleExportGrades = () => {
    const rows: Record<string, string | number | null>[] = [];
    for (const team of allTeams) {
      for (const member of team.members) {
        const score = gradeMap[member.users_id];
        rows.push({
          group: team.groupNumber,
          team_name: team.name,
          project: team.project?.projectname || "-",
          student_id: member.users_id,
          firstname: member.firstname,
          lastname: member.lastname,
          grade: score ? formatGradeLabel(score) : "-",
        });
      }
    }
    const sectionName = selectedSection?.section_code || "grades";
    exportToCSV(
      rows,
      [
        { key: "group", label: "กลุ่ม" },
        { key: "team_name", label: "ชื่อทีม" },
        { key: "project", label: "ชื่อโครงงาน" },
        { key: "student_id", label: "รหัสนักศึกษา" },
        { key: "firstname", label: "ชื่อ" },
        { key: "lastname", label: "นามสกุล" },
        { key: "grade", label: "เกรด" },
      ],
      `grades_${sectionName}`,
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans text-slate-900">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-slate-800">
              ให้เกรดนักศึกษา
            </h1>
          </div>
          <p className="text-slate-500 text-sm mt-1 ml-11">
            เลือก Section แล้วให้เกรดนักศึกษาทุกคน
          </p>
        </div>

        {/* Progress Badge */}
        <div className="flex items-center gap-3">
          <div className="bg-white border border-slate-200 rounded-lg px-4 py-2 flex items-center gap-2">
            <CheckCircle
              className={`w-4 h-4 ${gradedCount === totalStudents && totalStudents > 0 ? "text-emerald-500" : "text-slate-400"}`}
            />
            <span className="text-sm font-medium text-slate-700">
              ให้เกรดแล้ว{" "}
              <span className="text-blue-600 font-bold">
                {gradedCount}/{totalStudents}
              </span>{" "}
              คน
            </span>
          </div>
          <button
            onClick={handleExportGrades}
            disabled={totalStudents === 0}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-4 flex flex-col md:flex-row gap-4 items-center">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-sm font-bold text-slate-600 whitespace-nowrap">
            Section:
          </span>
          <div className="relative w-full md:w-72">
            <select
              className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 pr-8 font-medium"
              value={selectedSection?.section_id || ""}
              onChange={(e) => {
                const section = sections.find(
                  (s) => s.section_id === parseInt(e.target.value),
                );
                if (section) setSelectedSection(section);
              }}
            >
              {sections.length === 0 ? (
                <option value="">ไม่มี Section</option>
              ) : (
                sections.map((s) => (
                  <option key={s.section_id} value={s.section_id}>
                    {s.section_code} - {s.Term?.semester}/{s.Term?.academicYear}{" "}
                    ({s.course_type})
                  </option>
                ))
              )}
            </select>
            <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        <div className="h-6 w-px bg-slate-200 hidden md:block" />

        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Users className="w-4 h-4" />
          <span>
            {teams.length} ทีม · {totalStudents} คน
          </span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row gap-3 items-center">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="ค้นหาชื่อ หรือ รหัสนักศึกษา..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 text-xs font-bold"
            >
              ✕
            </button>
          )}
        </div>

        <div className="h-6 w-px bg-slate-200 hidden md:block" />

        {/* Grade Filter Pills */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          {filterOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setGradeFilter(opt.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                gradeFilter === opt.value
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 border border-red-200 text-sm">
          ⚠️ {error}
        </div>
      )}
      {successMessage && (
        <div className="bg-emerald-50 text-emerald-600 p-4 rounded-xl mb-6 border border-emerald-200 text-sm flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          {successMessage}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
          <p className="text-slate-400 mt-4">กำลังโหลด...</p>
        </div>
      ) : teams.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">
            {searchQuery || gradeFilter !== "ALL"
              ? "ไม่พบผลลัพธ์ ลองเปลี่ยนคำค้นหาหรือตัวกรอง"
              : "ไม่มีทีมใน Section นี้"}
          </p>
        </div>
      ) : (
        <>
          {/* Team Cards */}
          <div className="space-y-4 mb-24">
            {teams.map((team, teamIdx) => (
              <div
                key={team.team_id}
                className={`bg-white rounded-xl shadow-sm border border-slate-200 border-l-4 ${teamBorderColors[teamIdx % teamBorderColors.length]} overflow-hidden`}
              >
                {/* Team Header */}
                <div className="px-5 py-3 bg-slate-50 border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-800">
                      กลุ่ม {team.groupNumber} — {team.name}
                    </h3>
                    {team.project && (
                      <span className="text-xs text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200">
                        📋 {team.project.projectname}
                      </span>
                    )}
                  </div>
                </div>

                {/* Members */}
                <div className="divide-y divide-slate-100">
                  {team.members.map((member) => {
                    const selectedGrade = gradeMap[member.users_id];

                    return (
                      <div
                        key={member.users_id}
                        className="px-5 py-3 flex flex-col sm:flex-row sm:items-center gap-3"
                      >
                        {/* Student Info */}
                        <div className="flex items-center gap-3 sm:w-64 shrink-0">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                            {member.firstname.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-800">
                              {member.firstname} {member.lastname}
                            </p>
                            <p className="text-xs text-slate-400">
                              {member.users_id}
                            </p>
                          </div>
                        </div>

                        {/* Grade Pills */}
                        <div className="flex flex-wrap gap-1.5">
                          {GRADE_OPTIONS.map((option) => {
                            const isSelected = selectedGrade === option.value;
                            const colors = gradeColorMap[option.value];

                            return (
                              <button
                                key={option.value}
                                onClick={() =>
                                  setGrade(member.users_id, option.value)
                                }
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 ${
                                  isSelected
                                    ? `${colors.bg} ${colors.text} ring-2 ${colors.ring} ring-offset-1 scale-105 shadow-sm`
                                    : "bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700"
                                }`}
                              >
                                {option.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Action Bar */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg z-40">
            <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
              <div className="text-sm text-slate-500">
                {hasChanges ? (
                  <span className="text-amber-600 font-medium">
                    ● มีการเปลี่ยนแปลง ยังไม่ได้บันทึก
                  </span>
                ) : (
                  <span className="text-emerald-600">
                    ✓ เกรดล่าสุดถูกบันทึกแล้ว
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={resetGrades}
                  disabled={!hasChanges || saving}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RotateCcw className="w-4 h-4" />
                  รีเซ็ต
                </button>
                <button
                  onClick={saveGrades}
                  disabled={saving || !hasChanges}
                  className="flex items-center gap-2 px-6 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  บันทึกเกรดทั้งหมด
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
