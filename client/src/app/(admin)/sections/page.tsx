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
  const [showCandidatesModal, setShowCandidatesModal] = useState(false)
  const [showEnrollmentsModal, setShowEnrollmentsModal] = useState(false)
  const [showEnrollModal, setShowEnrollModal] = useState(false)

  /* =======================
     Current section
  ======================= */
  const [currentSectionId, setCurrentSectionId] = useState<number | null>(null)
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([])

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
  async function fetchCandidates(sectionId: number) {
    setCurrentSectionId(sectionId)
    setCandidates([])
    setShowCandidatesModal(true)

    const res = await fetch(`/api/sections/${sectionId}/candidates`)
    if (res.ok) {
      const data = await res.json()
      setCandidates(data.candidates || [])
    }
  }

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

  if (loading) return <div className="p-6">Loading...</div>
  if (error) return <div className="p-6 text-red-500">{error}</div>

  return (
    <div className="p-6">
      {/* ================= Header ================= */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Sections</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowTermModal(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded"
          >
            + Create Term
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            + Create Section
          </button>
        </div>
      </div>

      {/* ================= Table ================= */}
      <table className="min-w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-2 py-1">Code</th>
            <th className="border px-2 py-1">Course</th>
            <th className="border px-2 py-1">Study</th>
            <th className="border px-2 py-1">Team</th>
            <th className="border px-2 py-1">Term</th>
            <th className="border px-2 py-1">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sections.map(s => (
            <tr key={s.section_id}>
              <td className="border px-2 py-1">{s.section_code}</td>
              <td className="border px-2 py-1">{s.course_type}</td>
              <td className="border px-2 py-1">{s.study_type}</td>
              <td className="border px-2 py-1">
                {s.min_team_size}-{s.max_team_size}
              </td>
              <td className="border px-2 py-1">
                {s.term?.term_name ?? s.term.term_id}
              </td>
              <td className="border px-2 py-1">
                <div className="flex gap-2 text-sm">
                  <Link
                    href={`/sections/${s.section_id}`}
                    className="text-blue-600 underline"
                  >
                    รายละเอียด
                  </Link>
                  <button onClick={() => fetchCandidates(s.section_id)}>
                    Candidates
                  </button>
                  <button onClick={() => fetchEnrollments(s.section_id)}>
                    Enrollments
                  </button>
                  <button onClick={() => openEnrollModal(s.section_id)}>
                    Enroll
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ================= Create Term Modal ================= */}
      {showTermModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <form
            onSubmit={handleCreateTerm}
            className="bg-white p-6 rounded w-full max-w-md"
          >
            <h2 className="text-xl font-bold mb-4">Create Term</h2>

            <input
              className="border p-2 w-full mb-2"
              placeholder="Academic Year"
              value={termForm.academicYear}
              onChange={e =>
                setTermForm(f => ({ ...f, academicYear: e.target.value }))
              }
              required
            />
            <input
              className="border p-2 w-full mb-2"
              placeholder="Semester"
              value={termForm.semester}
              onChange={e =>
                setTermForm(f => ({ ...f, semester: e.target.value }))
              }
              required
            />
            <input
              type="date"
              className="border p-2 w-full mb-2"
              value={termForm.startDate}
              onChange={e =>
                setTermForm(f => ({ ...f, startDate: e.target.value }))
              }
              required
            />
            <input
              type="date"
              className="border p-2 w-full mb-2"
              value={termForm.endDate}
              onChange={e =>
                setTermForm(f => ({ ...f, endDate: e.target.value }))
              }
              required
            />

            {termError && (
              <div className="text-red-500 mb-2">{termError}</div>
            )}

            <div className="flex gap-2">
              <button className="bg-blue-600 text-white px-4 py-2 rounded">
                Create
              </button>
              <button
                type="button"
                onClick={() => setShowTermModal(false)}
                className="bg-gray-400 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================= Create Section Modal ================= */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <form
            onSubmit={handleCreateSection}
            className="bg-white p-6 rounded w-full max-w-md max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-xl font-bold mb-4">Create Section</h2>

            <input
              className="border p-2 mb-2 w-full"
              placeholder="Section Code"
              value={createForm.section_code}
              onChange={e =>
                setCreateForm(f => ({ ...f, section_code: e.target.value }))
              }
              required
            />

            <select
              className="border p-2 mb-2 w-full"
              value={createForm.course_type}
              onChange={e =>
                setCreateForm(f => ({ ...f, course_type: e.target.value }))
              }
            >
              <option value="PROJECT">PROJECT</option>
              <option value="PRE_PROJECT">PRE_PROJECT</option>
            </select>

            <select
              className="border p-2 mb-2 w-full"
              value={createForm.study_type}
              onChange={e =>
                setCreateForm(f => ({ ...f, study_type: e.target.value }))
              }
            >
              <option value="LE">LE</option>
              <option value="REG">REG</option>
            </select>

            <input
              type="number"
              className="border p-2 mb-2 w-full"
              value={createForm.min_team_size}
              onChange={e =>
                setCreateForm(f => ({
                  ...f,
                  min_team_size: Number(e.target.value),
                }))
              }
            />
            <input
              type="number"
              className="border p-2 mb-2 w-full"
              value={createForm.max_team_size}
              onChange={e =>
                setCreateForm(f => ({
                  ...f,
                  max_team_size: Number(e.target.value),
                }))
              }
            />

            <input
              type="date"
              className="border p-2 mb-2 w-full"
              value={createForm.project_deadline}
              onChange={e =>
                setCreateForm(f => ({
                  ...f,
                  project_deadline: e.target.value,
                }))
              }
            />
            <input
              type="date"
              className="border p-2 mb-2 w-full"
              value={createForm.team_deadline}
              onChange={e =>
                setCreateForm(f => ({ ...f, team_deadline: e.target.value }))
              }
            />

            <select
              className="border p-2 mb-2 w-full"
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

            {createError && (
              <div className="text-red-500 mb-2">{createError}</div>
            )}

            <div className="flex gap-2">
              <button className="bg-blue-600 text-white px-4 py-2 rounded">
                Create
              </button>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="bg-gray-400 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================= Candidates Modal ================= */}
      {showCandidatesModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              Candidates (Section {currentSectionId})
            </h2>

            {candidates.length === 0 ? (
              <div className="text-gray-500">No candidates available</div>
            ) : (
              <table className="min-w-full border">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border px-2 py-1">User ID</th>
                    <th className="border px-2 py-1">Name</th>
                    <th className="border px-2 py-1">Email</th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.map(c => (
                    <tr key={c.users_id}>
                      <td className="border px-2 py-1">{c.users_id}</td>
                      <td className="border px-2 py-1">
                        {c.firstname} {c.lastname}
                      </td>
                      <td className="border px-2 py-1">{c.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <button
              className="mt-4 px-4 py-2 bg-gray-400 text-white rounded"
              onClick={() => setShowCandidatesModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ================= Enrollments Modal ================= */}
      {showEnrollmentsModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              Enrollments (Section {currentSectionId})
            </h2>

            {enrollments.length === 0 ? (
              <div className="text-gray-500">No enrollments yet</div>
            ) : (
              <table className="min-w-full border">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border px-2 py-1">User ID</th>
                    <th className="border px-2 py-1">Name</th>
                    <th className="border px-2 py-1">Enrolled At</th>
                  </tr>
                </thead>
                <tbody>
                  {enrollments.map(e => (
                    <tr key={e.enrollment_id}>
                      <td className="border px-2 py-1">
                        {e.user.users_id}
                      </td>
                      <td className="border px-2 py-1">
                        {e.user.firstname} {e.user.lastname}
                      </td>
                      <td className="border px-2 py-1">
                        {new Date(e.enrolledAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <button
              className="mt-4 px-4 py-2 bg-gray-400 text-white rounded"
              onClick={() => setShowEnrollmentsModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ================= Enroll Modal ================= */}
      {showEnrollModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              Enroll Students (Section {currentSectionId})
            </h2>

            {candidates.length === 0 ? (
              <div className="text-gray-500">No candidates available</div>
            ) : (
              <>
                <div className="mb-4 text-sm text-gray-600">
                  Selected: {selectedCandidates.length}
                </div>

                <table className="min-w-full border">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border px-2 py-1">Select</th>
                      <th className="border px-2 py-1">User ID</th>
                      <th className="border px-2 py-1">Name</th>
                      <th className="border px-2 py-1">Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {candidates.map(c => (
                      <tr key={c.users_id}>
                        <td className="border px-2 py-1 text-center">
                          <input
                            type="checkbox"
                            checked={selectedCandidates.includes(c.users_id)}
                            onChange={() => toggleCandidate(c.users_id)}
                          />
                        </td>
                        <td className="border px-2 py-1">{c.users_id}</td>
                        <td className="border px-2 py-1">
                          {c.firstname} {c.lastname}
                        </td>
                        <td className="border px-2 py-1">{c.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}

            <div className="flex gap-2 mt-4">
              <button
                className="px-4 py-2 bg-green-600 text-white rounded disabled:bg-gray-300"
                onClick={handleEnroll}
                disabled={selectedCandidates.length === 0}
              >
                Enroll Selected
              </button>
              <button
                className="px-4 py-2 bg-gray-400 text-white rounded"
                onClick={() => setShowEnrollModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
