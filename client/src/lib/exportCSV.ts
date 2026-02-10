/**
 * สร้างไฟล์ CSV จากข้อมูล array of objects แล้วดาวน์โหลดอัตโนมัติ
 * รองรับ BOM สำหรับ Excel ภาษาไทย
 */
export function exportToCSV(
  data: Record<string, string | number | null | undefined>[],
  headers: { key: string; label: string }[],
  filename: string,
) {
  if (data.length === 0) return;

  // สร้าง header row
  const headerRow = headers.map((h) => `"${h.label}"`).join(",");

  // สร้าง data rows
  const rows = data.map((item) =>
    headers
      .map((h) => {
        const value = item[h.key];
        if (value === null || value === undefined) return '""';
        // Escape quotes
        const str = String(value).replace(/"/g, '""');
        return `"${str}"`;
      })
      .join(","),
  );

  // รวม header + data + BOM สำหรับ Excel ภาษาไทย
  const BOM = "\uFEFF";
  const csvContent = BOM + [headerRow, ...rows].join("\n");

  // สร้าง Blob และดาวน์โหลด
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * แปลง GradeScore enum เป็นข้อความอ่านง่าย
 */
export function formatGradeLabel(score: string): string {
  return score.replace("_PLUS", "+");
}
