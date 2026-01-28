"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import Button from "@/shared/components/Button";

interface ProjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProjectFormData) => void;
  initialData?: ProjectFormData | null;
  isSubmitting?: boolean;
}

export interface ProjectFormData {
  projectname: string;
  projectnameEng: string;
  project_type: string;
  description: string;
}

const PROJECT_TYPES = [
  "Software",
  "AI / Data",
  "Embedded / IoT",
  "Network / Security",
  "Image / Signal",
  "Game / AR-VR",
  "Research",
];

export const ProjectFormModal: React.FC<ProjectFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isSubmitting = false,
}) => {
  const [formData, setFormData] = useState<ProjectFormData>(
    initialData || {
      projectname: "",
      projectnameEng: "",
      project_type: "",
      description: "",
    },
  );

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        projectname: "",
        projectnameEng: "",
        project_type: "",
        description: "",
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {initialData ? "แก้ไขหัวข้อโครงงาน" : "สร้างหัวข้อโครงงาน"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            <X size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              ชื่อโครงงาน (ภาษาไทย) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.projectname}
              onChange={(e) =>
                setFormData({ ...formData, projectname: e.target.value })
              }
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="ระบุชื่อโครงงานภาษาไทย"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              ชื่อโครงงาน (ภาษาอังกฤษ)
            </label>
            <input
              type="text"
              value={formData.projectnameEng}
              onChange={(e) =>
                setFormData({ ...formData, projectnameEng: e.target.value })
              }
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="Project Name in English"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              ประเภทโครงงาน <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.project_type}
              onChange={(e) =>
                setFormData({ ...formData, project_type: e.target.value })
              }
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            >
              <option value="">-- เลือกประเภท --</option>
              {PROJECT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              รายละเอียดโครงงาน
            </label>
            <textarea
              rows={5}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
              placeholder="อธิบายรายละเอียด จุดเด่น และความน่าสนใจของโครงงาน"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              ยกเลิก
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting
                ? "กำลังบันทึก..."
                : initialData
                  ? "บันทึกการแก้ไข"
                  : "สร้างโครงงาน"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
