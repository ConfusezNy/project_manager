"use client";

import React, { useState, useMemo } from "react";
import { Section } from "../services/sectionService";
import { Lock, Unlock, Loader2 } from "lucide-react";

interface Props {
  sections: Section[];
  onEnroll: (sectionId: number) => void;
  onViewEnrollments: (sectionId: number) => void;
  onContinue: (sectionId: number) => void;
  onDelete: (sectionId: number) => void;
  onToggleLock: (sectionId: number, locked: boolean) => Promise<void>;
}

interface GroupedSection {
  sectionCode: string;
  studyType: string;
  sections: Section[];
  preProject: Section | null;
  project: Section | null;
}

export const SectionAccordion: React.FC<Props> = ({
  sections,
  onEnroll,
  onViewEnrollments,
  onContinue,
  onDelete,
  onToggleLock,
}) => {
  // Track which accordions are open
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());
  // Track lock toggle state per section
  const [lockStates, setLockStates] = useState<Record<number, boolean>>({});
  const [togglingLock, setTogglingLock] = useState<number | null>(null);

  // Group sections by section_code + study_type
  const groupedSections = useMemo(() => {
    const groups: Map<string, GroupedSection> = new Map();

    sections.forEach((s) => {
      const key = `${s.section_code}-${s.study_type}`;

      if (!groups.has(key)) {
        groups.set(key, {
          sectionCode: s.section_code,
          studyType: s.study_type,
          sections: [],
          preProject: null,
          project: null,
        });
      }

      const group = groups.get(key)!;
      group.sections.push(s);

      if (s.course_type === "PRE_PROJECT") {
        group.preProject = s;
      } else if (s.course_type === "PROJECT") {
        group.project = s;
      }
    });

    // Sort sections within each group by term
    groups.forEach((group) => {
      group.sections.sort(
        (a, b) => (a.term?.term_id || 0) - (b.term?.term_id || 0),
      );
    });

    return Array.from(groups.values());
  }, [sections]);

  const toggleGroup = (key: string) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  // Open all by default on first render
  React.useEffect(() => {
    if (groupedSections.length > 0 && openGroups.size === 0) {
      setOpenGroups(
        new Set(groupedSections.map((g) => `${g.sectionCode}-${g.studyType}`)),
      );
    }
  }, [groupedSections]);

  // Initialize lock states from sections
  React.useEffect(() => {
    const initialStates: Record<number, boolean> = {};
    sections.forEach((s) => {
      initialStates[s.section_id] = s.team_locked;
    });
    setLockStates(initialStates);
  }, [sections]);

  const handleToggleLock = async (sectionId: number) => {
    const currentState = lockStates[sectionId] ?? false;
    setTogglingLock(sectionId);
    try {
      await onToggleLock(sectionId, !currentState);
      setLockStates((prev) => ({ ...prev, [sectionId]: !currentState }));
    } catch (err) {
      console.error("Toggle lock failed:", err);
    } finally {
      setTogglingLock(null);
    }
  };

  const getTotalTeams = (group: GroupedSection) => {
    // This would need API data, for now show section count
    return group.sections.length;
  };

  const getTermDisplay = (s: Section) => {
    if (s.term) {
      const year = s.term.academicYear || s.term.term_id;
      const semester = s.term.semester;
      if (semester !== undefined) {
        return `${semester}/${year}`;
      }
      return `Term ${s.term.term_id}`;
    }
    return "ไม่ระบุ";
  };

  return (
    <div className="space-y-4">
      {groupedSections.map((group) => {
        const key = `${group.sectionCode}-${group.studyType}`;
        const isOpen = openGroups.has(key);

        return (
          <div
            key={key}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            {/* Accordion Header */}
            <button
              onClick={() => toggleGroup(key)}
              className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 transition-all"
            >
              <div className="flex items-center gap-4">
                <span
                  className={`text-white transition-transform duration-200 ${isOpen ? "rotate-90" : ""
                    }`}
                >
                  ▶
                </span>
                <div className="text-left">
                  <h3 className="text-xl font-bold text-white">
                    {group.sectionCode}
                  </h3>
                  <span className="text-blue-100 text-sm">
                    {group.studyType === "LE" ? "เทียบโอน" : "ปกติ"}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-white text-sm">
                  {group.sections.length} เทอม
                </span>
              </div>
            </button>

            {/* Accordion Content */}
            {isOpen && (
              <div className="p-6">
                <div className="flex flex-col gap-4">
                  {group.sections.map((s, idx) => (
                    <div key={s.section_id} className="relative">
                      {/* Connection line for "ต่อวิชา" between Pre-Project and Project */}
                      {idx > 0 && (
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                          {group.sections[idx - 1]?.course_type ===
                            "PRE_PROJECT" &&
                            s.course_type === "PROJECT" && (
                              <div className="flex flex-col items-center">
                                <div className="w-px h-2 bg-green-400"></div>
                                <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium rounded-full border border-green-300 dark:border-green-700">
                                  ต่อวิชา
                                </span>
                                <div className="w-px h-2 bg-green-400"></div>
                              </div>
                            )}
                        </div>
                      )}

                      {/* Section Card */}
                      <div
                        className={`border rounded-lg p-4 ${s.course_type === "PRE_PROJECT"
                          ? "border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/10"
                          : "border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/10"
                          }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium ${s.course_type === "PRE_PROJECT"
                                ? "bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200"
                                : "bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200"
                                }`}
                            >
                              {s.course_type === "PROJECT"
                                ? "Project"
                                : "Pre Project"}
                            </span>
                            <span className="text-gray-600 dark:text-gray-400 text-sm">
                              Term {getTermDisplay(s)}
                            </span>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2">
                            {s.course_type === "PRE_PROJECT" && (
                              <button
                                onClick={() => onContinue(s.section_id)}
                                className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition flex items-center gap-1"
                              >
                                <span>ต่อวิชา</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Team Lock Toggle */}
                        <div className="flex items-center justify-between py-2 px-3 mb-3 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                          <div className="flex items-center gap-2">
                            {lockStates[s.section_id] ? (
                              <Lock className="text-red-500" size={16} />
                            ) : (
                              <Unlock className="text-green-500" size={16} />
                            )}
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              ล็อคจัดการทีม
                            </span>
                          </div>
                          <button
                            onClick={() => handleToggleLock(s.section_id)}
                            disabled={togglingLock === s.section_id}
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${lockStates[s.section_id]
                              ? "bg-red-500"
                              : "bg-gray-300 dark:bg-gray-600"
                              }`}
                          >
                            {togglingLock === s.section_id ? (
                              <Loader2 className="absolute left-1/2 -translate-x-1/2 w-3 h-3 animate-spin text-white" />
                            ) : (
                              <span
                                className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${lockStates[s.section_id]
                                  ? "translate-x-5"
                                  : "translate-x-1"
                                  }`}
                              />
                            )}
                          </button>
                        </div>

                        <div className="mb-3 text-sm">
                          <span className="text-gray-500 dark:text-gray-400">
                            ขนาดทีม:
                          </span>{" "}
                          <span className="font-medium text-gray-900 dark:text-white">
                            {s.min_team_size}-{s.max_team_size} คน
                          </span>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => onEnroll(s.section_id)}
                            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition"
                          >
                            เพิ่มนักศึกษา
                          </button>
                          <button
                            onClick={() => onViewEnrollments(s.section_id)}
                            className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium text-sm transition"
                          >
                            ดูรายชื่อ
                          </button>
                          <button
                            onClick={() => onDelete(s.section_id)}
                            className="px-4 py-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-lg font-medium text-sm transition"
                            title="ลบ Section"
                          >
                            ลบ
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {groupedSections.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          ยังไม่มีหมู่เรียน กดปุ่ม "+ สร้างหมู่เรียน" เพื่อเริ่มต้น
        </div>
      )}
    </div>
  );
};
