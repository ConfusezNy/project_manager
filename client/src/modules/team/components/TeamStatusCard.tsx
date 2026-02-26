"use client";

// TeamStatusCard Component - Shows team status information
import React from "react";
import { Users, UserPlus } from "lucide-react";
import Button from "@/shared/components/Button";
import { TeamData } from "../services/teamService";

interface Props {
  hasTeam: boolean;
  teamData: TeamData | null;
  section: any;
  onCreateTeam: () => void;
}

export const TeamStatusCard: React.FC<Props> = ({
  hasTeam,
  teamData,
  section,
  onCreateTeam,
}) => {
  return (
    <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Users size={22} className="text-blue-500" />
          สถานะกลุ่ม
        </h2>
        {hasTeam && (
          <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold px-3 py-1.5 rounded-full uppercase border border-blue-100 dark:border-blue-800">
            รอมอบหมายหัวข้อ
          </span>
        )}
      </div>

      {hasTeam ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider mb-2">
              ชื่อกลุ่ม
            </p>
            <p className="text-base font-semibold text-gray-900 dark:text-white">
              {teamData?.teamname === "TMP"
                ? "รอตั้งชื่อกลุ่ม"
                : teamData?.teamname || "ยังไม่ได้ตั้งชื่อ"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider mb-2">
              เลขกลุ่ม
            </p>
            <p className="text-base font-semibold text-gray-900 dark:text-white">
              {section?.section_code || "---"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider mb-2">
              ภาคเรียน
            </p>
            <p className="text-base font-semibold text-gray-900 dark:text-white">
              {section?.Term
                ? `${section.Term.semester}/${section.Term.academicYear}`
                : section?.term
                  ? `${section.term.semester}/${section.term.academicYear}`
                  : teamData?.semester || "---"}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {section ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider mb-2">
                    ชื่อกลุ่ม
                  </p>
                  <p className="text-base font-semibold text-gray-400 dark:text-gray-500">
                    ยังไม่ได้สร้างกลุ่ม
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider mb-2">
                    เลขกลุ่ม
                  </p>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">
                    {section.section_code}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider mb-2">
                    ภาคเรียน
                  </p>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">
                    {section.term
                      ? `${section.term.semester}/${section.term.academicYear}`
                      : "---"}
                  </p>
                </div>
              </div>
              <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider mb-3">
                  สถานะ
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <UserPlus size={24} className="text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-base font-semibold text-gray-500 dark:text-gray-400">
                      ยังไม่มีกลุ่ม
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      สร้างกลุ่มหรือรอรับคำเชิญ
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    className="!py-2.5 !px-5 !text-base"
                    onClick={onCreateTeam}
                  >
                    สร้างกลุ่มใหม่
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4 text-base">
              ไม่พบข้อมูลรายวิชา
            </p>
          )}
        </div>
      )}
    </div>
  );
};
