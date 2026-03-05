# ⚙️ Backend & API Standards

> NestJS Backend Architecture และ API Reference (Updated: 2026-02-25)

---

## 🏗️ NestJS Module Structure

```
server/src/
├── auth/                 # Authentication (JWT + Passport) — 2 endpoints
│   ├── auth.module.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── jwt.strategy.ts
│   └── dto/
│       ├── login.dto.ts
│       └── signup.dto.ts
│
├── common/               # Shared Guards & Decorators
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   └── roles.guard.ts
│   └── decorators/
│       ├── roles.decorator.ts
│       └── current-user.decorator.ts
│
├── sections/             # Section Management (12 endpoints)
├── teams/                # Team Management (10 endpoints)
├── projects/             # Project Management (7 endpoints)
├── tasks/                # Task Management (9 endpoints)
├── events/               # Event Management (6 endpoints)
├── submissions/          # Submission Management (4 endpoints)
├── grades/               # Grade Management (4 endpoints)
├── users/                # User Management (5 endpoints)
├── advisors/             # Advisor Management (2 endpoints)
├── admin/                # Admin Team Management (9 endpoints)
├── terms/                # Term Management (2 endpoints)
├── profile/              # User Profile (1 endpoint)
│
├── prisma/               # Prisma Module (shared)
│   ├── prisma.module.ts
│   └── prisma.service.ts
│
└── main.ts               # Bootstrap
```

แต่ละ module มีโครงสร้าง:

```
sections/
├── sections.module.ts       # Module definition
├── sections.controller.ts   # HTTP handlers
├── sections.service.ts      # Business logic
└── dto/
    ├── create-section.dto.ts
    └── update-section.dto.ts
```

---

## 📋 API Design Rules

| Rule               | Description                                              |
| ------------------ | -------------------------------------------------------- |
| **RESTful**        | ใช้ HTTP methods ตามมาตรฐาน (GET, POST, PUT, PATCH, DELETE) |
| **Controllers**    | ใช้ NestJS `@Controller()` + decorators                  |
| **DTOs**           | ทุก input ต้องผ่าน DTO + class-validator                 |
| **Guards**         | ทุก protected endpoint ต้องมี `@UseGuards(JwtAuthGuard)` |
| **Services**       | Business logic อยู่ใน service เท่านั้น ไม่ใช่ controller   |
| **Transactions**   | Cascade operations ต้องใช้ `prisma.$transaction()`       |
| **Error Handling** | ใช้ NestJS built-in exceptions (`NotFoundException`, etc.) |

---

## 📤 API Response Format

### Success Response

```json
// Single item
{ "project_id": 1, "projectname": "AI Chat", "status": "APPROVED" }

// With message
{ "message": "สร้างทีมเรียบร้อย", "data": { ... } }

// List
[{ ... }, { ... }]
```

### Error Response (automatic via NestJS exceptions)

```json
{
  "statusCode": 400,
  "message": "team_id is required",
  "error": "Bad Request"
}
```

---

## 🔐 Authentication Flow

1. **Signup** → `POST /auth/signup` — hash password + create user
2. **Login** → `POST /auth/login` — validate credentials → return JWT
3. **Protected Request** → `Authorization: Bearer <token>` → JWT Guard validates
4. **Get Current User** → `@CurrentUser()` decorator extracts from JWT payload

```typescript
// JWT Payload
{
  users_id: "6600000000001",
  email: "student@example.com",
  role: "STUDENT"
}
```

---

## 📝 API Endpoints Reference

### Auth (`/auth`)

| Method | Endpoint         | Guard | Description         |
| ------ | ---------------- | ----- | ------------------- |
| POST   | `/auth/signup`   | —     | ลงทะเบียนผู้ใช้ใหม่ |
| POST   | `/auth/login`    | —     | เข้าสู่ระบบ → JWT   |

---

### Sections (`/sections`)

| Method | Endpoint                             | Guard        | Description                |
| ------ | ------------------------------------ | ------------ | -------------------------- |
| GET    | `/sections`                          | —¹           | รายการ sections ทั้งหมด    |
| POST   | `/sections`                          | Admin        | สร้าง section              |
| GET    | `/sections/my-section`               | Auth         | Section ที่ลงทะเบียน       |
| GET    | `/sections/:id`                      | —¹           | ข้อมูล section             |
| PATCH  | `/sections/:id`                      | Auth         | แก้ไข section settings     |
| DELETE | `/sections/:id`                      | Admin        | ลบ section                 |
| POST   | `/sections/:id/enroll`               | Admin        | ลงทะเบียนนักศึกษา         |
| GET    | `/sections/:id/enrollments`          | Auth         | รายชื่อที่ลงทะเบียน       |
| GET    | `/sections/:id/teams`                | Auth         | ทีมในหมู่เรียน             |
| GET    | `/sections/:id/available-students`   | Admin        | นักศึกษาที่ยังไม่มีทีม    |
| GET    | `/sections/:id/candidates`           | Auth         | ค้นหาผู้สมัครตามรหัส       |
| POST   | `/sections/:id/continue-to-project`  | Admin        | ต่อยอดเป็น Project section |

---

### Teams (`/teams`)

| Method | Endpoint                           | Guard   | Description       |
| ------ | ---------------------------------- | ------- | ----------------- |
| GET    | `/teams`                           | Auth    | ทีมทั้งหมด        |
| POST   | `/teams`                           | Student | สร้างทีม          |
| GET    | `/teams/my-team`                   | Auth    | ทีมของตนเอง       |
| POST   | `/teams/invite`                    | Auth    | เชิญสมาชิก        |
| POST   | `/teams/join`                      | Auth    | ตอบรับคำเชิญ      |
| POST   | `/teams/leave`                     | Auth    | ออกจากทีม         |
| POST   | `/teams/reject`                    | Auth    | ปฏิเสธคำเชิญ      |
| GET    | `/teams/pending-invites`           | Student | คำเชิญที่รอ       |
| PATCH  | `/teams/assign-name`               | Admin   | ตั้งชื่อทีม       |
| DELETE | `/teams/:id/members/:memberId`     | Auth    | ลบสมาชิกออกจากทีม |

---

### Projects (`/projects`)

| Method | Endpoint                    | Guard             | Description          |
| ------ | --------------------------- | ----------------- | -------------------- |
| GET    | `/projects`                 | Auth              | โครงงานของทีม        |
| POST   | `/projects`                 | Auth              | สร้างโครงงาน         |
| PUT    | `/projects/:id`             | Student           | แก้ไขโครงงาน         |
| DELETE | `/projects/:id`             | Student+TeamMember| ลบโครงงาน (ก่อน approve) |
| POST   | `/projects/:id/advisor`     | Student           | เพิ่มที่ปรึกษา       |
| DELETE | `/projects/:id/advisor`     | TeamMember        | ลบที่ปรึกษา (ก่อน approve) |
| PUT    | `/projects/:id/status`      | Advisor²          | อนุมัติ/ปฏิเสธโครงงาน |

---

### Tasks (`/tasks`)

| Method | Endpoint                  | Guard | Description      |
| ------ | ------------------------- | ----- | ---------------- |
| GET    | `/tasks`                  | Auth  | Tasks ของ project |
| POST   | `/tasks`                  | Auth  | สร้าง task       |
| GET    | `/tasks/:id`              | Auth  | ข้อมูล task      |
| PUT    | `/tasks/:id`              | Auth  | แก้ไข task       |
| DELETE | `/tasks/:id`              | Auth  | ลบ task          |
| POST   | `/tasks/:id/assign`       | Auth  | มอบหมายงาน       |
| DELETE | `/tasks/:id/assign`       | Auth  | ยกเลิกมอบหมาย    |
| GET    | `/tasks/:id/comments`     | Auth  | ดู comments      |
| POST   | `/tasks/:id/comments`     | Auth  | เพิ่ม comment    |

---

### Events (`/events`)

| Method | Endpoint       | Guard | Description    |
| ------ | -------------- | ----- | -------------- |
| GET    | `/events`      | Auth  | รายการ events   |
| POST   | `/events`      | Admin | สร้าง event    |
| GET    | `/events/:id`  | Auth  | ข้อมูล event   |
| PUT    | `/events/:id`  | Admin | แก้ไข event (full) |
| PATCH  | `/events/:id`  | Admin | แก้ไข event (partial) |
| DELETE | `/events/:id`  | Admin | ลบ event       |

---

### Submissions (`/submissions`)

| Method | Endpoint                       | Guard           | Description |
| ------ | ------------------------------ | --------------- | ----------- |
| GET    | `/submissions`                 | Auth            | ดู submissions |
| PATCH  | `/submissions/:id/submit`      | TeamMember/Admin| ส่งงาน      |
| PATCH  | `/submissions/:id/approve`     | Advisor/Admin   | อนุมัติ     |
| PATCH  | `/submissions/:id/reject`      | Advisor/Admin   | ขอแก้ไข     |

---

### Grades (`/grades`)

| Method | Endpoint       | Guard       | Description                   |
| ------ | -------------- | ----------- | ----------------------------- |
| GET    | `/grades`      | Admin/Self³ | ดูเกรด (by section=Admin, by student=Self) |
| POST   | `/grades`      | Admin       | บันทึกเกรด (batch)            |
| PATCH  | `/grades/:id`  | Admin       | แก้ไขเกรดรายคน                |
| DELETE | `/grades/:id`  | Admin       | ลบเกรด                       |

---

### Users (`/users`)

| Method | Endpoint          | Guard | Description |
| ------ | ----------------- | ----- | ----------- |
| GET    | `/users`          | Admin | ผู้ใช้ทั้งหมด |
| GET    | `/users/search`   | —¹    | ค้นหาผู้ใช้ (by id, students only) |
| GET    | `/users/:id`      | Auth  | ข้อมูลผู้ใช้ |
| PATCH  | `/users/:id`      | Auth  | แก้ไข       |
| DELETE | `/users/:id`      | Admin | ลบผู้ใช้    |

---

### Advisors (`/advisors`)

| Method | Endpoint                 | Guard   | Description           |
| ------ | ------------------------ | ------- | --------------------- |
| GET    | `/advisors/available`    | Auth    | อาจารย์ที่ว่างรับงาน |
| GET    | `/advisors/my-projects`  | Advisor | โครงงานที่ดูแล        |

---

### Admin Teams (`/admin/teams`)

| Method | Endpoint                                      | Guard | Description            |
| ------ | --------------------------------------------- | ----- | ---------------------- |
| GET    | `/admin/teams`                                | Admin | ทีมทั้งหมด + filter    |
| GET    | `/admin/teams/:teamId`                        | Admin | ข้อมูลทีม              |
| PUT    | `/admin/teams/:teamId`                        | Admin | แก้ไขทีม               |
| DELETE | `/admin/teams/:teamId`                        | Admin | ลบทีม (cascade)        |
| GET    | `/admin/teams/:teamId/members`                | Admin | สมาชิกในทีม            |
| POST   | `/admin/teams/:teamId/members`                | Admin | เพิ่มสมาชิก            |
| DELETE | `/admin/teams/:teamId/members/:memberId`      | Admin | ลบสมาชิก               |
| GET    | `/admin/teams/:teamId/available-members`      | Admin | นักศึกษาที่เพิ่มได้    |

---

### Terms (`/terms`)

| Method | Endpoint  | Guard | Description       |
| ------ | --------- | ----- | ----------------- |
| GET    | `/terms`  | —¹    | ภาคการศึกษาทั้งหมด |
| POST   | `/terms`  | —¹    | สร้างภาคการศึกษา (ควรเพิ่ม Admin guard) |

---

### Profile (`/profile`)

| Method | Endpoint    | Guard | Description        |
| ------ | ----------- | ----- | ------------------ |
| PATCH  | `/profile`  | Auth  | แก้ไขโปรไฟล์ตัวเอง (JWT) |

---

## 📌 Footnotes

| Symbol | Meaning |
| ------ | ------- |
| ¹ | Public endpoint (ไม่ต้อง auth) — ตั้งใจให้เข้าถึงได้ |
| ² | เฉพาะ Advisor ที่เป็นที่ปรึกษาของโครงงานนั้นเท่านั้น |
| ³ | GET by `section_id` = Admin only, GET by `student_id` = นักศึกษาดูได้เฉพาะของตัวเอง |

---

> **Last Updated:** 2026-02-25
