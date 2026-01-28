"use client";

import React from "react";
import { FileText, Edit2, Trash2 } from "lucide-react";

interface ProjectAdvisor {
  advisor_id: string;
  advisor?: {
    firstname?: string;
    lastname?: string;
    titles?: string;
    email?: string;
  };
}

export interface ProjectData {
  projectname: string;
  projectnameEng?: string;
  project_type?: string;
  description?: string;
  status: "DRAFT" | "PENDING" | "APPROVED" | "REJECTED";
  advisors?: ProjectAdvisor[];
}

interface TeamProjectDetailProps {
  data: ProjectData | null;
  onEdit?: () => void;
  onDelete?: () => void;
  canEdit?: boolean;
}

export const TeamProjectDetail: React.FC<TeamProjectDetailProps> = ({
  data,
  onEdit,
  onDelete,
  canEdit = false,
}) => {
  if (!data) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FileText size={20} className="text-amber-500" />
            รายละเอียดหัวข้อโครงการ
          </h2>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            ยังไม่มีหัวข้อโครงงาน
          </p>
        </div>
      </div>
    );
  }

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "APPROVED":
        return {
          text: "อนุมัติแล้ว",
          classes:
            "bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800",
        };
      case "REJECTED":
        return {
          text: "ไม่อนุมัติ",
          classes:
            "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800",
        };
      case "PENDING":
        return {
          text: "รอการอนุมัติ",
          classes:
            "bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800",
        };
      default:
        return {
          text: "ร่าง (ยังไม่มีอาจารย์)",
          classes:
            "bg-gray-50 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800",
        };
    }
  };

  const statusDisplay = getStatusDisplay(data.status);

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <FileText size={20} className="text-amber-500" />
          รายละเอียดหัวข้อโครงการ
        </h2>
        {canEdit && (
          <div className="flex gap-2">
            {onEdit && (
              <button
                onClick={onEdit}
                className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                <Edit2 size={14} />
                แก้ไข
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="flex items-center gap-1.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Trash2 size={14} />
                ลบ
              </button>
            )}
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* ชื่อโครงงานภาษาไทย */}
        <div>
          <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">
            ชื่อโครงงาน (ไทย)
          </p>
          <p className="text-base font-bold mt-1 text-gray-900 dark:text-white leading-tight">
            {data.projectname}
          </p>
        </div>

        {/* ชื่อโครงงานภาษาอังกฤษ */}
        {data.projectnameEng && (
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">
              Project Name (English)
            </p>
            <p className="text-base font-semibold mt-1 text-gray-700 dark:text-gray-300 leading-tight">
              {data.projectnameEng}
            </p>
          </div>
        )}

        {/* ประเภทโครงงาน */}
        {data.project_type && (
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">
              ประเภท
            </p>
            <span className="inline-block mt-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-semibold rounded-full border border-blue-200 dark:border-blue-800">
              {data.project_type}
            </span>
          </div>
        )}

        {/* คำอธิบาย */}
        {data.description && (
          <div className="pt-4 border-t border-gray-100 dark:border-gray-700/50">
            <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">
              รายละเอียด
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 leading-relaxed whitespace-pre-wrap">
              {data.description}
            </p>
          </div>
        )}

        {/* อาจารย์ที่ปรึกษา */}
        {data.advisors && data.advisors.length > 0 && (
          <div className="pt-4 border-t border-gray-100 dark:border-gray-700/50">
            <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-3">
              อาจารย์ที่ปรึกษา
            </p>
            <div className="space-y-2">
              {data.advisors.map((advisor) => (
                <div
                  key={advisor.advisor_id}
                  className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
                    {advisor.advisor?.firstname?.charAt(0) || "A"}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {advisor.advisor?.titles} {advisor.advisor?.firstname}{" "}
                      {advisor.advisor?.lastname}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {advisor.advisor?.email}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* สถานะ */}
        <div className="pt-4 border-t border-gray-100 dark:border-gray-700/50">
          <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-2">
            สถานะ
          </p>
          <span
            className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${statusDisplay.classes}`}
          >
            {statusDisplay.text}
          </span>
        </div>
      </div>
    </div>
  );
};
