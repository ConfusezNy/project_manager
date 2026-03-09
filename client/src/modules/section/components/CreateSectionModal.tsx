"use client";

import React, { useState, useRef, useEffect } from "react";
import { CreateSectionForm, Term, StudentGroup, sectionService } from "../services/sectionService";

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
  const [groups, setGroups] = useState<StudentGroup[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  // ปิด dropdown เมื่อคลิกนอก
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowPicker(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleFetchGroups = async () => {
    if (groups.length > 0) {
      setShowPicker((v) => !v);
      return;
    }
    setLoadingGroups(true);
    try {
      const data = await sectionService.getStudentGroups();
      setGroups(data);
      setShowPicker(true);
    } catch {
      // ถ้า load ไม่ได้ก็ยังพิมได้อยู่
    } finally {
      setLoadingGroups(false);
    }
  };

  const handleSelectGroup = (g: StudentGroup) => {
    setForm({ ...form, section_code: g.sectionCode });
    setShowPicker(false);
  };

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
          {/* ─── รหัสหมู่เรียน + ปุ่มดึงจากระบบ ─── */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              รหัสหมู่เรียน{" "}
              <span className="text-xs font-normal text-gray-500 dark:text-gray-400">
                (รูปแบบ 66346CPE เท่านั้น)
              </span>
            </label>

            <div className="relative flex gap-2" ref={pickerRef}>
              <input
                className="border border-gray-300 dark:border-gray-600 p-3 flex-1 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                placeholder="เช่น 66346CPE"
                value={form.section_code}
                onChange={(e) =>
                  setForm({ ...form, section_code: e.target.value })
                }
                required
              />

              {/* ปุ่มดึงจากระบบ */}
              <button
                type="button"
                onClick={handleFetchGroups}
                disabled={loadingGroups}
                title="ดึงรายการกลุ่มนักศึกษาจากระบบ"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/50 transition whitespace-nowrap disabled:opacity-50"
              >
                {loadingGroups ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                )}
                ดึงจากระบบ
              </button>

              {/* Dropdown list */}
              {showPicker && (
                <div className="absolute top-full left-0 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl z-[100] max-h-60 overflow-y-auto">
                  {groups.length === 0 ? (
                    <div className="p-4 text-sm text-gray-500 dark:text-gray-400 text-center">
                      ไม่พบข้อมูลนักศึกษาในระบบ
                    </div>
                  ) : (
                    <>
                      <div className="p-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700 font-medium">
                        กลุ่มนักศึกษาในระบบ — เลือกเพื่อใส่รหัสอัตโนมัติ
                      </div>
                      {groups.map((g) => (
                        <button
                          key={g.sectionCode}
                          type="button"
                          onClick={() => handleSelectGroup(g)}
                          className="w-full text-left px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition flex items-center justify-between gap-4"
                        >
                          <div>
                            <span className="font-mono font-bold text-blue-700 dark:text-blue-300 text-sm">
                              {g.sectionCode}
                            </span>
                            <span className="ml-3 text-xs text-gray-500 dark:text-gray-400">
                              {g.label}
                            </span>
                          </div>
                          <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full shrink-0">
                            {g.studentCount} คน
                          </span>
                        </button>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>

            <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
              รหัสต้องตรงกับรหัสนักศึกษา และต้องมี CPE ต่อท้าย เช่น <span className="font-mono text-blue-600 dark:text-blue-400">66346CPE</span>
            </p>
          </div>

          {/* ─── ประเภทรายวิชา ─── */}
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
              <option value="PRE_PROJECT">Pre Project</option>
              <option value="PROJECT">Project</option>
            </select>
          </div>

          {/* ─── ประเภทการศึกษา ─── */}
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

          {/* ─── ขนาดทีม ─── */}
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

          {/* ─── ล็อคทีม ─── */}
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

          {/* ─── เทอม ─── */}
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
