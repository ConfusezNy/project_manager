"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, X, Users, UserSearch, CheckCircle2 } from "lucide-react";
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
  onToggleAll,
  onEnroll,
}) => {
  const [tab, setTab] = useState<"pattern" | "search">("pattern");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Candidate[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [filterText, setFilterText] = useState(""); // local filter for pattern tab
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTab("pattern");
      setSearchQuery("");
      setSearchResults([]);
      setFilterText("");
    }
  }, [isOpen]);

  // Debounced search for repeating students tab
  useEffect(() => {
    if (tab !== "search") return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults([]);
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
  }, [searchQuery, tab, sectionId]);

  if (!isOpen) return null;

  // Filter candidates locally by the filter text (pattern tab)
  const filteredCandidates = filterText.trim()
    ? candidates.filter(
      (c) =>
        c.users_id.includes(filterText) ||
        (c.firstname ?? "").toLowerCase().includes(filterText.toLowerCase()) ||
        (c.lastname ?? "").toLowerCase().includes(filterText.toLowerCase()),
    )
    : candidates;

  // Active list based on current tab
  const activeList = tab === "pattern" ? filteredCandidates : searchResults;

  const renderTable = (list: Candidate[]) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-900 sticky top-0 z-10">
          <tr>
            <th className="px-4 py-3 text-center w-12">
              {tab === "pattern" && (
                <input
                  type="checkbox"
                  checked={filteredCandidates.length > 0 && filteredCandidates.every(c => selectedCandidates.includes(c.users_id))}
                  onChange={onToggleAll}
                  className="w-4 h-4 text-blue-600 rounded"
                />
              )}
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
        <div className="py-10 text-center text-gray-400 dark:text-gray-500">
          {tab === "search" && searchQuery.length >= 2 && !searchLoading
            ? "ไม่พบนักศึกษาที่ตรงกัน"
            : tab === "search"
              ? "พิมพ์ชื่อหรือรหัสนักศึกษาเพื่อค้นหา"
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
              เลือกแล้ว <span className="font-semibold text-blue-600">{selectedCandidates.length}</span> คน
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 px-6">
          <button
            onClick={() => setTab("pattern")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition ${tab === "pattern"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
          >
            <Users className="w-4 h-4" />
            รายชื่อตาม Section
            <span className="ml-1 px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
              {candidates.length}
            </span>
          </button>
          <button
            onClick={() => setTab("search")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition ${tab === "search"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
          >
            <UserSearch className="w-4 h-4" />
            ค้นหา (นักศึกษาซ้ำชั้น)
          </button>
        </div>

        {/* Search / Filter Bar */}
        <div className="px-6 pt-4 pb-2">
          {tab === "pattern" ? (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="กรองชื่อหรือรหัสนักศึกษา..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ) : (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="ค้นหาด้วยชื่อ นามสกุล หรือรหัสนักศึกษา..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {searchLoading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              )}
            </div>
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
