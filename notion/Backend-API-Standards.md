# ⚙️ Backend & API Standards

> API Routes และ Response Format

---

## 📁 API Route Structure

```
src/app/api/
├── auth/                 # Authentication
│   ├── [...nextauth]/    # NextAuth.js Handler
│   └── signup/           # User Registration
├── users/                # User Management
│   └── [id]/             # Single User Operations
├── sections/             # Section (หมู่เรียน)
│   ├── [id]/
│   │   ├── enroll/       # ลงทะเบียน
│   │   ├── students/     # รายชื่อนักศึกษา
│   │   └── teams/        # ทีมในหมู่เรียน
│   ├── create/
│   └── my-section/
├── teams/                # Team Management
│   ├── [id]/
│   ├── invite/           # เชิญสมาชิก
│   ├── join/             # เข้าร่วมทีม
│   ├── leave/            # ออกจากทีม
│   ├── my-team/
│   ├── pending-invites/
│   └── reject/
├── projects/             # Project Management
│   └── [id]/
│       └── advisors/     # อาจารย์ที่ปรึกษา
├── terms/                # Term (ภาคการศึกษา)
├── advisors/             # Advisor List
└── profile/              # User Profile
```

---

## 📋 API Design Rules

| Rule               | Description                                          |
| ------------------ | ---------------------------------------------------- |
| **RESTful**        | ใช้ HTTP methods ตามมาตรฐาน (GET, POST, PUT, DELETE) |
| **Route Handlers** | ใช้ `route.ts` สำหรับ API endpoints                  |
| **Authentication** | ทุก endpoint ต้องตรวจสอบ session (ยกเว้น public)     |
| **Validation**     | ตรวจสอบ input ก่อนประมวลผลเสมอ                       |
| **Error Handling** | Return error response ที่ชัดเจน                      |

---

## 📤 API Response Format

### Success Response

```typescript
{
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response

```typescript
{
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

---

## 🔐 Authentication Flow

1. **Login** → `/api/auth/signin`
2. **Session Check** → `getServerSession(authOptions)`
3. **Protected Routes** → ตรวจ session ก่อนดำเนินการ
4. **Logout** → `/api/auth/signout`

---

## 📝 API Endpoints Summary

### Auth

| Method | Endpoint            | Description         |
| ------ | ------------------- | ------------------- |
| POST   | `/api/auth/signup`  | ลงทะเบียนผู้ใช้ใหม่ |
| POST   | `/api/auth/signin`  | เข้าสู่ระบบ         |
| POST   | `/api/auth/signout` | ออกจากระบบ          |
| GET    | `/api/auth/session` | ดูข้อมูล session    |

### Sections

| Method | Endpoint                    | Description     |
| ------ | --------------------------- | --------------- |
| GET    | `/api/sections`             | รายการ sections |
| POST   | `/api/sections/create`      | สร้าง section   |
| GET    | `/api/sections/[id]`        | ข้อมูล section  |
| PUT    | `/api/sections/[id]`        | แก้ไข section   |
| DELETE | `/api/sections/[id]`        | ลบ section      |
| POST   | `/api/sections/[id]/enroll` | ลงทะเบียน       |

### Teams

| Method | Endpoint                     | Description |
| ------ | ---------------------------- | ----------- |
| GET    | `/api/teams`                 | รายการทีม   |
| POST   | `/api/teams`                 | สร้างทีม    |
| GET    | `/api/teams/my-team`         | ทีมของตนเอง |
| POST   | `/api/teams/invite`          | เชิญสมาชิก  |
| POST   | `/api/teams/join`            | เข้าร่วมทีม |
| POST   | `/api/teams/leave`           | ออกจากทีม   |
| GET    | `/api/teams/pending-invites` | คำเชิญที่รอ |

### Projects

| Method | Endpoint                      | Description    |
| ------ | ----------------------------- | -------------- |
| GET    | `/api/projects`               | รายการโครงงาน  |
| POST   | `/api/projects`               | สร้างโครงงาน   |
| GET    | `/api/projects/[id]`          | ข้อมูลโครงงาน  |
| PUT    | `/api/projects/[id]`          | แก้ไขโครงงาน   |
| POST   | `/api/projects/[id]/advisors` | เพิ่มที่ปรึกษา |
