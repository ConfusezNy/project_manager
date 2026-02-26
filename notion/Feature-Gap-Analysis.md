# 📋 Feature Gap Analysis - รายละเอียดสิ่งที่ต้องทำ

> **Document Version:** 3.0
> **Last Updated:** 2026-02-25

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

## 🎯 วัตถุประสงค์ 1.2.5: ฐานข้อมูลค้นหา — ✅ DONE (partial)

### ✅ สิ่งที่มีแล้ว

- ✅ Search Page (`/Search`) + ProjectSearchDashboard
- ✅ Filter by Type, Year
- ✅ Archive toggle (`PATCH /projects/:id/archive`)
- ✅ Archive search (`GET /projects/archive`) with filters
- ✅ Archive filters API (`GET /projects/archive/filters`)

### 🔴 สิ่งที่ยังขาด

- [ ] **Advanced Search** — Filter by Advisor name (ค้นหาด้วยชื่ออาจารย์)
- [ ] **Report Export** — ส่งออกรายงาน Excel/PDF

---

## 🎯 วัตถุประสงค์ 1.2.6: ป้องกันโครงงานซ้ำซ้อน — 🔴 TODO

### 🔴 สิ่งที่ต้องสร้างใหม่ทั้งหมด

#### API ที่ต้องสร้าง

```typescript
// Similarity Check
POST   /projects/check-similarity
Body: { title: string, description?: string }
Response: {
  similar_projects: Array<{
    project_id: number,
    title: string,
    similarity_score: number
  }>
}
```

#### Logic ที่ต้องสร้าง

1. **Keyword Extraction** - แยก keywords จากชื่อโครงงาน
2. **Text Similarity** - เปรียบเทียบความคล้าย
3. **Threshold Warning** - แจ้งเตือนเมื่อคล้าย > 70%

#### UI ที่ต้องสร้าง

| Component           | หน้าที่                             |
| ------------------- | ----------------------------------- |
| SimilarityWarning   | แสดงโครงงานที่คล้ายตอนสร้าง Project |
| SimilarProjectsList | รายการโครงงานที่เกี่ยวข้อง          |

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

### ❌ Remaining Items

| Item                 | Effort  | Priority |
| -------------------- | ------- | -------- |
| Similarity Check     | ~1-2 วัน | Must Have (scope §1.2.6) |
| Advanced Search      | ~0.5 วัน | Should Have (scope §1.3.2) |
| Report Export         | ~1-2 วัน | Should Have (scope §1.3.1) |

---

## 📁 Related Documents

- [Module Status](./Module-Status.md) - สถานะ Module
- [Project Roadmap](./Project-Roadmap.md) - แผนพัฒนา
- [Technical Constitution](./Technical-Constitution.md) - Tech stack

---

> **Last Updated:** 2026-02-25
