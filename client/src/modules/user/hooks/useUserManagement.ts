"use client";

// useUserManagement Hook - State management for user management page
import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { api } from "@/lib/api";

export interface User {
  id: string | number;
  name: string;
  email: string;
  role: string;
  status: "Active" | "Inactive";
  lastActive: string;
}

export function useUserManagement() {
  const { data: session } = useSession();
  const currentUser = session?.user as any;
  const isAdmin = currentUser?.role === "ADMIN";

  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await api.get<any[]>("/api/users");

      if (data) {
        const mappedUsers = data.map((u: any) => ({
          id: u.users_id,
          name: `${u.firstname} ${u.lastname}`,
          email: u.email,
          role: u.role,
          status: "Active" as "Active" | "Inactive",
          lastActive: "Now",
        }));
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
    const matchesStatus =
      statusFilter === "All" || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleAddClick = useCallback(() => {
    setEditingUser(null);
    setIsModalOpen(true);
  }, []);

  const handleDeleteClick = useCallback(async (id: string | number) => {
    if (confirm("คุณต้องการลบผู้ใช้งานนี้ใช่หรือไม่?")) {
      try {
        await api.delete(`/api/users/${id}`);
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
    async (formData: Partial<User>) => {
      try {
        if (editingUser) {
          // Update existing user
          await api.patch(`/api/users/${editingUser.id}`, {
            role: formData.role,
            // Split name back to firstname/lastname if needed
          });
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
        await api.patch(`/api/users/${userId}`, { role: newRole });
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
    statusFilter,
    setStatusFilter,

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
