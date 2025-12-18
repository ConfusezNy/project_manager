"use client"

import { useEffect, useState } from "react"

export default function CandidatesPage({
  params
}: {
  params: { id: string }
}) {
  const [candidates, setCandidates] = useState<any[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/sections/${params.id}/candidates`)
      .then(res => res.json())
      .then(data => {
        setCandidates(data.candidates)
        setLoading(false)
      })
  }, [params.id])

  function toggle(userId: string) {
    setSelected(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  async function enroll() {
    if (selected.length === 0) {
      alert("กรุณาเลือกนักศึกษา")
      return
    }

    await fetch(`/api/sections/${params.id}/enroll`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ users_ids: selected })
    })

    alert("Enroll สำเร็จ")
  }

  if (loading) return <p>Loading...</p>

  return (
    <div>
      <h2>นักศึกษาที่ระบบแนะนำ</h2>

      {candidates.map(c => (
        <div key={c.users_id}>
          <input
            type="checkbox"
            onChange={() => toggle(c.users_id)}
          />
          {c.users_id} {c.firstname} {c.lastname}
        </div>
      ))}

      <button onClick={enroll}>Enroll</button>
    </div>
  )
}
