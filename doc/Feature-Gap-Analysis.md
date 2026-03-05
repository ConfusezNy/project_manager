# 📋 Feature Gap Analysis - รายละเอียดสิ่งที่ต้องทำ

> **Document Version:** 4.0
> **Last Updated:** 2026-03-05

---

## 🎯 วัตถุประสงค์ 1.2.1: เว็บจัดการโครงงาน — ✅ DONE

- ✅ ระบบ Authentication (Login/Signup)
- ✅ ระบบ User Management (CRUD, Roles: ADMIN/ADVISOR/STUDENT)
- ✅ ระบบ Term/Section Management (12 endpoints, 8 components)
- ✅ ระบบ Team (สร้าง, เชิญ, ตอบรับ, ออกจากกลุ่ม — 12 components)
- ✅ ระบบ Project (สร้าง, แก้ไข, เลือกอาจารย์ที่ปรึกษา)
- ✅ Dashboard — Admin (StatCards, PieChart, BarChart)
- ✅ Dashboard — Advisor (TeamCards, progress %, approve/reject)
- ✅ Dashboard — Student (task stats, grades, schedule panel)
- ✅ Pre-Project → Project continuation (ContinueToProject API)

---

## 🎯 วัตถุประสงค์ 1.2.2: ติดตามความคืบหน้ารายสัปดาห์ — ✅ DONE

- ✅ Task CRUD API — `/tasks` (GET, POST), `/tasks/:id` (GET, PUT, DELETE)
- ✅ Task Assignment API — `/tasks/:id/assign` (POST)
- ✅ Task Comments API — `/tasks/:id/comments` (GET, POST)
- ✅ TaskBoard (Kanban) + TaskGanttChart
- ✅ TaskCard, TaskColumn, TaskDetailModal, TaskFormModal
- ✅ Event System (Admin + Advisor + Student pages)
- ✅ Submission System (SubmitModal + approve/reject)

---

## 🎯 วัตถุประสงค์ 1.2.3: อาจารย์ให้ข้อเสนอแนะ — ✅ DONE

- ✅ Comment Module (Standalone: CommentSection, CommentItem, CommentForm)
- ✅ Notification System (Enhanced dropdown, useNotifications hook, mark-as-read)
- ✅ Submission Approve/Reject — `/submissions/:id/approve`, `/submissions/:id/reject`
- ✅ Advisor Dashboard with pending submissions

---

## 🎯 วัตถุประสงค์ 1.2.4: ประเมินผลและจัดเกรด — ✅ DONE

- ✅ Grade CRUD API — `/grades` (GET, POST), `/grades/:id` (PATCH, DELETE)
- ✅ GradingPage (Admin) — `admin-grades/page.tsx`
- ✅ Student grade display — Dashboard grade section

---

## 🎯 วัตถุประสงค์ 1.2.5: ฐานข้อมูลค้นหา — ✅ DONE

- ✅ Search Page (`/Search`) + ProjectSearchDashboard
- ✅ Filter by Type, Year
- ✅ Archive toggle (`PATCH /projects/:id/archive`)
- ✅ Archive search (`GET /projects/archive`) with filters
- ✅ Archive filters API (`GET /projects/archive/filters`)
- ✅ **Advanced Search** — Filter by Advisor name (`advisor` query param)

---

## 🎯 วัตถุประสงค์ 1.2.6: ป้องกันโครงงานซ้ำซ้อน — ✅ DONE

- ✅ `POST /projects/check-similarity` — Keyword extraction + text similarity
- ✅ `ProjectFormModal.tsx` — เรียกใช้ API ตอนสร้าง/แก้ไข Project
- ✅ แสดง warning เมื่อพบโครงงานที่คล้ายกัน

---

## 🔴 สิ่งที่ยังขาด — ต้องทำเพิ่ม

### Gap 1: Notification System Backend — 🔴 Critical (scope §1.3.2.5)

- ❌ ไม่มี NestJS Notifications module (`server/src/notifications/`)
- ⚠️ `Notification` model มีใน Prisma schema แล้ว
- ⚠️ Frontend `useNotifications` hook ดึงข้อมูลจาก `/teams/pending-invites` เท่านั้น
- ❌ ต้องสร้าง API: `GET /notifications`, `PATCH /notifications/:id/read`, `PATCH /notifications/read-all`
- ❌ ต้องเพิ่ม notification triggers ใน: Tasks, Submissions, Grades, Projects, Teams

### Gap 2: Password Reset via Email — 🔴 Critical (scope §1.3.2.1)

- ❌ ไม่มี `POST /auth/forgot-password` หรือ `POST /auth/reset-password`
- ❌ ไม่มี email service (nodemailer/SMTP)
- ❌ ไม่มี frontend forgot/reset password page

### Gap 3: Report Export Integration — 🟡 Medium (scope §1.3.2.4)

- ✅ มี utility functions: `exportToExcel()`, `exportToPdf()`
- ❌ ยังไม่ได้เพิ่มปุ่ม Export ในหน้า Admin (sections, teams, submissions)

---

## 📊 สรุป Effort Estimation

| Category              | Items          | Status           |
| --------------------- | -------------- | ---------------- |
| **API Endpoints**     | 73 endpoints   | ✅ Done (NestJS) |
| **UI Components**     | 57 components  | ✅ Done          |
| **Hooks**             | 15 hooks       | ✅ Done          |
| **NestJS Migration**  | 13 modules     | ✅ Done          |
| **Frontend Integration** | API client  | ✅ Done          |
| **Type Safety**       | 0 `: any`      | ✅ Done          |
| **Similarity Check**  | §1.2.6         | ✅ Done          |
| **Advanced Search**   | §1.3.2(3)      | ✅ Done          |

### ❌ Remaining Items

| Item                 | Effort  | Priority |
| -------------------- | ------- | -------- |
| Notification System  | ~2-3 วัน | 🔴 Must Have (scope §1.3.2.5) |
| Password Reset Email | ~1-2 วัน | 🔴 Must Have (scope §1.3.2.1) |
| Report Export (UI)   | ~0.5-1 วัน | 🟡 Should Have (scope §1.3.2.4) |

---

## 📁 Related Documents

- [Module Status](./Module-Status.md) - สถานะ Module
- [Project Roadmap](./Project-Roadmap.md) - แผนพัฒนา
- [Technical Constitution](./Technical-Constitution.md) - Tech stack

---

> **Last Updated:** 2026-03-05
