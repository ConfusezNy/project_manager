"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface AdvisorData {
  users_id: string; // API returns string
  titles?: string;
  firstname?: string;
  lastname?: string;
  email: string;
  profilePicture?: string;
  currentProjects: number;
  canSelect: boolean;
  reason?: string;
}

interface AdvisorSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: number;
  onAdvisorSelected: () => void;
}

export default function AdvisorSelectionModal({
  isOpen,
  onClose,
  projectId,
  onAdvisorSelected,
}: AdvisorSelectionModalProps) {
  const [advisors, setAdvisors] = useState<AdvisorData[]>([]);
  const [loading, setLoading] = useState(false);
  const [selecting, setSelecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchAdvisors();
    }
  }, [isOpen]);

  const fetchAdvisors = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/advisors/available");

      if (!response.ok) {
        throw new Error("Failed to fetch advisors");
      }

      const data = await response.json();
      setAdvisors(data);
    } catch (err) {
      setError("ไม่สามารถโหลดรายชื่ออาจารย์ได้");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAdvisor = async (advisorId: string) => {
    try {
      setSelecting(true);
      setError(null);

      const response = await fetch(`/api/projects/${projectId}/advisor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ advisor_id: advisorId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "เกิดข้อผิดพลาด");
      }

      alert("เพิ่มอาจารย์ที่ปรึกษาสำเร็จ");
      onAdvisorSelected();
      onClose();
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาดในการเลือกอาจารย์");
      console.error(err);
    } finally {
      setSelecting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-white">
                เลือกอาจารย์ที่ปรึกษา
              </h2>
              <p className="text-blue-100 mt-1">
                เลือกอาจารย์ที่ปรึกษาสำหรับโครงงานของคุณ
              </p>
            </div>
            <button
              onClick={onClose}
              disabled={selecting}
              className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors disabled:opacity-50"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-8 mt-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 rounded-lg">
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-140px)]">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : advisors.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                ไม่พบรายชื่ออาจารย์
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {advisors.map((advisor) => (
                <div
                  key={advisor.users_id}
                  className={`border-2 rounded-xl p-6 transition-all ${
                    advisor.canSelect
                      ? "border-gray-200 dark:border-gray-700 hover:border-blue-500 hover:shadow-lg"
                      : "border-gray-200 dark:border-gray-700 opacity-60"
                  }`}
                >
                  {/* Profile Picture */}
                  <div className="flex justify-center mb-4">
                    <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-purple-500">
                      {advisor.profilePicture ? (
                        <Image
                          src={advisor.profilePicture}
                          alt={`${advisor.firstname} ${advisor.lastname}`}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white text-3xl font-bold">
                          {advisor.firstname?.charAt(0) || "A"}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Advisor Info */}
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                      {advisor.titles} {advisor.firstname} {advisor.lastname}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {advisor.email}
                    </p>
                  </div>

                  {/* Project Count */}
                  <div className="flex items-center justify-center mb-4">
                    <div
                      className={`px-4 py-2 rounded-lg ${
                        advisor.currentProjects === 0
                          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                          : advisor.currentProjects === 1
                            ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300"
                            : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                      }`}
                    >
                      <span className="font-semibold">
                        โปรเจกต์: {advisor.currentProjects}/2
                      </span>
                    </div>
                  </div>

                  {/* Select Button or Reason */}
                  {advisor.canSelect ? (
                    <button
                      onClick={() => handleSelectAdvisor(advisor.users_id)}
                      disabled={selecting}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {selecting ? "กำลังเลือก..." : "เลือกอาจารย์ท่านนี้"}
                    </button>
                  ) : (
                    <div className="w-full py-3 text-center text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      {advisor.reason || "ไม่สามารถเลือกได้"}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
