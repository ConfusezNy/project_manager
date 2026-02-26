"use client";

// AdvisorCard Component - Shows advisor information
import React from "react";
import { UserPlus } from "lucide-react";
import Button from "@/shared/components/Button";
import { ProjectData } from "../services/projectService";

interface Props {
  projectData: ProjectData | null;
  onSelectAdvisor: () => void;
}

export const AdvisorCard: React.FC<Props> = ({
  projectData,
  onSelectAdvisor,
}) => {
  const advisors = projectData?.advisors || [];
  const hasAdvisor = advisors.length > 0;

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center text-center">
      {hasAdvisor ? (
        <>
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">
            อาจารย์ที่ปรึกษา
          </h3>
          {advisors.map((advisor: any) => (
            <div
              key={advisor.advisor_id}
              className="flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 w-full mb-3"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                {advisor.advisor?.firstname?.charAt(0) || "A"}
              </div>
              <div className="flex-1 text-left">
                <p className="text-base font-semibold text-gray-900 dark:text-white">
                  {advisor.advisor?.titles} {advisor.advisor?.firstname}{" "}
                  {advisor.advisor?.lastname}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {advisor.advisor?.email}
                </p>
              </div>
            </div>
          ))}
          {projectData?.status !== "APPROVED" && (
            <Button
              variant="secondary"
              className="!py-2 !px-4 !text-sm w-full mt-2"
              onClick={onSelectAdvisor}
            >
              เปลี่ยนอาจารย์
            </Button>
          )}
        </>
      ) : (
        <>
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-gray-100 dark:bg-gray-700">
            <UserPlus size={32} className="text-gray-400" />
          </div>
          <h3 className="text-base font-bold text-gray-500 dark:text-gray-400 mb-1">
            ยังไม่มีอาจารย์ที่ปรึกษา
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            เลือกอาจารย์เพื่อขอคำปรึกษาโครงงาน
          </p>
          <Button
            variant="primary"
            className="!py-2.5 !px-5 !text-sm w-full"
            onClick={onSelectAdvisor}
            disabled={!projectData}
          >
            เลือกอาจารย์ที่ปรึกษา +
          </Button>
          {!projectData && (
            <p className="text-xs text-gray-400 mt-2">
              สร้างหัวข้อโครงงานก่อนเลือกอาจารย์
            </p>
          )}
        </>
      )}
    </div>
  );
};
