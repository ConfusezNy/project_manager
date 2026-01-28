"use client";

import React from "react";
import { Term } from "../services/sectionService";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  terms: Term[];
  selectedTermId: string;
  setSelectedTermId: (id: string) => void;
  onConfirm: () => void;
}

export const ContinueModal: React.FC<Props> = ({
  isOpen,
  onClose,
  terms,
  selectedTermId,
  setSelectedTermId,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          ต่อวิชา Pre-Project → Project
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          เลือกเทอมใหม่สำหรับ PROJECT
        </p>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            เทอมใหม่
          </label>
          <select
            className="border border-gray-300 dark:border-gray-600 p-3 w-full rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            value={selectedTermId}
            onChange={(e) => setSelectedTermId(e.target.value)}
          >
            <option value="">-- เลือกเทอม --</option>
            {terms.map((t) => (
              <option key={t.term_id} value={t.term_id}>
                {t.semester}/{t.academicYear}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-semibold"
          >
            ยืนยันต่อวิชา
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-4 py-3 rounded-lg font-semibold"
          >
            ยกเลิก
          </button>
        </div>
      </div>
    </div>
  );
};
