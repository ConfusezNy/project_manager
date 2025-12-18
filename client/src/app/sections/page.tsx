"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link"

export default function SectionsPage() {
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    section_code: "",
    course_type: "PROJECT",
    study_type: "LE",
    min_team_size: 1,
    max_team_size: 3,
    project_deadline: "",
    team_deadline: "",
    term_id: ""
  });
  const [error, setError] = useState("");

  // โหลด sections
  async function fetchSections() {
    setLoading(true);
    const res = await fetch("/api/sections", { cache: "no-store" });
    if (res.ok) {
      setSections(await res.json());
    }
    setLoading(false);
  }

  // โหลดครั้งแรก
  React.useEffect(() => { fetchSections(); }, []);

  // ส่งฟอร์มเพิ่ม section
  async function handleSubmit(e: any) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/sections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    if (res.ok) {
      setShowForm(false);
      fetchSections();
    } else {
      const data = await res.json();
      setError(data.message || "เกิดข้อผิดพลาด");
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Sections</h1>
      <button
        className="mb-4 px-4 py-2 bg-green-600 text-white rounded"
        onClick={() => setShowForm(true)}
      >
        + เพิ่ม Section
      </button>
      
      {loading ? (
        <div>Loading...</div>
      ) : sections.length === 0 ? (
        <div className="text-red-500">ไม่พบข้อมูล section หรือ API มีปัญหา</div>
      ) : (
        <table className="min-w-full border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b">Section ID</th>
              <th className="py-2 px-4 border-b">Section Code</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sections.map((s: any) => (
              <tr key={s.section_id} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b">{s.section_id}</td>
                <td className="py-2 px-4 border-b">{s.section_code}</td>
                <td className="py-2 px-4 border-b">
                  <a
                    href={`/sections/${s.section_id}`}
                    className="inline-block px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                  >
                    ดูรายละเอียด
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal ฟอร์มเพิ่ม Section */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <form
            className="bg-white p-6 rounded shadow-md w-full max-w-md"
            onSubmit={handleSubmit}
          >
            <h2 className="text-xl font-bold mb-4">เพิ่ม Section</h2>
            <input
              className="border p-2 mb-2 w-full"
              placeholder="Section Code"
              value={form.section_code}
              onChange={e => setForm(f => ({ ...f, section_code: e.target.value }))}
              required
            />
            <select
              className="border p-2 mb-2 w-full"
              value={form.course_type}
              onChange={e => setForm(f => ({ ...f, course_type: e.target.value }))}
            >
              <option value="PROJECT">PROJECT</option>
              <option value="PRE_PROJECT">PRE_PROJECT</option>
            </select>
            <select
              className="border p-2 mb-2 w-full"
              value={form.study_type}
              onChange={e => setForm(f => ({ ...f, study_type: e.target.value }))}
            >
              <option value="LE">LE</option>
              <option value="REG">REG</option>
            </select>
            <input
              className="border p-2 mb-2 w-full"
              type="number"
              placeholder="Min Team Size"
              value={form.min_team_size}
              onChange={e => setForm(f => ({ ...f, min_team_size: Number(e.target.value) }))}
              required
            />
            <input
              className="border p-2 mb-2 w-full"
              type="number"
              placeholder="Max Team Size"
              value={form.max_team_size}
              onChange={e => setForm(f => ({ ...f, max_team_size: Number(e.target.value) }))}
              required
            />
            <input
              className="border p-2 mb-2 w-full"
              type="date"
              placeholder="Project Deadline"
              value={form.project_deadline}
              onChange={e => setForm(f => ({ ...f, project_deadline: e.target.value }))}
              required
            />
            <input
              className="border p-2 mb-2 w-full"
              type="date"
              placeholder="Team Deadline"
              value={form.team_deadline}
              onChange={e => setForm(f => ({ ...f, team_deadline: e.target.value }))}
              required
            />
            <input
              className="border p-2 mb-2 w-full"
              type="number"
              placeholder="Term ID"
              value={form.term_id}
              onChange={e => setForm(f => ({ ...f, term_id: e.target.value }))}
              required
            />
            {error && <div className="text-red-500 mb-2">{error}</div>}
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                บันทึก
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-gray-400 text-white rounded"
                onClick={() => setShowForm(false)}
              >
                ยกเลิก
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}