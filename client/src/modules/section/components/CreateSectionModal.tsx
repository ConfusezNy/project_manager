"use client";

import React from "react";
import { CreateSectionForm, Term } from "../services/sectionService";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  form: CreateSectionForm;
  setForm: (form: CreateSectionForm) => void;
  error: string;
  terms: Term[];
  onSubmit: (e: React.FormEvent) => void;
}

export const CreateSectionModal: React.FC<Props> = ({
  isOpen,
  onClose,
  form,
  setForm,
  error,
  terms,
  onSubmit,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <form
        onSubmit={onSubmit}
        className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700"
      >
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          สร้างหมู่เรียนใหม่
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              รหัสหมู่เรียน
            </label>
            <input
              className="border border-gray-300 dark:border-gray-600 p-3 w-full rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              placeholder="เช่น 66346CPE รูปแบบนี้เท่านั้น"
              value={form.section_code}
              onChange={(e) =>
                setForm({ ...form, section_code: e.target.value })
              }
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              ประเภทรายวิชา
            </label>
            <select
              className="border border-gray-300 dark:border-gray-600 p-3 w-full rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              value={form.course_type}
              onChange={(e) =>
                setForm({ ...form, course_type: e.target.value })
              }
            >
              <option value="PROJECT">Project</option>
              <option value="PRE_PROJECT">Pre Project</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              ประเภทการศึกษา
            </label>
            <select
              className="border border-gray-300 dark:border-gray-600 p-3 w-full rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              value={form.study_type}
              onChange={(e) => setForm({ ...form, study_type: e.target.value })}
            >
              <option value="LE">เทียบโอน (LE)</option>
              <option value="REG">ปกติ (REG)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                ขนาดทีมขั้นต่ำ
              </label>
              <input
                type="number"
                min="1"
                className="border border-gray-300 dark:border-gray-600 p-3 w-full rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                value={form.min_team_size}
                onChange={(e) =>
                  setForm({ ...form, min_team_size: Number(e.target.value) })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                ขนาดทีมสูงสุด
              </label>
              <input
                type="number"
                min="1"
                className="border border-gray-300 dark:border-gray-600 p-3 w-full rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                value={form.max_team_size}
                onChange={(e) =>
                  setForm({ ...form, max_team_size: Number(e.target.value) })
                }
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              ล็อคการจัดการทีม
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  setForm({ ...form, team_locked: !form.team_locked })
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.team_locked
                  ? "bg-red-500"
                  : "bg-gray-300 dark:bg-gray-600"
                  }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.team_locked ? "translate-x-6" : "translate-x-1"
                    }`}
                />
              </button>
              <span
                className={`text-sm ${form.team_locked ? "text-red-500 font-medium" : "text-gray-500 dark:text-gray-400"}`}
              >
                {form.team_locked
                  ? "ล็อค (นศ. ไม่สามารถจัดการสมาชิกได้)"
                  : "ปลดล็อค (นศ. จัดการสมาชิกได้)"}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              เทอม <span className="text-red-500">*</span>
            </label>
            <select
              className="border border-gray-300 dark:border-gray-600 p-3 w-full rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              value={form.term_id}
              onChange={(e) => setForm({ ...form, term_id: e.target.value })}
              required
            >
              <option value="">-- เลือกเทอม --</option>
              {terms.map((t) => (
                <option key={t.term_id} value={t.term_id}>
                  {t.semester}/{t.academicYear}
                </option>
              ))}
            </select>
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
            สร้างหมู่เรียน
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
