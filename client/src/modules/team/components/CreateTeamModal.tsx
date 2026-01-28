"use client";

import React, { useState } from "react";
import { X, Users } from "lucide-react";
import Button from "@/shared/components/Button";

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: CreateTeamFormData) => void;
  isLoading: boolean;
}

export interface CreateTeamFormData {
  name: string;
  semester: string;
  topicThai: string;
  description: string;
}

export const CreateTeamModal = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: CreateTeamModalProps) => {
  const [formData, setFormData] = useState<CreateTeamFormData>({
    name: "",
    semester: "1/2568",
    topicThai: "",
    description: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Users className="text-blue-500" size={24} /> สร้างกลุ่มโครงงานใหม่
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              ชื่อกลุ่ม
            </label>
            <input
              required
              name="name"
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
              placeholder="เช่น Smart Agriculture Team"
              onChange={handleChange}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              ภาคเรียน
            </label>
            <select
              name="semester"
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border-none rounded-xl text-sm outline-none dark:text-white cursor-pointer"
              onChange={handleChange}
            >
              <option value="1/2568">1/2568</option>
              <option value="2/2567">2/2567</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              หัวข้อโครงงาน (ภาษาไทย)
            </label>
            <input
              name="topicThai"
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border-none rounded-xl text-sm outline-none dark:text-white"
              placeholder="ระบุชื่อหัวข้อเบื้องต้น"
              onChange={handleChange}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1">
              คำอธิบายโปรเจกต์โดยย่อ
            </label>
            <textarea
              name="description"
              rows={3}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border-none rounded-xl text-sm outline-none dark:text-white resize-none"
              placeholder="อธิบายสิ่งที่คุณต้องการทำเบื้องต้น..."
              onChange={handleChange}
            />
          </div>

          <div className="pt-4 flex gap-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={onClose}
              type="button"
            >
              ยกเลิก
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "กำลังสร้างกลุ่ม..." : "สร้างกลุ่ม"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
