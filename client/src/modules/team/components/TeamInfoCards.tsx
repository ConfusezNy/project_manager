"use client";

import React from "react";
import { Users, UserCheck } from "lucide-react";
import Button from "@/shared/components/Button";

export interface TeamInfoData {
  name?: string;
  groupNumber?: string;
  semester?: string;
}

interface TeamInfoCardsProps {
  data: TeamInfoData | null;
  onSelectAdvisor?: () => void;
}

export const TeamInfoCards = ({
  data,
  onSelectAdvisor,
}: TeamInfoCardsProps) => {
  if (!data) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* ส่วนที่ 1: สถานะกลุ่มและข้อมูลพื้นฐาน */}
      <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Users size={20} className="text-blue-500" />
            สถานะกลุ่ม
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <p className="text-[11px] text-gray-400 uppercase font-bold tracking-wider">
              ชื่อกลุ่ม
            </p>
            <p className="text-sm font-semibold mt-1 text-gray-900 dark:text-white">
              {data.name || "---"}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-gray-400 uppercase font-bold tracking-wider">
              เลขกลุ่ม
            </p>
            <p className="text-sm font-semibold mt-1 text-gray-900 dark:text-white">
              {data.groupNumber || "---"}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-gray-400 uppercase font-bold tracking-wider">
              ภาคเรียน
            </p>
            <p className="text-sm font-semibold mt-1 text-gray-900 dark:text-white">
              {data.semester || "---"}
            </p>
          </div>
        </div>
      </div>

      {/* ส่วนที่ 2: อาจารย์ที่ปรึกษา */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center text-center">
        <div className="w-14 h-14 rounded-full flex items-center justify-center mb-3 bg-gray-100 dark:bg-gray-700 text-gray-400">
          <UserCheck size={28} />
        </div>
        <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500">
          ยังไม่ได้เลือกอาจารย์
        </h3>
        <p className="text-[10px] text-gray-400 mt-1 mb-4">
          กรุณาติดต่ออาจารย์เพื่อขอคำปรึกษา
        </p>
        <Button
          variant="primary"
          className="!py-2 !px-4 !text-[11px] w-full"
          onClick={onSelectAdvisor}
        >
          เลือกอาจารย์ที่ปรึกษา +
        </Button>
      </div>
    </div>
  );
};
