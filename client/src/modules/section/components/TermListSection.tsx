"use client";

import React, { useState } from "react";
import { Term } from "../services/sectionService";

interface Props {
  terms: Term[];
  onDelete: (termId: number) => Promise<void>;
  onCreateNew: () => void;
}

export const TermListSection: React.FC<Props> = ({
  terms,
  onDelete,
  onCreateNew,
}) => {
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (term: Term) => {
    const sectionCount = term._count?.Section ?? 0;
    if (sectionCount > 0) return; // ปุ่ม disabled อยู่แล้ว แต่ guard เพิ่ม

    if (
      !confirm(
        `ลบเทอม ${term.semester}/${term.academicYear}? การลบไม่สามารถกู้คืนได้`,
      )
    )
      return;

    setDeletingId(term.term_id);
    try {
      await onDelete(term.term_id);
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📅</span>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              เทอมการศึกษา
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {terms.length} เทอม
            </p>
          </div>
        </div>
        <button
          onClick={onCreateNew}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg font-medium shadow-sm transition"
        >
          + สร้างเทอม
        </button>
      </div>

      {/* Term List */}
      {terms.length === 0 ? (
        <div className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
          <p className="text-4xl mb-3">📭</p>
          <p className="font-medium">ยังไม่มีเทอมการศึกษา</p>
          <p className="text-sm mt-1">กดปุ่ม + สร้างเทอม ด้านบนเพื่อเริ่มต้น</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {terms.map((term) => {
            const sectionCount = term._count?.Section ?? 0;
            const canDelete = sectionCount === 0;
            const isDeleting = deletingId === term.term_id;

            return (
              <div
                key={term.term_id}
                className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition"
              >
                {/* Term info */}
                <div className="flex items-center gap-4">
                  {/* Badge ภาค/ปี */}
                  <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex flex-col items-center justify-center">
                    <span className="text-lg font-bold text-indigo-700 dark:text-indigo-300">
                      {term.semester}
                    </span>
                    <span className="text-xs text-indigo-500 dark:text-indigo-400">
                      /{String(term.academicYear).slice(-2)}
                    </span>
                  </div>

                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      ภาคเรียนที่ {term.semester} ปีการศึกษา {term.academicYear}
                    </p>
                    <div className="flex items-center gap-4 mt-0.5">
                      {term.startDate && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(term.startDate)} – {formatDate(term.endDate)}
                        </p>
                      )}
                      {/* Section count badge */}
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          sectionCount > 0
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
                            : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {sectionCount > 0
                          ? `${sectionCount} หมู่เรียน`
                          : "ยังไม่มีหมู่เรียน"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Delete button */}
                <div className="relative group">
                  <button
                    onClick={() => handleDelete(term)}
                    disabled={!canDelete || isDeleting}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                      canDelete
                        ? "bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/20 dark:hover:bg-red-900/40 dark:text-red-400"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500"
                    }`}
                  >
                    {isDeleting ? "กำลังลบ..." : "ลบ"}
                  </button>

                  {/* Tooltip เมื่อ disabled */}
                  {!canDelete && (
                    <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block z-10">
                      <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                        มีหมู่เรียน {sectionCount} หมู่อ้างอิงอยู่
                        <br />
                        ลบหมู่เรียนก่อนจึงจะลบเทอมได้
                        <div className="absolute right-3 top-full border-4 border-transparent border-t-gray-900" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
