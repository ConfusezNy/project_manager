# 📋 Feature Gap Analysis - รายละเอียดสิ่งที่ต้องทำ

> **Document Version:** 1.0  
> **Last Updated:** 2026-01-28

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

### 🔴 สิ่งที่ยังขาด

#### API ที่ต้องสร้าง

```typescript
// 1. Task CRUD
POST   /api/tasks              - สร้าง Task
GET    /api/tasks?project_id=X - ดู Tasks ของ Project
PUT    /api/tasks/:id          - แก้ไข Task
DELETE /api/tasks/:id          - ลบ Task

// 2. Task Assignment
POST   /api/tasks/:id/assign   - มอบหมายให้สมาชิก
DELETE /api/tasks/:id/assign/:userId - ยกเลิกมอบหมาย

// 3. Weekly Progress
POST   /api/progress           - ส่งรายงานประจำสัปดาห์
GET    /api/progress?project_id=X&week=Y - ดูรายงาน
```

#### UI ที่ต้องสร้าง

| Component    | ไฟล์                                       | หน้าที่          |
| ------------ | ------------------------------------------ | ---------------- |
| TaskBoard    | `modules/task/components/TaskBoard.tsx`    | Kanban Board     |
| TaskCard     | `modules/task/components/TaskCard.tsx`     | แสดง Task        |
| TaskForm     | `modules/task/components/TaskForm.tsx`     | สร้าง/แก้ไข Task |
| WeeklyReport | `modules/task/components/WeeklyReport.tsx` | ฟอร์มส่งรายงาน   |
| ProgressView | `modules/task/components/ProgressView.tsx` | ดูความคืบหน้า    |

---

## 🎯 วัตถุประสงค์ 1.2.3: อาจารย์ให้ข้อเสนอแนะ

### ✅ สิ่งที่มีแล้ว

- Comment Model ใน Database
- Notification System

### 🔴 สิ่งที่ยังขาด

#### API ที่ต้องสร้าง

```typescript
// Comment CRUD
POST   /api/comments           - สร้าง Comment
GET    /api/comments?task_id=X - ดู Comments ของ Task
PUT    /api/comments/:id       - แก้ไข Comment
DELETE /api/comments/:id       - ลบ Comment
PATCH  /api/comments/:id/read  - Mark as Read
```

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
- GradeScore Enum (A, A+, B, B+, C, C+, D, D+)
- Relation: Grade → Project, Student, Evaluator, Term

### 🔴 สิ่งที่ยังขาด

#### API ที่ต้องสร้าง

```typescript
// Grade Management
POST   /api/grades             - บันทึกเกรด
GET    /api/grades?project_id=X - ดูเกรดของ Project
GET    /api/grades/my-grades   - นักศึกษาดูเกรดตัวเอง
PUT    /api/grades/:id         - แก้ไขเกรด
DELETE /api/grades/:id         - ลบเกรด

// Reports
GET    /api/grades/report?term_id=X - Export รายงานเกรด
```

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
PATCH  /api/projects/:id/archive - เปลี่ยนสถานะเป็น Archived

// Advanced Search
GET    /api/projects/search?q=X&type=Y&year=Z&advisor=W
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
POST   /api/projects/check-similarity
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

| Category          | Items          | Estimated Days |
| ----------------- | -------------- | -------------- |
| **API Endpoints** | ~15 endpoints  | 4-5 days       |
| **UI Components** | ~20 components | 7-10 days      |
| **Pages**         | ~5 pages       | 3-4 days       |
| **Testing**       | Unit + E2E     | 2-3 days       |
| **Total**         |                | **16-22 days** |

---

## 🔧 Technical Dependencies

### NPM Packages ที่อาจต้องเพิ่ม

```bash
# For Kanban Drag & Drop
npm install @dnd-kit/core @dnd-kit/sortable

# For PDF Export (Optional)
npm install jspdf jspdf-autotable

# For Excel Export
npm install xlsx

# For Text Similarity (Optional - Backend)
npm install string-similarity
```

---

## 📋 Checklist Summary

### Must Have (MVP)

- [ ] Task CRUD API + UI
- [ ] Comment CRUD API + UI
- [ ] Grade CRUD API + UI
- [ ] Weekly Progress Form

### Should Have

- [ ] Kanban Board
- [ ] Notification Enhancement
- [ ] Archive Feature
- [ ] Report Export

### Nice to Have

- [ ] Similarity Check
- [ ] Email Notifications
- [ ] Mobile Responsive Polish
