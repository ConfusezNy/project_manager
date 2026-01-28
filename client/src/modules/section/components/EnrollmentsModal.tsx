"use client";

import React from "react";
import { Enrollment } from "../services/sectionService";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  enrollments: Enrollment[];
  sectionId: number | null;
}

export const EnrollmentsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  enrollments,
  sectionId,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          รายชื่อนักศึกษา (Section {sectionId})
        </h2>

        <div className="flex-1 overflow-y-auto">
          {enrollments.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 dark:text-gray-500 text-lg mb-2">
                ยังไม่มีนักศึกษาในหมู่เรียนนี้
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                เพิ่มนักศึกษาผ่านปุ่ม "เพิ่มนักศึกษา"
              </p>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      รหัสนักศึกษา
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      ชื่อ - นามสกุล
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      วันที่ลงทะเบียน
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {enrollments.map((e) => (
                    <tr
                      key={e.enrollment_id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {e.user.users_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {e.user.firstname} {e.user.lastname}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {new Date(e.enrolledAt).toLocaleDateString("th-TH", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            className="w-full px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-semibold transition"
            onClick={onClose}
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
};
