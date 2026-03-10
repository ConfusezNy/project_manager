/**
 * Project Types — ค่า project_type ที่ใช้ทั้งระบบ
 * 
 * ⚠️ ใช้ constant นี้แทนการ hardcode ในแต่ละ component
 * ถ้าต้องเพิ่ม/ลบ type → แก้ที่นี่ที่เดียว
 */
export const PROJECT_TYPES = [
    "Web Application",
    "Mobile Application",
    "Desktop Application",
    "AI / Machine Learning",
    "Data Science / Big Data",
    "Embedded System",
    "IoT (Internet of Things)",
    "Computer Network",
    "Cybersecurity",
    "Image Processing",
    "Signal Processing",
    "Game Development",
    "AR / VR",
    "Cloud / DevOps",
    "Robotics",
    "Research",
] as const;

export type ProjectType = (typeof PROJECT_TYPES)[number];
