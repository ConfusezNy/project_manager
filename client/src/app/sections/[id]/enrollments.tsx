export default async function EnrollmentsPage({
  params
}: {
  params: { id: string }
}) {
  const enrollments = await fetch(
    `http://localhost:3000/api/sections/${params.id}/enrollments`,
    { cache: "no-store" }
  ).then(res => res.json())

  return (
    <div>
      <h2>รายชื่อนักศึกษาที่ลงทะเบียนแล้ว</h2>

      <ul>
        {enrollments.map((e: any) => (
          <li key={e.user.users_id}>
            {e.user.users_id} {e.user.firstname} {e.user.lastname}
          </li>
        ))}
      </ul>
    </div>
  )
}
