# 🎯 Implementation Plan: Event System

> **วันที่:** 2026-02-09  
> **ตัวเลือก:** 5 (2 ตารางใหม่: Event + Submission)

---

## 🗄️ Database Schema

```prisma
model Event {
  event_id      Int          @id @default(autoincrement())
  name          String       @db.VarChar(100)
  type          EventType
  description   String?
  order         Int
  dueDate       DateTime
  section_id    Int
  createdAt     DateTime     @default(now())

  Section       Section      @relation(...)
  Submission    Submission[]
}

model Submission {
  submission_id  Int              @id @default(autoincrement())
  event_id       Int
  team_id        Int
  status         SubmissionStatus @default(PENDING)
  submittedAt    DateTime?
  file           String?
  feedback       String?
  approvedAt     DateTime?
  approvedBy     String?          @db.VarChar(13)
  createdAt      DateTime         @default(now())

  Event          Event            @relation(...)
  Team           Team             @relation(...)
  ApprovedByUser Users?           @relation(...)
}

enum EventType {
  PROGRESS_REPORT  // รายงานความก้าวหน้า
  DOCUMENT         // เอกสาร (ขอสอบ, TOR)
  POSTER           // โปสเตอร์
  EXAM             // สอบ
  FINAL_SUBMISSION // ส่งฉบับสมบูรณ์
  SEMINAR          // สัมมนา
}

enum SubmissionStatus {
  PENDING          // ยังไม่ส่ง
  SUBMITTED        // ส่งแล้ว รอตรวจ
  NEEDS_REVISION   // ต้องแก้ไข
  APPROVED         // ผ่านแล้ว
}
```

---

## 🔌 API Endpoints

| Method | Endpoint                       | Role          | Description    |
| ------ | ------------------------------ | ------------- | -------------- |
| GET    | `/api/events?section_id=X`     | All           | ดู events      |
| POST   | `/api/events`                  | Admin         | สร้าง event    |
| PUT    | `/api/events/:id`              | Admin         | แก้ไข          |
| DELETE | `/api/events/:id`              | Admin         | ลบ             |
| GET    | `/api/submissions?event_id=X`  | Advisor/Admin | ดู submissions |
| PATCH  | `/api/submissions/:id/submit`  | Student       | ส่งงาน         |
| PATCH  | `/api/submissions/:id/approve` | Advisor       | อนุมัติ        |
| PATCH  | `/api/submissions/:id/reject`  | Advisor       | ขอแก้ไข        |

---

## ⏱️ Timeline: 4-5 วัน

| Phase | Days | Tasks            |
| ----- | ---- | ---------------- |
| 1     | 0.5  | Database migrate |
| 2     | 1.5  | API endpoints    |
| 3     | 2    | UI components    |
| 4     | 0.5  | Testing          |

---

> **Last Updated:** 2026-02-09
