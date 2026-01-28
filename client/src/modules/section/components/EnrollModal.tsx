"use client";

import React from "react";
import { Candidate } from "../services/sectionService";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  candidates: Candidate[];
  selectedCandidates: string[];
  sectionId: number | null;
  onToggle: (userId: string) => void;
  onToggleAll: () => void;
  onEnroll: () => void;
}

export const EnrollModal: React.FC<Props> = ({
  isOpen,
  onClose,
  candidates,
  selectedCandidates,
  sectionId,
  onToggle,
  onToggleAll,
  onEnroll,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col">
        <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
          เพิ่มนักศึกษาเข้าหมู่เรียน
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Section {sectionId}
        </p>

        {candidates.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 text-lg mb-2">
              ไม่มีนักศึกษาที่สามารถเพิ่มได้
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              นักศึกษาทั้งหมดได้ลงทะเบียนแล้ว
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm font-semibold text-blue-900 dark:text-blue-300">
                เลือกแล้ว: {selectedCandidates.length} คน
              </p>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900 sticky top-0">
                    <tr>
                      <th className="px-6 py-3 text-center w-16">
                        <input
                          type="checkbox"
                          checked={
                            selectedCandidates.length === candidates.length
                          }
                          onChange={onToggleAll}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        รหัสนักศึกษา
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        ชื่อ - นามสกุล
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        อีเมล
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {candidates.map((c) => (
                      <tr
                        key={c.users_id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition cursor-pointer"
                        onClick={() => onToggle(c.users_id)}
                      >
                        <td className="px-6 py-4 text-center">
                          <input
                            type="checkbox"
                            checked={selectedCandidates.includes(c.users_id)}
                            onChange={() => onToggle(c.users_id)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {c.users_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {c.firstname} {c.lastname}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                          {c.email}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={onEnroll}
                disabled={selectedCandidates.length === 0}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg font-semibold"
              >
                เพิ่ม ({selectedCandidates.length}) คน
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-4 py-3 rounded-lg font-semibold"
              >
                ยกเลิก
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
