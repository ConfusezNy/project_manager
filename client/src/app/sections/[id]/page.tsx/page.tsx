export default async function SectionPage({
  params
}: {
  params: { id: string }
}) {
  const res = await fetch(
    `http://localhost:3000/api/sections/${params.id}`,
    { cache: "no-store" }
  )

  if (!res.ok) {
    throw new Error("Failed to fetch section")
  }

  const section = await res.json()

  return (
    <div>
      <h1>{section.section_code}</h1>

      <p>Course Type: {section.course_type}</p>
      <p>Study Type: {section.study_type}</p>

      <ul>
        <li>
          <a href={`/sections/${params.id}/candidates`}>
            เลือกนักศึกษา
          </a>
        </li>
        <li>
          <a href={`/sections/${params.id}/enrollments`}>
            รายชื่อที่ลงทะเบียนแล้ว
          </a>
        </li>
      </ul>
    </div>
  )
}
