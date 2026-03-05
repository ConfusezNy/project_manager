"use client";

// SubmitModal - Modal for students to submit work (with real file upload)
import React, { useState, useRef } from "react";
import { X, Upload, FileText, AlertCircle, File, Trash2 } from "lucide-react";
import { getToken } from "@/lib/auth-context";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface SubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (file?: string) => Promise<void>;
  eventName: string;
  isLoading?: boolean;
}

export const SubmitModal: React.FC<SubmitModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  eventName,
  isLoading = false,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        setError("ไฟล์ต้องมีขนาดไม่เกิน 20 MB");
        return;
      }
      setSelectedFile(file);
      setError("");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        setError("ไฟล์ต้องมีขนาดไม่เกิน 20 MB");
        return;
      }
      setSelectedFile(file);
      setError("");
    }
  };

  const handleSubmit = async () => {
    setError("");
    setUploading(true);
    try {
      let fileUrl: string | undefined;

      // อัปโหลดไฟล์ถ้ามี
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);

        const token = getToken();
        const res = await fetch(`${API_URL}/uploads/submission`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || "อัปโหลดไฟล์ไม่สำเร็จ");
        }

        const data = await res.json();
        fileUrl = data.fileUrl;
      }

      await onSubmit(fileUrl);
      setSelectedFile(null);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setUploading(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            ส่งงาน
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X size={20} />
          </button>
        </div>

        {/* Event Name */}
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
            <FileText size={16} />
            <span className="font-medium">{eventName}</span>
          </div>
        </div>

        {/* File Upload Zone */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            อัปโหลดไฟล์ (PDF, Word, Excel, รูปภาพ, ZIP)
          </label>

          {!selectedFile ? (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${dragOver
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                }`}
            >
              <Upload size={32} className="mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                ลากไฟล์มาวางหรือ <span className="text-blue-600 dark:text-blue-400 font-medium">คลิกเพื่อเลือก</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">สูงสุด 20 MB</p>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <File size={20} className="text-green-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-gray-500">{formatSize(selectedFile.size)}</p>
              </div>
              <button
                onClick={() => setSelectedFile(null)}
                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.jpg,.jpeg,.png,.gif,.webp"
            onChange={handleFileSelect}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            * ไม่บังคับ สามารถส่งงานโดยไม่แนบไฟล์ได้
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertCircle size={16} />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={uploading || isLoading}
            className="flex-1 px-4 py-2.5 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSubmit}
            disabled={uploading || isLoading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
          >
            {uploading || isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Upload size={16} />
                ส่งงาน
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubmitModal;
