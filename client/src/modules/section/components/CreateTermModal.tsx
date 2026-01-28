"use client";

import React from "react";
import { CreateTermForm } from "../services/sectionService";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  form: CreateTermForm;
  setForm: (form: CreateTermForm) => void;
  error: string;
  onSubmit: (e: React.FormEvent) => void;
}

export const CreateTermModal: React.FC<Props> = ({
  isOpen,
  onClose,
  form,
  setForm,
  error,
  onSubmit,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <form
        onSubmit={onSubmit}
        className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700"
      >
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          สร้างเทอมการศึกษา
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              ปีการศึกษา
            </label>
            <input
              className="border border-gray-300 dark:border-gray-600 p-3 w-full rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              placeholder="เช่น 2567"
              value={form.academicYear}
              onChange={(e) =>
                setForm({ ...form, academicYear: e.target.value })
              }
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              ภาคเรียน
            </label>
            <input
              className="border border-gray-300 dark:border-gray-600 p-3 w-full rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              placeholder="เช่น 1 หรือ 2"
              value={form.semester}
              onChange={(e) => setForm({ ...form, semester: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              วันเริ่มต้น
            </label>
            <input
              type="date"
              className="border border-gray-300 dark:border-gray-600 p-3 w-full rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              วันสิ้นสุด
            </label>
            <input
              type="date"
              className="border border-gray-300 dark:border-gray-600 p-3 w-full rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              required
            />
          </div>
        </div>

        {error && (
          <div className="text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg mt-4 text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <button
            type="submit"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-semibold"
          >
            สร้างเทอม
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-4 py-3 rounded-lg font-semibold"
          >
            ยกเลิก
          </button>
        </div>
      </form>
    </div>
  );
};
