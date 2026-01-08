"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

/* =======================
   Types
======================= */
type Section = {
  section_id: number
  section_code: string
  course_type: string
  study_type: string
  min_team_size: number
  max_team_size: number
  project_deadline: string
  team_deadline: string
  term: {
    term_id: number
    term_name?: string
  }
}

type Candidate = {
  users_id: string
  firstname: string | null
  lastname: string | null
  email: string | null
}

type Enrollment = {
  enrollment_id: number
  users_id: string
  section_id: number
  enrolledAt: string
  user: {
    users_id: string
    firstname: string | null
    lastname: string | null
  }
}

type Term = {
  term_id: number
  academicYear: string
  semester: string
}

export default function SectionsPage() {
  /* =======================
     Data states
  ======================= */
  const [sections, setSections] = useState<Section[]>([])
  const [terms, setTerms] = useState<Term[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  /* =======================
     Modal states
  ======================= */
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showTermModal, setShowTermModal] = useState(false)
  const [showEnrollmentsModal, setShowEnrollmentsModal] = useState(false)
  const [showEnrollModal, setShowEnrollModal] = useState(false)
  const [showContinueModal, setShowContinueModal] = useState(false)

  /* =======================
     Current section
  ======================= */
  const [currentSectionId, setCurrentSectionId] = useState<number | null>(null)
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([])
  const [continueTermId, setContinueTermId] = useState<string>("")
  const [continuingSectionId, setContinuingSectionId] = useState<number | null>(null)

  /* =======================
     Forms
  ======================= */
  const [createForm, setCreateForm] = useState({
    section_code: "",
    course_type: "PROJECT",
    study_type: "LE",
    min_team_size: 1,
    max_team_size: 3,
    project_deadline: "",
    team_deadline: "",
    term_id: "",
  })
  const [createError, setCreateError] = useState("")

  const [termForm, setTermForm] = useState({
    academicYear: "",
    semester: "",
    startDate: "",
    endDate: "",
  })
  const [termError, setTermError] = useState("")

  /* =======================
     Initial load
  ======================= */
  useEffect(() => {
    fetchSections()
    fetchTerms()
  }, [])

  async function fetchSections() {
    setLoading(true)
    try {
      const res = await fetch("/api/sections", { cache: "no-store" })
      if (!res.ok) throw new Error()
      setSections(await res.json())
    } catch {
      setError("ไม่สามารถโหลดข้อมูล section ได้")
    } finally {
      setLoading(false)
    }
  }

  async function fetchTerms() {
    const res = await fetch("/api/terms", { cache: "no-store" })
    if (!res.ok) return
    const data = await res.json()
    setTerms(
      data.sort(
        (a: Term, b: Term) =>
          Number(b.academicYear) - Number(a.academicYear) ||
          Number(b.semester) - Number(a.semester)
      )
    )
  }

  /* =======================
     Create Section
  ======================= */
  async function handleCreateSection(e: React.FormEvent) {
    e.preventDefault()
    setCreateError("")

    const res = await fetch("/api/sections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(createForm),
    })

    if (res.ok) {
      setShowCreateModal(false)
      setCreateForm({
        section_code: "",
        course_type: "PROJECT",
        study_type: "LE",
        min_team_size: 1,
        max_team_size: 3,
        project_deadline: "",
        team_deadline: "",
        term_id: "",
      })
      fetchSections()
    } else {
      const data = await res.json()
      setCreateError(data.message || "เกิดข้อผิดพลาด")
    }
  }

  /* =======================
     Create Term
  ======================= */
  async function handleCreateTerm(e: React.FormEvent) {
    e.preventDefault()
    setTermError("")

    const res = await fetch("/api/terms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(termForm),
    })

    if (res.ok) {
      setShowTermModal(false)
      setTermForm({
        academicYear: "",
        semester: "",
        startDate: "",
        endDate: "",
      })
      fetchTerms()
    } else {
      const data = await res.json()
      setTermError(data.error || "สร้างเทอมไม่สำเร็จ")
    }
  }

  /* =======================
     Candidates / Enroll
  ======================= */
  async function fetchEnrollments(sectionId: number) {
    setCurrentSectionId(sectionId)
    setEnrollments([])
    setShowEnrollmentsModal(true)

    const res = await fetch(`/api/sections/${sectionId}/enrollments`)
    if (res.ok) setEnrollments(await res.json())
  }

  async function openEnrollModal(sectionId: number) {
    setCurrentSectionId(sectionId)
    setCandidates([])
    setSelectedCandidates([])
    setShowEnrollModal(true)

    const res = await fetch(`/api/sections/${sectionId}/candidates`)
    if (res.ok) {
      const data = await res.json()
      setCandidates(data.candidates || [])
    }
  }

  async function handleEnroll() {
    if (!currentSectionId || selectedCandidates.length === 0) return

    const res = await fetch(`/api/sections/${currentSectionId}/enroll`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ users_ids: selectedCandidates }),
    })

    if (res.ok) {
      alert("Enroll สำเร็จ!")
      setShowEnrollModal(false)
      setSelectedCandidates([])
    } else {
      alert("Enroll ล้มเหลว")
    }
  }

  function toggleCandidate(userId: string) {
    setSelectedCandidates(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  /* =======================
     Continue to Project
  ======================= */
  function openContinueModal(sectionId: number) {
    setContinuingSectionId(sectionId)
    setContinueTermId("")
    setShowContinueModal(true)
  }

  async function handleContinueToProject() {
    if (!continuingSectionId || !continueTermId) {
      alert("กรุณาเลือกเทอมใหม่")
      return
    }

    const res = await fetch(`/api/sections/${continuingSectionId}/continue-to-project`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ new_term_id: continueTermId }),
    })

    if (res.ok) {
      alert("ต่อวิชาเรียบร้อย! ย้ายทีมและนักศึกษาไปเทอมใหม่แล้ว")
      setShowContinueModal(false)
      fetchSections()
    } else {
      const data = await res.json()
      alert(data.message || "ต่อวิชาล้มเหลว")
    }
  }

  if (loading) return <div className="p-6">Loading...</div>
  if (error) return <div className="p-6 text-red-500">{error}</div>

  return (
    <div className="p-6 min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* ================= Header ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">จัดการหมู่เรียน</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Section Management</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowTermModal(true)}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-sm transition"
          >
            + สร้างเทอม
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-sm transition"
          >
            + สร้างหมู่เรียน
          </button>
        </div>
      </div>

      {/* ================= Cards Grid ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map(s => (
          <div 
            key={s.section_id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Card Header */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-5">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">
                    {s.section_code}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-100 text-sm">
                      {s.course_type === 'PROJECT' ? 'โปรเจกต์' : 'ก่อนโปรเจกต์'}
                    </span>
                    <span className="text-blue-100">•</span>
                    <span className="text-blue-100 text-sm">
                      {s.study_type === 'LE' ? 'เทียบโอน' : 'ปกติ'}
                    </span>
                  </div>
                </div>
                {/* ปุ่มต่อวิชา (แสดงเฉพาะ PRE_PROJECT) */}
                {s.course_type === 'PRE_PROJECT' && (
                  <button
                    onClick={() => openContinueModal(s.section_id)}
                    className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold rounded-lg transition backdrop-blur-sm"
                    title="ต่อวิชาไป PROJECT"
                  >
                    ➡️ ต่อวิชา
                  </button>
                )}
              </div>
            </div>

            {/* Card Body */}
            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">ขนาดทีม</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {s.min_team_size}-{s.max_team_size} คน
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">ภาคเรียน</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {s.term?.term_name ?? `Term ${s.term.term_id}`}
                </span>
              </div>

              <div className="pt-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
                <button 
                  onClick={() => openEnrollModal(s.section_id)}
                  className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-sm transition text-base"
                >
                  📝 เพิ่มนักศึกษา (Enroll)
                </button>
                
                <button 
                  onClick={() => fetchEnrollments(s.section_id)}
                  className="w-full px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium transition"
                >
                  👥 ดูรายชื่อนักศึกษา
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ================= Create Term Modal ================= */}
      {showTermModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form
            onSubmit={handleCreateTerm}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700"
          >
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">สร้างเทอมการศึกษา</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  ปีการศึกษา
                </label>
                <input
                  className="border border-gray-300 dark:border-gray-600 p-3 w-full rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="เช่น 2567"
                  value={termForm.academicYear}
                  onChange={e =>
                    setTermForm(f => ({ ...f, academicYear: e.target.value }))
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  ภาคเรียน
                </label>
                <input
                  className="border border-gray-300 dark:border-gray-600 p-3 w-full rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="เช่น 1 หรือ 2"
                  value={termForm.semester}
                  onChange={e =>
                    setTermForm(f => ({ ...f, semester: e.target.value }))
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  วันเริ่มต้น
                </label>
                <input
                  type="date"
                  className="border border-gray-300 dark:border-gray-600 p-3 w-full rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={termForm.startDate}
                  onChange={e =>
                    setTermForm(f => ({ ...f, startDate: e.target.value }))
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  วันสิ้นสุด
                </label>
                <input
                  type="date"
                  className="border border-gray-300 dark:border-gray-600 p-3 w-full rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={termForm.endDate}
                  onChange={e =>
                    setTermForm(f => ({ ...f, endDate: e.target.value }))
                  }
                  required
                />
              </div>
            </div>

            {termError && (
              <div className="text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg mt-4 text-sm">
                {termError}
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button 
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-semibold shadow-sm transition"
              >
                สร้างเทอม
              </button>
              <button
                type="button"
                onClick={() => setShowTermModal(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-4 py-3 rounded-lg font-semibold transition"
              >
                ยกเลิก
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================= Create Section Modal ================= */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form
            onSubmit={handleCreateSection}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700"
          >
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">สร้างหมู่เรียนใหม่</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  รหัสหมู่เรียน
                </label>
                <input
                  className="border border-gray-300 dark:border-gray-600 p-3 w-full rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="เช่น 66346CPE รูปแบบนี้เท่านั้น"
                  value={createForm.section_code}
                  onChange={e =>
                    setCreateForm(f => ({ ...f, section_code: e.target.value }))
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  ประเภทรายวิชา
                </label>
                <select
                  className="border border-gray-300 dark:border-gray-600 p-3 w-full rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={createForm.course_type}
                  onChange={e =>
                    setCreateForm(f => ({ ...f, course_type: e.target.value }))
                  }
                >
                  <option value="PROJECT">โปรเจกต์ (PROJECT)</option>
                  <option value="PRE_PROJECT">ก่อนโปรเจกต์ (PRE_PROJECT)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  ประเภทการศึกษา
                </label>
                <select
                  className="border border-gray-300 dark:border-gray-600 p-3 w-full rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={createForm.study_type}
                  onChange={e =>
                    setCreateForm(f => ({ ...f, study_type: e.target.value }))
                  }
                >
                  <option value="LE">เทียบโอน (LE)</option>
                  <option value="REG">ปกติ (REG)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    ขนาดทีมขั้นต่ำ
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="border border-gray-300 dark:border-gray-600 p-3 w-full rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={createForm.min_team_size}
                    onChange={e =>
                      setCreateForm(f => ({
                        ...f,
                        min_team_size: Number(e.target.value),
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    ขนาดทีมสูงสุด
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="border border-gray-300 dark:border-gray-600 p-3 w-full rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={createForm.max_team_size}
                    onChange={e =>
                      setCreateForm(f => ({
                        ...f,
                        max_team_size: Number(e.target.value),
                      }))
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  เดดไลน์โปรเจกต์
                </label>
                <input
                  type="date"
                  className="border border-gray-300 dark:border-gray-600 p-3 w-full rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={createForm.project_deadline}
                  onChange={e =>
                    setCreateForm(f => ({
                      ...f,
                      project_deadline: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  เดดไลน์จัดทีม
                </label>
                <input
                  type="date"
                  className="border border-gray-300 dark:border-gray-600 p-3 w-full rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={createForm.team_deadline}
                  onChange={e =>
                    setCreateForm(f => ({ ...f, team_deadline: e.target.value }))
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  เทอม <span className="text-red-500">*</span>
                </label>
                <select
                  className="border border-gray-300 dark:border-gray-600 p-3 w-full rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={createForm.term_id}
                  onChange={e =>
                    setCreateForm(f => ({ ...f, term_id: e.target.value }))
                  }
                  required
                >
                  <option value="">-- เลือกเทอม --</option>
                  {terms.map(t => (
                    <option key={t.term_id} value={t.term_id}>
                      {t.semester}/{t.academicYear}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {createError && (
              <div className="text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg mt-4 text-sm">
                {createError}
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button 
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-semibold shadow-sm transition"
              >
                สร้างหมู่เรียน
              </button>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-4 py-3 rounded-lg font-semibold transition"
              >
                ยกเลิก
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================= Enrollments Modal ================= */}
      {showEnrollmentsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              รายชื่อนักศึกษา (Section {currentSectionId})
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
                      {enrollments.map(e => (
                        <tr key={e.enrollment_id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {e.user.users_id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {e.user.firstname} {e.user.lastname}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                            {new Date(e.enrolledAt).toLocaleDateString('th-TH', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
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
                onClick={() => setShowEnrollmentsModal(false)}
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= Enroll Modal ================= */}
      {showEnrollModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col">
            <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
              เพิ่มนักศึกษาเข้าหมู่เรียน
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Section {currentSectionId}
            </p>

            {candidates.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 dark:text-gray-500 text-lg mb-2">
                  ไม่มีนักศึกษาที่สามารถเพิ่มได้
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  นักศึกษาทั้งหมดได้ลงทะเบียนแล้ว
                </p>
              </div>
            ) : (
              <>
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-300">
                    เลือกแล้ว: {selectedCandidates.length} คน
                  </p>
                </div>

                <div className="flex-1 overflow-y-auto">
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-900 sticky top-0">
                        <tr>
                          <th className="px-6 py-3 text-center w-16">
                            <input
                              type="checkbox"
                              checked={selectedCandidates.length === candidates.length}
                              onChange={() => {
                                if (selectedCandidates.length === candidates.length) {
                                  setSelectedCandidates([])
                                } else {
                                  setSelectedCandidates(candidates.map(c => c.users_id))
                                }
                              }}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                            />
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                            รหัสนักศึกษา
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                            ชื่อ - นามสกุล
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                            อีเมล
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {candidates.map(c => (
                          <tr 
                            key={c.users_id}
                            className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition cursor-pointer"
                            onClick={() => toggleCandidate(c.users_id)}
                          >
                            <td className="px-6 py-4 text-center">
                              <input
                                type="checkbox"
                                checked={selectedCandidates.includes(c.users_id)}
                                onChange={() => toggleCandidate(c.users_id)}
                                onClick={(e) => e.stopPropagation()}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                              {c.users_id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {c.firstname} {c.lastname}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                              {c.email}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-sm transition disabled:bg-gray-300 disabled:cursor-not-allowed text-base"
                onClick={handleEnroll}
                disabled={selectedCandidates.length === 0}
              >
                ✓ เพิ่มนักศึกษาที่เลือก ({selectedCandidates.length})
              </button>
              <button
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-semibold transition"
                onClick={() => setShowEnrollModal(false)}
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= Continue to Project Modal ================= */}
      {showContinueModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              ต่อวิชาไป PROJECT
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
              ย้ายทีม สมาชิก และโปรเจกต์ไปยังเทอมใหม่ (ประเภท PROJECT)<br/>
              <span className="text-amber-600 dark:text-amber-400 font-semibold">สถานะโปรเจกต์จะคงเดิม (ไม่รีเซ็ต)</span>
            </p>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                เลือกเทอมใหม่
              </label>
              <select
                value={continueTermId}
                onChange={(e) => setContinueTermId(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">-- เลือกเทอม --</option>
                {terms.map((t) => (
                  <option key={t.term_id} value={t.term_id}>
                    {t.semester}/{t.academicYear}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3">
              <button
                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-sm transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                onClick={handleContinueToProject}
                disabled={!continueTermId}
              >
                ✓ ต่อวิชา
              </button>
              <button
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-semibold transition"
                onClick={() => setShowContinueModal(false)}
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
