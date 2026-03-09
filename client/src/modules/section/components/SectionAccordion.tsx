"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Section, Term } from "../services/sectionService";
import { Lock, Unlock, Loader2, ChevronDown, Trash2, Plus } from "lucide-react";

interface Props {
  sections: Section[];
  terms: Term[];
  filterQuery: string;
  filterAcademicYear: string;
  filterLockStatus: "all" | "locked" | "unlocked";
  onEnroll: (sectionId: number) => void;
  onViewEnrollments: (sectionId: number) => void;
  onContinue: (sectionId: number) => void;
  onDelete: (sectionId: number) => void;
  onToggleLock: (sectionId: number, locked: boolean) => Promise<void>;
  onDeleteTerm: (termId: number) => Promise<void>;
  onCreateSectionInTerm: (termId: number) => void;
}

interface SectionGroup {
  sectionCode: string;
  studyType: string;
  sections: Section[];
}

export const SectionAccordion: React.FC<Props> = ({
  sections,
  terms,
  filterQuery,
  filterAcademicYear,
  filterLockStatus,
  onEnroll,
  onViewEnrollments,
  onContinue,
  onDelete,
  onToggleLock,
  onDeleteTerm,
  onCreateSectionInTerm,
}) => {
  const [openTerms, setOpenTerms] = useState<Set<number>>(new Set());
  const [lockStates, setLockStates] = useState<Record<number, boolean>>({});
  const [togglingLock, setTogglingLock] = useState<number | null>(null);
  const [deletingTermId, setDeletingTermId] = useState<number | null>(null);

  // Init lock states from sections
  useEffect(() => {
    const init: Record<number, boolean> = {};
    sections.forEach((s) => (init[s.section_id] = s.team_locked));
    setLockStates(init);
  }, [sections]);

  const getTermDisplay = (term: Term) =>
    `${term.semester}/${term.academicYear}`;

  // Filter and build per-term section groups
  const filteredTermData = useMemo(() => {
    return terms
      .map((term) => {
        let termSections = sections.filter(
          (s) => s.term?.term_id === term.term_id,
        );

        // section code search
        if (filterQuery.trim()) {
          termSections = termSections.filter((s) =>
            s.section_code.toLowerCase().includes(filterQuery.toLowerCase()),
          );
        }

        // lock status filter
        if (filterLockStatus === "locked") {
          termSections = termSections.filter((s) => s.team_locked);
        } else if (filterLockStatus === "unlocked") {
          termSections = termSections.filter((s) => !s.team_locked);
        }

        // group by section_code within the term
        const groupMap = new Map<string, SectionGroup>();
        termSections.forEach((s) => {
          const key = `${s.section_code}-${s.study_type}`;
          if (!groupMap.has(key)) {
            groupMap.set(key, {
              sectionCode: s.section_code,
              studyType: s.study_type,
              sections: [],
            });
          }
          groupMap.get(key)!.sections.push(s);
        });

        // Sort sections inside each group
        groupMap.forEach((g) =>
          g.sections.sort(
            (a, b) => (a.term?.term_id ?? 0) - (b.term?.term_id ?? 0),
          ),
        );

        return {
          term,
          sectionGroups: Array.from(groupMap.values()),
          totalSectionsInTerm: sections.filter(
            (s) => s.term?.term_id === term.term_id,
          ).length,
        };
      })
      .filter((td) => {
        // year filter
        if (filterAcademicYear && td.term.academicYear !== filterAcademicYear)
          return false;
        // hide term if no sections match current filter
        if (filterQuery || filterLockStatus !== "all") {
          return td.sectionGroups.length > 0;
        }
        return true;
      });
  }, [terms, sections, filterQuery, filterAcademicYear, filterLockStatus]);

  // Auto-expand when filter is active
  useEffect(() => {
    const hasFilter =
      filterQuery || filterAcademicYear || filterLockStatus !== "all";
    if (hasFilter) {
      setOpenTerms(new Set(filteredTermData.map((td) => td.term.term_id)));
    }
  }, [filteredTermData, filterQuery, filterAcademicYear, filterLockStatus]);

  // Default: open all terms on first load
  useEffect(() => {
    if (filteredTermData.length > 0 && openTerms.size === 0) {
      setOpenTerms(new Set(filteredTermData.map((td) => td.term.term_id)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredTermData.length]);

  const toggleTerm = (termId: number) => {
    setOpenTerms((prev) => {
      const next = new Set(prev);
      next.has(termId) ? next.delete(termId) : next.add(termId);
      return next;
    });
  };

  const handleToggleLock = async (sectionId: number) => {
    const current = lockStates[sectionId] ?? false;
    setTogglingLock(sectionId);
    try {
      await onToggleLock(sectionId, !current);
      setLockStates((prev) => ({ ...prev, [sectionId]: !current }));
    } catch {
      console.error("Toggle lock failed");
    } finally {
      setTogglingLock(null);
    }
  };

  const handleDeleteTerm = async (term: Term) => {
    const count = term._count?.Section ?? 0;
    if (count > 0) return;
    if (
      !confirm(
        `ลบเทอม ${getTermDisplay(term)}? ไม่สามารถกู้คืนได้`,
      )
    )
      return;
    setDeletingTermId(term.term_id);
    try {
      await onDeleteTerm(term.term_id);
    } finally {
      setDeletingTermId(null);
    }
  };

  if (filteredTermData.length === 0) {
    const hasFilter =
      filterQuery || filterAcademicYear || filterLockStatus !== "all";
    return (
      <div className="text-center py-16 text-gray-500 dark:text-gray-400">
        {hasFilter ? (
          <>
            <p className="text-4xl mb-3">🔍</p>
            <p className="font-medium">ไม่พบหมู่เรียนที่ตรงกับตัวกรอง</p>
            <p className="text-sm mt-1">ลองเปลี่ยนคำค้นหาหรือล้างตัวกรอง</p>
          </>
        ) : (
          <>
            <p className="text-4xl mb-3">📭</p>
            <p className="font-medium">ยังไม่มีหมู่เรียน</p>
            <p className="text-sm mt-1">สร้างเทอมก่อน แล้วค่อยสร้างหมู่เรียน</p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filteredTermData.map(({ term, sectionGroups, totalSectionsInTerm }) => {
        const isOpen = openTerms.has(term.term_id);
        const canDeleteTerm = (term._count?.Section ?? 0) === 0;
        const isDeleting = deletingTermId === term.term_id;

        return (
          <div
            key={term.term_id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            {/* ── Term Accordion Header ── */}
            <div className="flex items-center bg-gradient-to-r from-blue-600 to-indigo-700">
              {/* Clickable expand area */}
              <button
                onClick={() => toggleTerm(term.term_id)}
                className="flex-1 flex items-center gap-3 px-5 py-4 text-left hover:from-blue-700 hover:to-indigo-800 transition-all"
              >
                <ChevronDown
                  size={20}
                  className={`text-white transition-transform duration-200 flex-shrink-0 ${isOpen ? "" : "-rotate-90"}`}
                />
                <div>
                  <p className="text-lg font-bold text-white">
                    Term {getTermDisplay(term)}
                  </p>
                  <p className="text-blue-100 text-xs">
                    {totalSectionsInTerm} หมู่เรียน
                    {filterQuery || filterLockStatus !== "all"
                      ? ` · แสดง ${sectionGroups.reduce((acc, g) => acc + g.sections.length, 0)} ที่ตรงกัน`
                      : ""}
                  </p>
                </div>
              </button>

              {/* Action buttons in header */}
              <div className="flex items-center gap-2 px-4">
                {/* + Create Section in this Term */}
                <button
                  onClick={() => onCreateSectionInTerm(term.term_id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white text-sm font-medium rounded-lg transition"
                  title="สร้างหมู่เรียนในเทอมนี้"
                >
                  <Plus size={14} />
                  <span className="hidden sm:inline">สร้างหมู่เรียน</span>
                </button>

                {/* Delete Term */}
                <div className="relative group">
                  <button
                    onClick={() => handleDeleteTerm(term)}
                    disabled={!canDeleteTerm || isDeleting}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-sm transition ${
                      canDeleteTerm
                        ? "bg-white/10 hover:bg-red-500/60 text-white"
                        : "bg-white/5 text-white/40 cursor-not-allowed"
                    }`}
                    title={canDeleteTerm ? "ลบเทอม" : "มีหมู่เรียนอยู่ ลบไม่ได้"}
                  >
                    {isDeleting ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Trash2 size={14} />
                    )}
                  </button>
                  {!canDeleteTerm && (
                    <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block z-20 pointer-events-none">
                      <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-xl">
                        มีหมู่เรียน {term._count?.Section} หมู่อยู่
                        <br />
                        ลบหมู่เรียนก่อนจึงจะลบเทอมได้
                        <div className="absolute right-3 top-full border-4 border-transparent border-t-gray-900" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── Accordion Body ── */}
            {isOpen && (
              <div className="p-5 space-y-4">
                {sectionGroups.length === 0 ? (
                  <div className="text-center py-6 text-gray-400 dark:text-gray-500 text-sm">
                    ไม่มีหมู่เรียนในเทอมนี้ที่ตรงกับตัวกรอง
                  </div>
                ) : (
                  sectionGroups.map((group) => (
                    <div key={`${group.sectionCode}-${group.studyType}`}>
                      {/* Section Group Label */}
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2 px-1">
                        {group.sectionCode} ·{" "}
                        {group.studyType === "LE" ? "เทียบโอน" : "ปกติ"}
                      </p>

                      <div className="space-y-2">
                        {group.sections.map((s) => (
                          <div
                            key={s.section_id}
                            className={`border rounded-xl p-4 ${
                              s.course_type === "PRE_PROJECT"
                                ? "border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/10"
                                : "border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/10"
                            }`}
                          >
                            {/* Section header row */}
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                    s.course_type === "PRE_PROJECT"
                                      ? "bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200"
                                      : "bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200"
                                  }`}
                                >
                                  {s.course_type === "PROJECT"
                                    ? "Project"
                                    : "Pre Project"}
                                </span>

                                {/* ต่อวิชา badge */}
                                {s.course_type === "PRE_PROJECT" && (
                                  <button
                                    onClick={() => onContinue(s.section_id)}
                                    className="px-2.5 py-0.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-full transition"
                                  >
                                    ต่อวิชา →
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Lock toggle */}
                            <div className="flex items-center justify-between py-2 px-3 mb-3 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                              <div className="flex items-center gap-2">
                                {lockStates[s.section_id] ? (
                                  <Lock className="text-red-500" size={14} />
                                ) : (
                                  <Unlock className="text-green-500" size={14} />
                                )}
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  ล็อคจัดการทีม
                                </span>
                              </div>
                              <button
                                onClick={() => handleToggleLock(s.section_id)}
                                disabled={togglingLock === s.section_id}
                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                                  lockStates[s.section_id]
                                    ? "bg-red-500"
                                    : "bg-gray-300 dark:bg-gray-600"
                                }`}
                              >
                                {togglingLock === s.section_id ? (
                                  <Loader2 className="absolute left-1/2 -translate-x-1/2 w-3 h-3 animate-spin text-white" />
                                ) : (
                                  <span
                                    className={`inline-block h-3 w-3 rounded-full bg-white transition-transform ${
                                      lockStates[s.section_id]
                                        ? "translate-x-5"
                                        : "translate-x-1"
                                    }`}
                                  />
                                )}
                              </button>
                            </div>

                            {/* Team size */}
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                              ขนาดทีม:{" "}
                              <span className="font-semibold text-gray-900 dark:text-white">
                                {s.min_team_size}–{s.max_team_size} คน
                              </span>
                            </p>

                            {/* Action buttons */}
                            <div className="flex gap-2">
                              <button
                                onClick={() => onEnroll(s.section_id)}
                                className="flex-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition"
                              >
                                เพิ่มนักศึกษา
                              </button>
                              <button
                                onClick={() =>
                                  onViewEnrollments(s.section_id)
                                }
                                className="flex-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg text-sm font-medium transition"
                              >
                                ดูรายชื่อ
                              </button>
                              <button
                                onClick={() => onDelete(s.section_id)}
                                className="px-3 py-1.5 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium transition"
                                title="ลบหมู่เรียน"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
