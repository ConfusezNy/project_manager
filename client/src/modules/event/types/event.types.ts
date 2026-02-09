// Event Module Types

export type EventType =
  | "PROGRESS_REPORT"
  | "DOCUMENT"
  | "POSTER"
  | "EXAM"
  | "FINAL_SUBMISSION"
  | "SEMINAR";

export type SubmissionStatus =
  | "PENDING"
  | "SUBMITTED"
  | "NEEDS_REVISION"
  | "APPROVED";

export interface Event {
  event_id: number;
  name: string;
  type: EventType;
  description?: string | null;
  order: number;
  dueDate: string;
  weight?: number; // Percentage weight for scoring
  section_id: number;
  createdAt: string;
  Section?: {
    section_id: number;
    section_code: string;
  };
  Submission?: Submission[];
  _count?: {
    Submission: number;
  };
  stats?: {
    totalTeams: number;
    submitted: number;
    approved: number;
    pending: number;
  };
}

export interface Submission {
  submission_id: number;
  event_id: number;
  team_id: number;
  status: SubmissionStatus;
  submittedAt?: string | null;
  file?: string | null;
  feedback?: string | null;
  approvedAt?: string | null;
  approvedBy?: string | null;
  createdAt: string;
  Event?: {
    event_id: number;
    name: string;
    type: EventType;
    dueDate: string;
  };
  Team?: {
    team_id: number;
    name: string;
    groupNumber: string;
  };
  ApprovedByUser?: {
    users_id: string;
    firstname: string;
    lastname: string;
  };
}

export interface CreateEventInput {
  name: string;
  type: EventType;
  description?: string;
  order: number;
  dueDate: string;
  section_id: number;
  createSubmissionsForAllTeams?: boolean;
}

export interface UpdateEventInput {
  name?: string;
  type?: EventType;
  description?: string;
  order?: number;
  dueDate?: string;
}

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  PROGRESS_REPORT: "รายงานความก้าวหน้า",
  DOCUMENT: "เอกสาร",
  POSTER: "โปสเตอร์",
  EXAM: "การสอบ",
  FINAL_SUBMISSION: "ส่งฉบับสมบูรณ์",
  SEMINAR: "สัมมนา",
};

export const SUBMISSION_STATUS_LABELS: Record<SubmissionStatus, string> = {
  PENDING: "รอส่ง",
  SUBMITTED: "ส่งแล้ว",
  NEEDS_REVISION: "ต้องแก้ไข",
  APPROVED: "ผ่านแล้ว",
};

export const SUBMISSION_STATUS_COLORS: Record<SubmissionStatus, string> = {
  PENDING: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400",
  SUBMITTED:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  NEEDS_REVISION:
    "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
  APPROVED:
    "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
};
