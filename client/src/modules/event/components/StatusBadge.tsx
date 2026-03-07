"use client";

import React from "react";

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const styles: Record<string, string> = {
    APPROVED: "bg-emerald-100 text-emerald-700",
    SUBMITTED: "bg-blue-100 text-blue-700",
    PENDING: "bg-amber-100 text-amber-700",
    NEEDS_REVISION: "bg-rose-100 text-rose-700",
    MISSING: "bg-slate-100 text-slate-500",
  };

  const labels: Record<string, string> = {
    APPROVED: "อนุมัติแล้ว",
    SUBMITTED: "ส่งแล้ว",
    PENDING: "รอส่ง",
    NEEDS_REVISION: "แก้ไข",
    MISSING: "ยังไม่ส่ง",
  };

  return (
    <span
      className={`px-2 py-0.5 rounded text-xs font-bold ${styles[status] || "bg-gray-100"}`}
    >
      {labels[status] || status}
    </span>
  );
};

/** Badge แสดงว่า Event นี้ต้องอัพโหลดไฟล์หรือเปล่า */
export const RequireFileBadge: React.FC<{ requireFile: boolean }> = ({ requireFile }) => {
  if (!requireFile) return null;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-600 border border-blue-200">
      📎 ต้องอัพโหลด
    </span>
  );
};
