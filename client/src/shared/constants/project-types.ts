/**
 * Project Types — ค่า project_type ที่ใช้ทั้งระบบ
 * 
 * ⚠️ ใช้ constant นี้แทนการ hardcode ในแต่ละ component
 * ถ้าต้องเพิ่ม/ลบ type → แก้ที่นี่ที่เดียว
 */
export const PROJECT_TYPES = [
    "Software",
    "AI / Data",
    "Embedded / IoT",
    "Network / Security",
    "Image / Signal",
    "Game / AR-VR",
    "Research",
] as const;

export type ProjectType = (typeof PROJECT_TYPES)[number];
