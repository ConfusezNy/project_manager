"use client";

import React, { useState } from "react";
import { Section } from "../services/sectionService";
import { Lock, Unlock, Loader2 } from "lucide-react";

interface Props {
  section: Section;
  onEnroll: (sectionId: number) => void;
  onViewEnrollments: (sectionId: number) => void;
  onContinue: (sectionId: number) => void;
  onToggleLock: (sectionId: number, locked: boolean) => Promise<void>;
}

export const SectionCard: React.FC<Props> = ({
  section: s,
  onEnroll,
  onViewEnrollments,
  onContinue,
  onToggleLock,
}) => {
  const [toggling, setToggling] = useState(false);
  const [localLocked, setLocalLocked] = useState(s.team_locked);

  const handleToggleLock = async () => {
    setToggling(true);
    try {
      await onToggleLock(s.section_id, !localLocked);
      setLocalLocked(!localLocked);
    } catch (err) {
      console.error("Toggle lock failed:", err);
    } finally {
      setToggling(false);
    }
  };

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
                {s.course_type === "PROJECT" ? "Project" : "Pre Project"}
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
              ต่อวิชา
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

        {/* Team Lock Toggle */}
        <div className="flex items-center justify-between py-2 border-t border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            {localLocked ? (
              <Lock className="text-red-500" size={18} />
            ) : (
              <Unlock className="text-green-500" size={18} />
            )}
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              ล็อคการจัดการทีม
            </span>
          </div>
          <button
            onClick={handleToggleLock}
            disabled={toggling}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${localLocked ? "bg-red-500" : "bg-gray-300 dark:bg-gray-600"
              }`}
          >
            {toggling ? (
              <Loader2 className="absolute left-1/2 -translate-x-1/2 w-4 h-4 animate-spin text-white" />
            ) : (
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${localLocked ? "translate-x-6" : "translate-x-1"
                  }`}
              />
            )}
          </button>
        </div>

        <div className="pt-1 space-y-2">
          <button
            onClick={() => onEnroll(s.section_id)}
            className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-sm transition text-base"
          >
            เพิ่มนักศึกษา (Enroll)
          </button>

          <button
            onClick={() => onViewEnrollments(s.section_id)}
            className="w-full px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium transition"
          >
            ดูรายชื่อนักศึกษา
          </button>
        </div>
      </div>
    </div>
  );
};
