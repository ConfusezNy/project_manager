"use client";

// Re-export from User module
import { UserManagementDashboard } from "@/modules/user/components/UserManagementDashboard";

export default function UsersPage() {
  return <UserManagementDashboard />;
}
