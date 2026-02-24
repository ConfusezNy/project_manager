/**
 * Business logic constants — ไม่ hardcode ในแต่ละ service
 */

/** จำนวนโปรเจกต์สูงสุดที่อาจารย์รับได้ */
export const MAX_ADVISOR_PROJECTS = 2;

/** เบอร์โทรศัพท์สูงสุดกี่หลัก */
export const MAX_PHONE_LENGTH = 10;

/** Valid grade scores (ตรงกับ GradeScore enum ใน Prisma) */
export const VALID_GRADE_SCORES = [
    'A', 'B_PLUS', 'B', 'C_PLUS', 'C', 'D_PLUS', 'D', 'F',
] as const;

/** Valid event types (ตรงกับ EventType enum ใน Prisma) */
export const VALID_EVENT_TYPES = [
    'PROGRESS_REPORT', 'DOCUMENT', 'POSTER', 'EXAM', 'FINAL_SUBMISSION', 'SEMINAR',
] as const;
