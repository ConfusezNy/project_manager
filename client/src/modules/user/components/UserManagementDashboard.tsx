"use client";

// UserManagementDashboard - Main container for user management
import React from "react";
import { UserPlus } from "lucide-react";
import Button from "@/shared/components/Button";
import UserStats from "./UserStats";
import UserFilters from "./UserFilters";
import UserTable from "./UserTable";
import UserFormModal from "./UserFormModal";
import { useUserManagement } from "../hooks/useUserManagement";

export const UserManagementDashboard: React.FC = () => {
  const {
    currentUser,
    isAdmin,
    users,
    filteredUsers,
    isLoading,
    searchQuery,
    setSearchQuery,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
    isModalOpen,
    setIsModalOpen,
    editingUser,
    handlers,
  } = useUserManagement();

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen w-full bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            User Management
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            สถานะของคุณ:{" "}
            <span className="font-semibold text-blue-600 dark:text-blue-400">
              {currentUser?.role || "Guest"}
            </span>
          </p>
        </div>
        {isAdmin && (
          <Button
            variant="primary"
            icon={UserPlus}
            onClick={handlers.handleAddClick}
          >
            เพิ่มผู้ใช้งาน
          </Button>
        )}
      </div>

      {/* Stats */}
      <UserStats
        total={users.length}
        active={users.length}
        admins={users.filter((u) => u.role === "ADMIN").length}
      />

      {/* Filters */}
      <div className="my-6">
        <UserFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          roleFilter={roleFilter}
          setRoleFilter={setRoleFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <UserTable
          users={filteredUsers}
          onEdit={handlers.handleEditClick}
          onDelete={handlers.handleDeleteClick}
          onRoleChange={handlers.handleRoleChange}
          readOnly={!isAdmin}
        />
      </div>

      {/* Modal */}
      {isAdmin && (
        <UserFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handlers.handleFormSubmit}
          initialData={editingUser}
        />
      )}
    </div>
  );
};
