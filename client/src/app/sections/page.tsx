"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

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

export default function SectionsPage() {
  const [sections, setSections] = useState<Section[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showCandidatesModal, setShowCandidatesModal] = useState(false)
  const [showEnrollmentsModal, setShowEnrollmentsModal] = useState(false)
  const [showEnrollModal, setShowEnrollModal] = useState(false)

  // Current section for modal
  const [currentSectionId, setCurrentSectionId] = useState<number | null>(null)
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([])

  // Create form
  const [createForm, setCreateForm] = useState({
    section_code: "",
    course_type: "PROJECT",
    study_type: "LE",
    min_team_size: 1,
    max_team_size: 3,
    project_deadline: "",
    team_deadline: "",
    term_id: ""
  })
  const [createError, setCreateError] = useState("")

  useEffect(() => {
    fetchSections()
  }, [])

  function fetchSections() {
    setLoading(true)
    fetch("/api/sections", { cache: "no-store" })
      .then(res => {
        if (!res.ok) throw new Error("fetch failed")
        return res.json()
      })
      .then(data => setSections(data))
      .catch(() => setError("ไม่สามารถโหลดข้อมูล section ได้"))
      .finally(() => setLoading(false))
  }

  // Create section
  async function handleCreateSection(e: React.FormEvent) {
    e.preventDefault()
    setCreateError("")

    const res = await fetch("/api/sections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(createForm)
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
        term_id: ""
      })
      fetchSections()
    } else {
      const data = await res.json()
      setCreateError(data.message || "เกิดข้อผิดพลาด")
    }
  }

  // Fetch candidates
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

  // Fetch enrollments
  async function fetchEnrollments(sectionId: number) {
    setCurrentSectionId(sectionId)
    setEnrollments([])
    setShowEnrollmentsModal(true)

    const res = await fetch(`/api/sections/${sectionId}/enrollments`)
    if (res.ok) {
      const data = await res.json()
      setEnrollments(data)
    }
  }

  // Open enroll modal
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

  // Handle enroll
  async function handleEnroll() {
    if (!currentSectionId || selectedCandidates.length === 0) return

    const res = await fetch(`/api/sections/${currentSectionId}/enroll`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ users_ids: selectedCandidates })
    })

    if (res.ok) {
      alert("Enroll สำเร็จ!")
      setShowEnrollModal(false)
      setSelectedCandidates([])
    } else {
      alert("Enroll ล้มเหลว")
    }
  }

  // Toggle candidate selection
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
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Sections</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          + Create Section
        </button>
      </div>

      <table className="min-w-full border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-3 py-2">Code</th>
            <th className="border px-3 py-2">Course</th>
            <th className="border px-3 py-2">Study</th>
            <th className="border px-3 py-2">Team</th>
            <th className="border px-3 py-2">Term</th>
            <th className="border px-3 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sections.map(s => (
            <tr key={s.section_id} className="hover:bg-gray-50">
              <td className="border px-3 py-2">{s.section_code}</td>
              <td className="border px-3 py-2">{s.course_type}</td>
              <td className="border px-3 py-2">{s.study_type}</td>
              <td className="border px-3 py-2">
                {s.min_team_size}–{s.max_team_size}
              </td>
              <td className="border px-3 py-2">
                {s.term?.term_name ?? s.term.term_id}
              </td>
              <td className="border px-3 py-2">
                <div className="flex gap-2 flex-wrap">
                  <Link
                    href={`/sections/${s.section_id}`}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    รายละเอียด
                  </Link>
                  <button
                    onClick={() => fetchCandidates(s.section_id)}
                    className="text-purple-600 hover:underline text-sm"
                  >
                    Candidates
                  </button>
                  <button
                    onClick={() => fetchEnrollments(s.section_id)}
                    className="text-orange-600 hover:underline text-sm"
                  >
                    Enrollments
                  </button>
                  <button
                    onClick={() => openEnrollModal(s.section_id)}
                    className="text-green-600 hover:underline text-sm"
                  >
                    Enroll
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Create Section Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <form
            className="bg-white p-6 rounded shadow-md w-full max-w-md max-h-[90vh] overflow-y-auto"
            onSubmit={handleCreateSection}
          >
            <h2 className="text-xl font-bold mb-4">Create Section</h2>
            <input
              className="border p-2 mb-2 w-full"
              placeholder="Section Code (e.g. 66346CPE)"
              value={createForm.section_code}
              onChange={e => setCreateForm(f => ({ ...f, section_code: e.target.value }))}
              required
            />
            <select
              className="border p-2 mb-2 w-full"
              value={createForm.course_type}
              onChange={e => setCreateForm(f => ({ ...f, course_type: e.target.value }))}
            >
              <option value="PROJECT">PROJECT</option>
              <option value="PRE_PROJECT">PRE_PROJECT</option>
            </select>
            <select
              className="border p-2 mb-2 w-full"
              value={createForm.study_type}
              onChange={e => setCreateForm(f => ({ ...f, study_type: e.target.value }))}
            >
              <option value="LE">LE</option>
              <option value="REG">REG</option>
            </select>
            <input
              className="border p-2 mb-2 w-full"
              type="number"
              placeholder="Min Team Size"
              value={createForm.min_team_size}
              onChange={e => setCreateForm(f => ({ ...f, min_team_size: Number(e.target.value) }))}
              required
            />
            <input
              className="border p-2 mb-2 w-full"
              type="number"
              placeholder="Max Team Size"
              value={createForm.max_team_size}
              onChange={e => setCreateForm(f => ({ ...f, max_team_size: Number(e.target.value) }))}
              required
            />
            <input
              className="border p-2 mb-2 w-full"
              type="date"
              placeholder="Project Deadline"
              value={createForm.project_deadline}
              onChange={e => setCreateForm(f => ({ ...f, project_deadline: e.target.value }))}
              required
            />
            <input
              className="border p-2 mb-2 w-full"
              type="date"
              placeholder="Team Deadline"
              value={createForm.team_deadline}
              onChange={e => setCreateForm(f => ({ ...f, team_deadline: e.target.value }))}
              required
            />
            <input
              className="border p-2 mb-2 w-full"
              type="number"
              placeholder="Term ID"
              value={createForm.term_id}
              onChange={e => setCreateForm(f => ({ ...f, term_id: e.target.value }))}
              required
            />
            {createError && <div className="text-red-500 mb-2">{createError}</div>}
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Create
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-gray-400 text-white rounded"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Candidates Modal */}
      {showCandidatesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-md w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Candidates (Section {currentSectionId})</h2>
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

      {/* Enrollments Modal */}
      {showEnrollmentsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-md w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Enrollments (Section {currentSectionId})</h2>
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
                      <td className="border px-2 py-1">{e.user.users_id}</td>
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

      {/* Enroll Modal */}
      {showEnrollModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-md w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Enroll Students (Section {currentSectionId})</h2>
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