"use client";

import React from "react";
import { Plus, Settings } from "lucide-react";
import Button from "@/shared/components/Button";

interface TeamHeaderProps {
  role: string;
  hasGroup: boolean;
  onAddClick?: () => void;
  onSettingsClick?: () => void;
}

export const TeamHeader = ({
  role,
  hasGroup,
  onAddClick,
  onSettingsClick,
}: TeamHeaderProps) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Teams Management
      </h1>
      <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
        สถานะของคุณ:{" "}
        <span className="font-semibold text-blue-600 dark:text-blue-400">
          {role}
        </span>
      </p>
    </div>

    {!hasGroup ? (
      <Button variant="primary" icon={Plus} onClick={onAddClick}>
        สร้างกลุ่มใหม่
      </Button>
    ) : (
      <Button variant="secondary" icon={Settings} onClick={onSettingsClick}>
        ตั้งค่ากลุ่ม
      </Button>
    )}
  </div>
);
