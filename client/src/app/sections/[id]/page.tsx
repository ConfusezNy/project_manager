import { headers } from "next/headers"   // 👈 import ที่นี่

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

async function getSection(id: string): Promise<Section> {
  const h = headers()
  const host = h.get("host")!

  const protocol =
    process.env.NODE_ENV === "development" ? "http" : "https"

  const res = await fetch(
    `${protocol}://${host}/api/sections/${id}`,
    { cache: "no-store" }
  )

  if (!res.ok) {
    throw new Error("Section not found")
  }

  return res.json()
}

export default async function SectionDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const section = await getSection(params.id)

  return (
    <div>
      <h1>{section.section_code}</h1>
    </div>
  )
}
