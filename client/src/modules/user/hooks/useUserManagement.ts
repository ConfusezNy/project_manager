"use client";

// useUserManagement Hook - State management for user management page
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

export interface User {
  id: string | number;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  team?: string;
  project?: string;
  titles?: string;
  firstname?: string;
  lastname?: string;
  tel_number?: string;
  expertiseAreas?: string;
}

export function useUserManagement() {
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === "ADMIN";

  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await api.get<any[]>("/users");

      if (data) {
        const mappedUsers = data.map((u: any) => {
          const mainTeam = u.teams && u.teams.length > 0 ? u.teams[0] : null;
          let teamStr = "-";
          if (mainTeam) {
            teamStr = `กลุ่ม ${mainTeam.groupNumber || "?"}`;
            const tName = mainTeam.name?.trim();
            if (tName && tName !== "รออนุมัติหัวข้อ") {
              teamStr += ` — ${tName}`;
            }
          }

          return {
            id: u.users_id,
            name: `${u.firstname} ${u.lastname}`,
            email: u.email,
            role: u.role,
            avatar: u.profilePicture,
            team: teamStr,
            project: mainTeam?.project?.projectname || "-",
            titles: u.titles || "",
            firstname: u.firstname || "",
            lastname: u.lastname || "",
            tel_number: u.tel_number || "",
            expertiseAreas: u.expertiseAreas || "",
          };
        });
        setUsers(mappedUsers);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "All" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleAddClick = useCallback(() => {
    setEditingUser(null);
    setIsModalOpen(true);
  }, []);

  const handleDeleteClick = useCallback(async (id: string | number) => {
    if (confirm("คุณต้องการลบผู้ใช้งานนี้ใช่หรือไม่?")) {
      try {
        await api.delete(`/users/${id}`);
        setUsers((prev) => prev.filter((u) => u.id !== id));
      } catch (error) {
        alert("ลบไม่สำเร็จ");
      }
    }
  }, []);

  const handleEditClick = useCallback((user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  }, []);

  const handleFormSubmit = useCallback(
    async (formData: Partial<User> & { newPassword?: string; profilePicture?: string }) => {
      try {
        if (editingUser) {
          // Update existing user
          const payload: any = {
            role: formData.role,
            titles: formData.titles,
            firstname: formData.firstname,
            lastname: formData.lastname,
            tel_number: formData.tel_number,
          };
          if (formData.newPassword) {
            payload.newPassword = formData.newPassword;
          }
          if (formData.profilePicture !== undefined) {
            payload.profilePicture = formData.profilePicture;
          }
          if (formData.expertiseAreas !== undefined) {
            payload.expertiseAreas = formData.expertiseAreas;
          }
          await api.patch(`/users/${editingUser.id}`, payload);
        }
        await fetchUsers();
        setIsModalOpen(false);
      } catch (error: any) {
        alert(error.message || "เกิดข้อผิดพลาด");
      }
    },
    [editingUser, fetchUsers],
  );

  // Quick role change handler (for inline change)
  const handleRoleChange = useCallback(
    async (userId: string | number, newRole: string) => {
      try {
        await api.patch(`/users/${userId}`, { role: newRole });
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)),
        );
      } catch (error: any) {
        alert(error.message || "เปลี่ยน Role ไม่สำเร็จ");
      }
    },
    [],
  );

  return {
    // Session
    currentUser,
    isAdmin,

    // Data
    users,
    filteredUsers,
    isLoading,

    // Filters
    searchQuery,
    setSearchQuery,
    roleFilter,
    setRoleFilter,

    // Modal
    isModalOpen,
    setIsModalOpen,
    editingUser,

    // Handlers
    handlers: {
      fetchUsers,
      handleAddClick,
      handleDeleteClick,
      handleEditClick,
      handleFormSubmit,
      handleRoleChange,
    },
  };
}
