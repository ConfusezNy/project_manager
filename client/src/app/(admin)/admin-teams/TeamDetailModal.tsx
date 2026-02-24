"use client";

import React, { useState, useEffect, useCallback } from "react";
import { X, Trash2, UserPlus, Edit2, Save, Users } from "lucide-react";
import { api } from "@/lib/api";

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

interface Props {
  isOpen: boolean;
  team: Team | null;
  onClose: () => void;
  onTeamUpdated: () => void;
}

export function TeamDetailModal({
  isOpen,
  team,
  onClose,
  onTeamUpdated,
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    groupNumber: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Add member states
  const [showAddMember, setShowAddMember] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [availableUsers, setAvailableUsers] = useState<
    { users_id: string; firstname: string; lastname: string; email: string }[]
  >([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [addingMember, setAddingMember] = useState(false);

  // Reset form when team changes
  useEffect(() => {
    if (team) {
      setEditForm({
        name: team.name || "",
        groupNumber: team.groupNumber || "",
      });
      setIsEditing(false);
      setError("");
      setShowAddMember(false);
      setSearchQuery("");
      setAvailableUsers([]);
    }
  }, [team]);

  // Search available users
  const searchAvailableUsers = useCallback(async () => {
    if (!team) return;
    setLoadingUsers(true);
    try {
      const params = searchQuery
        ? `?search=${encodeURIComponent(searchQuery)}`
        : "";
      const users = await api.get<
        {
          users_id: string;
          firstname: string;
          lastname: string;
          email: string;
        }[]
      >(`/admin/teams/${team.team_id}/available-members${params}`);
      setAvailableUsers(users);
    } catch (err) {
      console.error("Failed to fetch available users:", err);
    } finally {
      setLoadingUsers(false);
    }
  }, [team, searchQuery]);

  useEffect(() => {
    if (showAddMember && team) {
      searchAvailableUsers();
    }
  }, [showAddMember, searchAvailableUsers, team]);

  // Add member to team
  const handleAddMember = async (userId: string) => {
    if (!team) return;
    setAddingMember(true);
    try {
      await api.post(`/admin/teams/${team.team_id}/members`, {
        user_id: userId,
      });
      onTeamUpdated();
      setShowAddMember(false);
      setSearchQuery("");
    } catch (err: any) {
      alert(err.message || "เกิดข้อผิดพลาดในการเพิ่มสมาชิก");
    } finally {
      setAddingMember(false);
    }
  };

  if (!isOpen || !team) return null;

  // Update team
  const handleUpdateTeam = async () => {
    setSaving(true);
    setError("");
    try {
      await api.put(`/admin/teams/${team.team_id}`, {
        name: editForm.name,
        groupNumber: editForm.groupNumber,
      });
      setIsEditing(false);
      onTeamUpdated();
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setSaving(false);
    }
  };

  // Remove member from team
  const handleRemoveMember = async (userId: string) => {
    if (!confirm("คุณแน่ใจหรือไม่ที่จะลบสมาชิกนี้ออกจากทีม?")) return;

    try {
      await api.delete(`/admin/teams/${team.team_id}/members/${userId}`);
      onTeamUpdated();
    } catch (err: any) {
      alert(err.message || "เกิดข้อผิดพลาดในการลบสมาชิก");
    }
  };

  // Delete team
  const handleDeleteTeam = async () => {
    if (
      !confirm(
        `คุณแน่ใจหรือไม่ที่จะลบทีม "${team.name || team.groupNumber}"?\n\nการลบจะลบ:\n- สมาชิกทั้งหมด\n- โปรเจกต์ (ถ้ามี)\n- Tasks ทั้งหมด`,
      )
    ) {
      return;
    }

    try {
      await api.delete("/admin/teams", {
        body: JSON.stringify({ team_id: team.team_id }),
        headers: { "Content-Type": "application/json" },
      });
      alert("ลบทีมเรียบร้อย");
      onClose();
      onTeamUpdated();
    } catch (err: any) {
      alert(err.message || "เกิดข้อผิดพลาดในการลบทีม");
    }
  };

  // Status badge
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

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="text-white" size={24} />
            <h2 className="text-xl font-bold text-white">รายละเอียดทีม</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          {/* Team Info */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 dark:text-white">
                ข้อมูลทีม
              </h3>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
              >
                <Edit2 size={14} />
                {isEditing ? "ยกเลิก" : "แก้ไข"}
              </button>
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    ชื่อทีม
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                    className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="ชื่อทีม"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    รหัสกลุ่ม
                  </label>
                  <input
                    type="text"
                    value={editForm.groupNumber}
                    onChange={(e) =>
                      setEditForm({ ...editForm, groupNumber: e.target.value })
                    }
                    className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="รหัสกลุ่ม"
                  />
                </div>
                <button
                  onClick={handleUpdateTeam}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50"
                >
                  <Save size={16} />
                  {saving ? "กำลังบันทึก..." : "บันทึก"}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    ชื่อทีม
                  </span>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {team.name || "-"}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    รหัสกลุ่ม
                  </span>
                  <p className="font-mono font-bold text-blue-600 dark:text-blue-400">
                    {team.groupNumber}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Section
                  </span>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {team.section.section_code}
                  </p>
                  <p className="text-xs text-gray-500">
                    {team.section.course_type} • {team.section.term.semester}/
                    {team.section.term.academicYear}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    ล็อคทีม
                  </span>
                  <p
                    className={
                      team.section.team_locked
                        ? "text-red-500 font-medium"
                        : "text-green-500 font-medium"
                    }
                  >
                    {team.section.team_locked ? "🔒 ล็อค" : "🔓 ปลดล็อค"}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Project Info */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-6">
            <h3 className="font-bold text-gray-900 dark:text-white mb-3">
              โปรเจกต์
            </h3>
            {team.project ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {team.project.projectname}
                  </span>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                      team.project.status || "PENDING",
                    )}`}
                  >
                    {team.project.status || "PENDING"}
                  </span>
                </div>
                {team.project.projectnameEng && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {team.project.projectnameEng}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-gray-400 italic">ยังไม่มีโปรเจกต์</p>
            )}
          </div>

          {/* Members */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-900 dark:text-white">
                สมาชิก ({team.members.length} คน)
              </h3>
              <button
                onClick={() => setShowAddMember(!showAddMember)}
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
              >
                <UserPlus size={14} />
                {showAddMember ? "ยกเลิก" : "เพิ่มสมาชิก"}
              </button>
            </div>

            {/* Add Member Section */}
            {showAddMember && (
              <div className="mb-4 p-3 bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-700">
                <div className="mb-3">
                  <input
                    type="text"
                    placeholder="ค้นหานักศึกษา (รหัส, ชื่อ, อีเมล)..."
                    className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                {loadingUsers ? (
                  <div className="text-center py-3 text-gray-500">
                    กำลังโหลด...
                  </div>
                ) : availableUsers.length > 0 ? (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {availableUsers.map((user) => (
                      <div
                        key={user.users_id}
                        className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.firstname} {user.lastname}
                          </p>
                          <p className="text-xs text-gray-500">
                            {user.users_id} • {user.email}
                          </p>
                        </div>
                        <button
                          onClick={() => handleAddMember(user.users_id)}
                          disabled={addingMember}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg disabled:opacity-50"
                        >
                          + เพิ่ม
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-3 text-gray-400 text-sm">
                    ไม่พบนักศึกษาที่สามารถเพิ่มได้
                    <br />
                    <span className="text-xs">
                      (ต้องลงทะเบียนใน Section เดียวกัน และยังไม่อยู่ในทีมใด)
                    </span>
                  </div>
                )}
              </div>
            )}

            {team.members.length > 0 ? (
              <div className="space-y-2">
                {team.members.map((member) => (
                  <div
                    key={member.user_id}
                    className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {member.firstname} {member.lastname}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {member.user_id} • {member.email}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveMember(member.user_id)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                      title="ลบสมาชิก"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 italic">ไม่มีสมาชิก</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-between">
          <button
            onClick={handleDeleteTeam}
            className="flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-lg font-medium transition"
          >
            <Trash2 size={16} />
            ลบทีม
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
}
