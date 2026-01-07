export function TeamAdvisorSection({
  advisors,
  hasTeam
}: {
  advisors: any[]
  hasTeam: boolean
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded p-4">
      <h3 className="font-semibold mb-2">อาจารย์ที่ปรึกษา</h3>

      {!hasTeam && (
        <p className="text-gray-500">
          ต้องมีกลุ่มก่อนจึงจะเลือกอาจารย์ที่ปรึกษาได้
        </p>
      )}

      {advisors.length === 0 && hasTeam && (
        <p className="text-gray-500">
          ยังไม่ได้เลือกอาจารย์ที่ปรึกษา
        </p>
      )}
    </div>
  )
}
