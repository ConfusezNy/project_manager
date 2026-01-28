"use client";

import React from "react";
import { Section } from "../services/sectionService";

interface Props {
  section: Section;
  onEnroll: (sectionId: number) => void;
  onViewEnrollments: (sectionId: number) => void;
  onContinue: (sectionId: number) => void;
}

export const SectionCard: React.FC<Props> = ({
  section: s,
  onEnroll,
  onViewEnrollments,
  onContinue,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
      {/* Card Header */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-5">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold text-white mb-1">
              {s.section_code}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-blue-100 text-sm">
                {s.course_type === "PROJECT" ? "โปรเจกต์" : "ก่อนโปรเจกต์"}
              </span>
              <span className="text-blue-100">•</span>
              <span className="text-blue-100 text-sm">
                {s.study_type === "LE" ? "เทียบโอน" : "ปกติ"}
              </span>
            </div>
          </div>
          {s.course_type === "PRE_PROJECT" && (
            <button
              onClick={() => onContinue(s.section_id)}
              className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold rounded-lg transition backdrop-blur-sm"
              title="ต่อวิชาไป PROJECT"
            >
              ➡️ ต่อวิชา
            </button>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            ขนาดทีม
          </span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {s.min_team_size}-{s.max_team_size} คน
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            ภาคเรียน
          </span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {s.term?.term_name ?? `Term ${s.term?.term_id ?? "-"}`}
          </span>
        </div>

        <div className="pt-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
          <button
            onClick={() => onEnroll(s.section_id)}
            className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-sm transition text-base"
          >
            📝 เพิ่มนักศึกษา (Enroll)
          </button>

          <button
            onClick={() => onViewEnrollments(s.section_id)}
            className="w-full px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium transition"
          >
            👥 ดูรายชื่อนักศึกษา
          </button>
        </div>
      </div>
    </div>
  );
};
