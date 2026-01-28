"use client";

// ConfirmModal Component - Confirmation modal for creating team
import React from "react";
import Button from "@/app/(components)/Button";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
  section: any;
}

export const ConfirmModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onConfirm,
  isSubmitting,
  section,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-2xl p-6 border border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          ยืนยันการสร้างกลุ่ม
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          คุณต้องการสร้างกลุ่มสำหรับรายวิชา
          <br />
          <span className="font-semibold text-blue-600 dark:text-blue-400">
            {section?.section_code} - {section?.term?.term_name}
          </span>
          <br />
          ใช่หรือไม่?
        </p>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={onClose}
            disabled={isSubmitting}
          >
            ยกเลิก
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            onClick={onConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? "กำลังสร้าง..." : "ยืนยัน"}
          </Button>
        </div>
      </div>
    </div>
  );
};
