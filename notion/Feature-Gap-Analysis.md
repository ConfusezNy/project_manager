# 📋 Feature Gap Analysis - รายละเอียดสิ่งที่ต้องทำ

> **Document Version:** 2.0
> **Last Updated:** 2026-02-19

---

## 🎯 วัตถุประสงค์ 1.2.1: เว็บจัดการโครงงาน

### ✅ สิ่งที่มีแล้ว

- ระบบ Authentication (Login/Signup)
- ระบบ User Management (CRUD, Roles: ADMIN/ADVISOR/STUDENT)
- ระบบ Term/Section Management
- ระบบ Team (สร้าง, เชิญ, ตอบรับ, ออกจากกลุ่ม)
- ระบบ Project (สร้าง, แก้ไข, เลือกอาจารย์ที่ปรึกษา)
- ระบบ Timeline (ดูสัปดาห์การเรียน)

### 🔴 สิ่งที่ยังขาด

- [ ] หน้า Dashboard รวมสถานะโครงการ (Student)
- [ ] หน้า Dashboard รวมโครงการที่ดูแล (Advisor)
- [ ] การเชื่อมต่อ Pre-Project → Project อัตโนมัติ

---

## 🎯 วัตถุประสงค์ 1.2.2: ติดตามความคืบหน้ารายสัปดาห์

### ✅ สิ่งที่มีแล้ว

- Timeline Component (แสดงสัปดาห์)
- Task Model ใน Database
- TaskAssignment Model
- ✅ **Task CRUD API** — `/tasks` (GET, POST), `/tasks/:id` (GET, PUT, DELETE)
- ✅ **Task Assignment API** — `/tasks/:id/assign` (POST)
- ✅ **Task Comments API** — `/tasks/:id/comments` (GET, POST)

### 🔴 สิ่งที่ยังขาด

#### UI ที่ต้องสร้าง

| Component    | ไฟล์                                       | หน้าที่          | Status |
| ------------ | ------------------------------------------ | ---------------- | ------ |
| TaskBoard    | `modules/task/components/TaskBoard.tsx`    | Kanban Board     | 🔄     |
| TaskCard     | `modules/task/components/TaskCard.tsx`     | แสดง Task        | 🔄     |
| TaskForm     | `modules/task/components/TaskForm.tsx`     | สร้าง/แก้ไข Task | ⏳     |
| WeeklyReport | `modules/task/components/WeeklyReport.tsx` | ฟอร์มส่งรายงาน   | ⏳     |
| ProgressView | `modules/task/components/ProgressView.tsx` | ดูความคืบหน้า    | ⏳     |

---

## 🎯 วัตถุประสงค์ 1.2.3: อาจารย์ให้ข้อเสนอแนะ

### ✅ สิ่งที่มีแล้ว

- Comment Model ใน Database
- Notification System
- ✅ **Task Comment API** — `/tasks/:id/comments` (GET, POST)
- ✅ **Submission Approve/Reject** — `/submissions/:id/approve`, `/submissions/:id/reject`

### 🔴 สิ่งที่ยังขาด

#### UI ที่ต้องสร้าง

| Component      | ไฟล์                                            | หน้าที่            |
| -------------- | ----------------------------------------------- | ------------------ |
| CommentSection | `modules/comment/components/CommentSection.tsx` | แสดง/เพิ่ม Comment |
| CommentItem    | `modules/comment/components/CommentItem.tsx`    | แสดง Comment เดียว |
| CommentForm    | `modules/comment/components/CommentForm.tsx`    | ฟอร์มเขียน Comment |

---

## 🎯 วัตถุประสงค์ 1.2.4: ประเมินผลและจัดเกรด

### ✅ สิ่งที่มีแล้ว

- Grade Model ใน Database
- GradeScore Enum (A, B_PLUS, B, C_PLUS, C, D_PLUS, D, F)
- Relation: Grade → Project, Student, Evaluator, Term
- ✅ **Grade CRUD API** — `/grades` (GET, POST), `/grades/:id` (PATCH, DELETE)

### 🔴 สิ่งที่ยังขาด

#### UI ที่ต้องสร้าง

| Component   | ไฟล์                                       | หน้าที่        |
| ----------- | ------------------------------------------ | -------------- |
| GradingPage | `app/(advisor)/grading/page.tsx`           | หน้าให้เกรด    |
| GradingForm | `modules/grade/components/GradingForm.tsx` | ฟอร์มให้เกรด   |
| GradeCard   | `modules/grade/components/GradeCard.tsx`   | แสดงเกรด       |
| GradeReport | `modules/grade/components/GradeReport.tsx` | ตารางเกรด      |
| MyGrades    | `modules/grade/components/MyGrades.tsx`    | นักศึกษาดูเกรด |

---

## 🎯 วัตถุประสงค์ 1.2.5: ฐานข้อมูลค้นหา

### ✅ สิ่งที่มีแล้ว

- Search Page (`/Search`)
- ProjectCard Component
- Filter by Type, Year

### 🔴 สิ่งที่ยังขาด

#### API Enhancement

```typescript
// Archive
PATCH  /projects/:id/archive - เปลี่ยนสถานะเป็น Archived

// Advanced Search
GET    /projects/search?q=X&type=Y&year=Z&advisor=W
```

#### UI ที่ต้องเพิ่ม

| Feature              | หน้าที่                        |
| -------------------- | ------------------------------ |
| Archive Status Badge | แสดง "จัดเก็บแล้ว"             |
| Advanced Filter      | Filter by Advisor, Section     |
| Project Detail Page  | `/projects/:id` หน้ารายละเอียด |
| Download Button      | ดาวน์โหลดรายงานโครงงาน         |

---

## 🎯 วัตถุประสงค์ 1.2.6: ป้องกันโครงงานซ้ำซ้อน

### ✅ สิ่งที่มีแล้ว

- ไม่มี

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

| Category              | Items          | Status         |
| --------------------- | -------------- | -------------- |
| **API Endpoints**     | ~63 endpoints  | ✅ Code exists, migrating to NestJS |
| **UI Components**     | ~20 components | ⚠️ ~40% done   |
| **Pages**             | ~5 pages       | ⚠️ Partial      |
| **NestJS Migration**  | 12 modules     | 🔄 In Progress |
| **Testing**           | Unit + E2E     | 🔴 TODO         |

---

## 🔧 Technical Dependencies

### NestJS Backend (New)

```bash
npm install @nestjs/core @nestjs/common @nestjs/platform-express
npm install @nestjs/jwt @nestjs/passport passport passport-jwt
npm install @nestjs/config
npm install class-validator class-transformer
npm install @prisma/client prisma
npm install bcryptjs
```

### Frontend (Existing)

```bash
# For Kanban Drag & Drop
npm install @dnd-kit/core @dnd-kit/sortable

# For PDF Export (Optional)
npm install jspdf jspdf-autotable

# For Excel Export
npm install xlsx
```

---

## 📋 Checklist Summary

### Must Have (MVP)

- [x] Task CRUD API ✅
- [x] Comment API (via Task) ✅
- [x] Grade CRUD API ✅
- [x] Event/Submission API ✅
- [/] NestJS Backend Migration 🔄
- [ ] Task Board UI (Kanban)
- [ ] Grading UI
- [ ] Frontend API Integration

### Should Have

- [ ] Kanban Board (Drag & Drop)
- [ ] Notification Enhancement
- [ ] Archive Feature
- [ ] Report Export

### Nice to Have

- [ ] Similarity Check
- [ ] Email Notifications
- [ ] Mobile Responsive Polish
