"use client";

import React, { useState } from "react";
import { X, UserPlus, Users } from "lucide-react";
import Button from "@/shared/components/Button";

export interface AvailableStudent {
  users_id: string;
  firstname: string | null;
  lastname: string | null;
  email: string | null;
}

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableStudents: AvailableStudent[];
  onInvite: (userId: string) => void;
  isLoading: boolean;
}

export const InviteMemberModal = ({
  isOpen,
  onClose,
  availableStudents,
  onInvite,
  isLoading,
}: InviteMemberModalProps) => {
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleInvite = () => {
    if (selectedStudent) {
      onInvite(selectedStudent);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
          <h2 className="text-xl font-bold dark:text-white flex items-center gap-2">
            <UserPlus className="text-emerald-500" size={24} />{" "}
            เชิญสมาชิกเข้ากลุ่ม
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Users size={16} />
            <span>
              นักศึกษาที่ลงทะเบียนในรายวิชานี้และยังไม่มีกลุ่ม (
              {availableStudents.length} คน)
            </span>
          </div>

          {availableStudents.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users size={32} className="text-gray-400" />
              </div>
              <p className="text-gray-500 dark:text-gray-400">
                ไม่มีนักศึกษาที่สามารถเชิญได้
              </p>
              <p className="text-xs text-gray-400 mt-2">
                นักศึกษาทุกคนมีกลุ่มแล้ว
              </p>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto space-y-2">
              {availableStudents.map((student) => (
                <div
                  key={student.users_id}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedStudent === student.users_id
                      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                      : "border-gray-100 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-700"
                  }`}
                  onClick={() => setSelectedStudent(student.users_id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {student.firstname} {student.lastname}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {student.users_id}
                      </p>
                      {student.email && (
                        <p className="text-xs text-gray-400 mt-1">
                          {student.email}
                        </p>
                      )}
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedStudent === student.users_id
                          ? "border-emerald-500 bg-emerald-500"
                          : "border-gray-300 dark:border-gray-600"
                      }`}
                    >
                      {selectedStudent === student.users_id && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={onClose}
              disabled={isLoading}
            >
              ยกเลิก
            </Button>
            <Button
              variant="primary"
              className="flex-1 !bg-emerald-600 hover:!bg-emerald-700"
              onClick={handleInvite}
              disabled={!selectedStudent || isLoading}
            >
              {isLoading ? "กำลังเชิญ..." : "เชิญเข้ากลุ่ม"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
