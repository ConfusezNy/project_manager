"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, X, CheckCircle2 } from "lucide-react";
import { Candidate, sectionService } from "../services/sectionService";

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
  // onToggleAll is handled internally now (supports both candidates & search results)
  onEnroll,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Candidate[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
      setSearchResults([]);
    }
  }, [isOpen]);

  // Debounced search — ค้นหานักศึกษาทุกคนที่ยังไม่ enroll ใน section นี้
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const results = await sectionService.searchStudents(sectionId!, searchQuery);
        setSearchResults(results);
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 400);
  }, [searchQuery, sectionId]);

  if (!isOpen) return null;

  // ถ้ามี searchQuery → แสดง searchResults (ค้นหาทุกคน)
  // ถ้าไม่มี → แสดง candidates (pattern match of section_code)
  const isSearching = searchQuery.trim().length >= 2;
  const activeList = isSearching ? searchResults : candidates;

  // Select All ทำงานกับ activeList
  const allSelected =
    activeList.length > 0 &&
    activeList.every((c) => selectedCandidates.includes(c.users_id));

  const handleToggleAll = () => {
    if (allSelected) {
      // deselect all in activeList
      activeList.forEach((c) => {
        if (selectedCandidates.includes(c.users_id)) onToggle(c.users_id);
      });
    } else {
      // select all in activeList
      activeList.forEach((c) => {
        if (!selectedCandidates.includes(c.users_id)) onToggle(c.users_id);
      });
    }
  };

  const renderTable = (list: Candidate[]) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-900 sticky top-0 z-10">
          <tr>
            <th className="px-4 py-3 text-center w-12">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={handleToggleAll}
                className="w-4 h-4 text-blue-600 rounded"
              />
            </th>
            <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase">รหัสนักศึกษา</th>
            <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase">ชื่อ - นามสกุล</th>
            <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase">อีเมล</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {list.map((c) => {
            const isSelected = selectedCandidates.includes(c.users_id);
            return (
              <tr
                key={c.users_id}
                className={`transition cursor-pointer ${isSelected
                  ? "bg-blue-50 dark:bg-blue-900/20"
                  : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  }`}
                onClick={() => onToggle(c.users_id)}
              >
                <td className="px-4 py-3 text-center">
                  {isSelected ? (
                    <CheckCircle2 className="w-4 h-4 text-blue-600 mx-auto" />
                  ) : (
                    <input
                      type="checkbox"
                      checked={false}
                      onChange={() => onToggle(c.users_id)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                  )}
                </td>
                <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-white">{c.users_id}</td>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{c.firstname} {c.lastname}</td>
                <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{c.email || "—"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {list.length === 0 && (
        <div className="py-10 text-center text-gray-400 dark:text-gray-500 text-sm">
          {isSearching && !searchLoading
            ? "ไม่พบนักศึกษาที่ตรงกับคำค้นหา"
            : isSearching
              ? "กำลังค้นหา..."
              : "ไม่มีนักศึกษาที่สามารถเพิ่มได้"}
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-gray-200 dark:border-gray-700">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">เพิ่มนักศึกษาเข้าหมู่เรียน</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {isSearching
                ? <>ผลการค้นหา <span className="font-semibold text-blue-600">{activeList.length}</span> คน · เลือกแล้ว <span className="font-semibold text-blue-600">{selectedCandidates.length}</span> คน</>
                : <>นักศึกษาที่ตรงกับหมู่เรียน <span className="font-semibold text-blue-600">{candidates.length}</span> คน · เลือกแล้ว <span className="font-semibold text-blue-600">{selectedCandidates.length}</span> คน</>
              }
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-6 pt-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="ค้นหาด้วยรหัสนักศึกษา หรือชื่อ-นามสกุล..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-10 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
            />
            {searchLoading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            )}
            {searchQuery && !searchLoading && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {isSearching && (
            <p className="text-xs text-blue-500 mt-1.5 ml-1">
              🔍 ค้นหาจากนักศึกษาทั้งหมดที่ยังไม่อยู่ในหมู่เรียนนี้
            </p>
          )}
          {!isSearching && candidates.length > 0 && (
            <p className="text-xs text-gray-400 mt-1.5 ml-1">
              แสดงนักศึกษาที่ตรงกับรหัสหมู่เรียน · พิมพ์เพื่อค้นหานักศึกษาคนอื่น
            </p>
          )}
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto px-6 pb-2">
          {renderTable(activeList)}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onEnroll}
            disabled={selectedCandidates.length === 0}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-lg font-semibold transition text-sm"
          >
            เพิ่ม {selectedCandidates.length > 0 ? `(${selectedCandidates.length})` : ""} คน เข้าหมู่เรียน
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-white font-semibold transition text-sm"
          >
            ยกเลิก
          </button>
        </div>
      </div>
    </div>
  );
};
