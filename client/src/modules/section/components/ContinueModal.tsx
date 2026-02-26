"use client";

import React from "react";
import { Term, SectionTeam } from "../services/sectionService";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  sectionCode: string;
  terms: Term[];
  teams: SectionTeam[];
  selectedTermId: string;
  setSelectedTermId: (id: string) => void;
  selectedTeamIds: number[];
  setSelectedTeamIds: (ids: number[]) => void;
  onConfirm: () => void;
  loading?: boolean;
}

export const ContinueModal: React.FC<Props> = ({
  isOpen,
  onClose,
  sectionCode,
  terms,
  teams,
  selectedTermId,
  setSelectedTermId,
  selectedTeamIds,
  setSelectedTeamIds,
  onConfirm,
  loading = false,
}) => {
  if (!isOpen) return null;

  // Toggle single team
  const toggleTeam = (teamId: number) => {
    if (selectedTeamIds.includes(teamId)) {
      setSelectedTeamIds(selectedTeamIds.filter((id) => id !== teamId));
    } else {
      setSelectedTeamIds([...selectedTeamIds, teamId]);
    }
  };

  // Toggle all teams
  const toggleAllTeams = () => {
    if (selectedTeamIds.length === teams.length) {
      setSelectedTeamIds([]);
    } else {
      setSelectedTeamIds(teams.map((t) => t.team_id));
    }
  };

  // Select only non-approved teams
  const selectNonApproved = () => {
    const nonApproved = teams
      .filter((t) => t.project?.status !== "APPROVED")
      .map((t) => t.team_id);
    setSelectedTeamIds(nonApproved);
  };

  // Get status badge color
  const getStatusColor = (status: string | null | undefined) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
      case "PENDING":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "DRAFT":
        return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
      default:
        return "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400";
    }
  };

  // Get status text
  const getStatusText = (status: string | null | undefined) => {
    switch (status) {
      case "APPROVED":
        return "อนุมัติแล้ว";
      case "PENDING":
        return "รออนุมัติ";
      case "DRAFT":
        return "แบบร่าง";
      default:
        return "ไม่มีโปรเจกต์";
    }
  };

  const canConfirm =
    selectedTermId !== "" && selectedTeamIds.length > 0 && !loading;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5">
          <h2 className="text-xl font-bold text-white">
            ต่อวิชา: {sectionCode}
          </h2>
          <p className="text-blue-100 text-sm mt-1">Pre-Project → Project</p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Step 1: Select Term */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              ขั้นที่ 1: เลือกเทอมปลายทาง
            </label>
            <select
              className="border border-gray-300 dark:border-gray-600 p-3 w-full rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={selectedTermId}
              onChange={(e) => setSelectedTermId(e.target.value)}
            >
              <option value="">-- เลือกเทอม --</option>
              {terms.map((t) => (
                <option key={t.term_id} value={t.term_id}>
                  {t.semester}/{t.academicYear}
                </option>
              ))}
            </select>
          </div>

          {/* Step 2: Select Teams */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                ขั้นที่ 2: เลือกทีมที่ต้องการย้าย
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={selectNonApproved}
                  className="text-xs px-3 py-1.5 bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:hover:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300 rounded-md font-medium transition"
                >
                  เลือกที่ยังไม่อนุมัติ
                </button>
                <button
                  type="button"
                  onClick={toggleAllTeams}
                  className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md font-medium transition"
                >
                  {selectedTeamIds.length === teams.length
                    ? "ยกเลิกทั้งหมด"
                    : "เลือกทั้งหมด"}
                </button>
              </div>
            </div>

            {/* Teams List */}
            {teams.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 rounded-lg">
                ไม่มีทีมใน Section นี้
              </div>
            ) : (
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                {teams.map((team, idx) => (
                  <div
                    key={team.team_id}
                    className={`flex items-start gap-4 p-4 cursor-pointer transition hover:bg-gray-50 dark:hover:bg-gray-700/50 ${idx !== teams.length - 1
                        ? "border-b border-gray-200 dark:border-gray-700"
                        : ""
                      } ${selectedTeamIds.includes(team.team_id)
                        ? "bg-blue-50 dark:bg-blue-900/20"
                        : ""
                      }`}
                    onClick={() => toggleTeam(team.team_id)}
                  >
                    {/* Checkbox */}
                    <div className="pt-0.5">
                      <input
                        type="checkbox"
                        checked={selectedTeamIds.includes(team.team_id)}
                        onChange={() => toggleTeam(team.team_id)}
                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </div>

                    {/* Team Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          กลุ่ม {team.groupNumber}
                        </span>
                        {team.project && (
                          <span className="text-gray-600 dark:text-gray-400 text-sm truncate">
                            {team.project.projectname}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm">
                        <span className="text-gray-500 dark:text-gray-400">
                          สมาชิก: {team.memberCount} คน
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            team.project?.status,
                          )}`}
                        >
                          {getStatusText(team.project?.status)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Info */}
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              ทีมที่สถานะ "อนุมัติแล้ว" มักจะไม่ต้องต่อวิชา
              กรุณาตรวจสอบก่อนเลือก
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-semibold transition disabled:opacity-50"
            >
              ยกเลิก
            </button>
            <button
              onClick={onConfirm}
              disabled={!canConfirm}
              className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? "กำลังดำเนินการ..."
                : `ยืนยันต่อวิชา (${selectedTeamIds.length} ทีม)`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
