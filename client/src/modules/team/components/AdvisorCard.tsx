"use client";

import React from "react";
import Image from "next/image";
import { UserPlus, Mail, Phone, BookOpen } from "lucide-react";
import Button from "@/shared/components/Button";
import { ProjectData } from "../services/projectService";
import { getImageSrc } from "@/lib/image";

interface Props {
  projectData: ProjectData | null;
  onSelectAdvisor: () => void;
}

export const AdvisorCard: React.FC<Props> = ({ projectData, onSelectAdvisor }) => {
  const advisors = projectData?.advisors || [];
  const hasAdvisor = advisors.length > 0;
  // We rely on individual pa.status now, but retain global pending for the summary badge
  const isGlobalPending = projectData?.status === "PENDING";

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
      <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4 text-center">
        อาจารย์ที่ปรึกษา
      </h3>

      {hasAdvisor ? (
        <div className="flex flex-col gap-4">


          {advisors.map((pa: any) => {
            const advisor = pa.advisor;
            const isPaPending = pa.status === "PENDING";
            const roleName = pa.advisor_role === "PRIMARY" ? "ที่ปรึกษาหลัก" : "ที่ปรึกษาร่วม";
            const fullName = `${advisor?.titles ?? ""} ${advisor?.firstname ?? ""} ${advisor?.lastname ?? ""}`.trim();
            const initial = advisor?.firstname?.charAt(0)?.toUpperCase() || "A";
            const expertiseTags = advisor?.expertiseAreas
              ? advisor.expertiseAreas.split(",").map((s: string) => s.trim()).filter(Boolean)
              : [];

            return (
              <div
                key={pa.advisor_id}
                className={`flex flex-col items-center gap-3 p-5 rounded-xl border ${isPaPending
                  ? "bg-amber-50/60 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800/50"
                  : "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-100 dark:border-blue-800/50"
                  }`}
              >
                {/* Profile Picture */}
                <div className={`relative w-20 h-20 rounded-full overflow-hidden flex-shrink-0 shadow-md ${isPaPending
                  ? "opacity-70 bg-gradient-to-br from-amber-300 to-orange-400"
                  : "bg-gradient-to-br from-blue-400 to-purple-500"
                  }`}>
                  {getImageSrc(advisor?.profilePicture) ? (
                    <Image
                      src={getImageSrc(advisor.profilePicture)!}
                      alt={fullName}
                      fill
                      className={`object-cover ${isPaPending ? "opacity-70" : ""}`}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
                      {initial}
                    </div>
                  )}
                </div>

                {/* Name + Status label */}
                <div className="text-center">
                  <p className="text-base font-semibold text-gray-900 dark:text-white leading-tight">
                    {fullName}
                  </p>
                  {/* ✅ label บอก status ชัดเจน */}
                  <p className={`text-xs font-medium mt-0.5 ${isPaPending
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-blue-600 dark:text-blue-400"
                    }`}>
                    {isPaPending ? ` รอการยืนยัน (${roleName})` : roleName}
                  </p>
                </div>

                {/* Expertise Tags */}
                {expertiseTags.length > 0 && (
                  <div className="w-full">
                    <div className="flex items-center gap-1 mb-2 justify-center">
                      <BookOpen size={12} className="text-gray-400" />
                      <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                        ความเชี่ยวชาญ
                      </span>
                    </div>
                    <div className="flex flex-wrap justify-center gap-1.5">
                      {expertiseTags.map((tag: string, i: number) => (
                        <span
                          key={i}
                          className="text-[11px] px-2.5 py-0.5 bg-white dark:bg-gray-800 text-blue-700 dark:text-blue-300 rounded-full border border-blue-200 dark:border-blue-700 font-medium shadow-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Contact Info */}
                <div className="w-full space-y-1.5 pt-1 border-t border-blue-100 dark:border-blue-800/50">
                  {advisor?.email && (
                    <a
                      href={`mailto:${advisor.email}`}
                      className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
                    >
                      <Mail size={13} className="text-gray-400 group-hover:text-blue-500 flex-shrink-0" />
                      <span className="truncate">{advisor.email}</span>
                    </a>
                  )}
                  {advisor?.tel_number && (
                    <a
                      href={`tel:${advisor.tel_number}`}
                      className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
                    >
                      <Phone size={13} className="text-gray-400 group-hover:text-blue-500 flex-shrink-0" />
                      <span>{advisor.tel_number}</span>
                    </a>
                  )}
                </div>
              </div>
            );
          })}

          {/* Change Advisor Button — แสดงเฉพาะตอนที่ยังไม่ APPROVED */}
          {projectData?.status !== "APPROVED" && (
            <Button
              variant="secondary"
              className="!py-2 !px-4 !text-sm w-full mt-1"
              onClick={onSelectAdvisor}
            >
              เปลี่ยนอาจารย์ที่ปรึกษาหลัก
            </Button>
          )}

          {/* ขอเพิ่มอาจารย์ที่ปรึกษาร่วมได้ ถ้า Project Approved แล้ว และมีอาจารย์แค่ 1 คน */}
          {projectData?.status === "APPROVED" && advisors.length < 2 && (
            <Button
              variant="secondary"
              className="!py-2 !px-4 !text-sm w-full mt-1"
              onClick={onSelectAdvisor}
            >
              ขออาจารย์ที่ปรึกษาร่วม +
            </Button>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center py-2">
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
        </div>
      )}
    </div>
  );
};
