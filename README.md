# 🎓 Project Management System

> ระบบบริหารจัดการโครงงานนักศึกษาแบบครบวงจร | Comprehensive Student Project Management System

## 📋 สารบัญ | Table of Contents

- [ภาพรวมโครงการ | Project Overview](#-ภาพรวมโครงการ--project-overview)
- [ฟีเจอร์หลัก | Key Features](#-ฟีเจอร์หลัก--key-features)
- [สถาปัตยกรรมระบบ | System Architecture](#-สถาปัตยกรรมระบบ--system-architecture)
- [เทคโนโลยี | Tech Stack](#-เทคโนโลยี--tech-stack)
- [การติดตั้ง | Installation](#-การติดตั้ง--installation)
- [การตั้งค่า | Configuration](#-การตั้งค่า--configuration)
- [โครงสร้างโปรเจค | Project Structure](#-โครงสร้างโปรเจค--project-structure)
- [Database Schema](#-database-schema)
- [API Endpoints](#-api-endpoints)
- [การใช้งาน | Usage](#-การใช้งาน--usage)
- [Deployment](#-deployment)
- [Development](#-development)

---

## 🎯 ภาพรวมโครงการ | Project Overview

ระบบบริหารจัดการโครงงานนักศึกษาเป็นแพลตฟอร์มแบบ Client-Server ที่พัฒนาด้วย **Next.js 14** (Frontend) + **NestJS 11** (Backend) และ **PostgreSQL** โดยออกแบบมาเพื่อจัดการโครงงานของนักศึกษาในระดับมหาวิทยาลัยอย่างมีประสิทธิภาพ รองรับการทำงานของ 3 บทบาทหลัก: **นักศึกษา (Student)**, **อาจารย์ที่ปรึกษา (Advisor)** และ **ผู้ดูแลระบบ (Admin)**

**Project Management System** is a comprehensive client-server platform built with **Next.js 14** (Frontend) + **NestJS 11** (Backend) and **PostgreSQL**, designed to efficiently manage university student projects. It supports three main roles: **Students**, **Advisors**, and **Administrators**.

### 🎯 วัตถุประสงค์ | Objectives

- ✅ จัดการโครงงานนักศึกษาแบบ Pre-Project และ Project
- ✅ ติดตามความคืบหน้าของงานแบบ Real-time
- ✅ รองรับการทำงานเป็นทีมและการมอบหมายงาน
- ✅ ระบบประเมินผลและให้คะแนนอัตโนมัติ
- ✅ การแจ้งเตือนและการสื่อสารภายในทีม
- ✅ รองรับการเข้าถึงด้วยบทบาทต่างๆ (Role-Based Access)

---

## 🚀 ฟีเจอร์หลัก | Key Features

### 👨‍🎓 สำหรับนักศึกษา | For Students
- 📝 สร้างและจัดการโครงงาน
- 👥 สร้างทีมและเชิญสมาชิก
- ✅ จัดการงานและจัดส่งเอกสารตามกำหนดการ
- 💬 แสดงความคิดเห็นและอัปโหลดไฟล์แนบ
- 🔔 รับการแจ้งเตือนแบบ Real-time
- 📱 ดูเกรดและผลการประเมิน

### 👨‍🏫 สำหรับอาจารย์ | For Advisors
- 📋 ดูโครงการที่รับผิดชอบทั้งหมด
- 🌟 ตั้งค่าความเชี่ยวชาญ (Expertise Areas) เพื่อให้นักศึกษาค้นหาได้ง่าย
- 💯 ประเมินผลและให้เกรดนักศึกษา
- 📈 ติดตามความคืบหน้าของทีมและกำหนดการส่งงาน
- 📝 ให้คำแนะนำและ Feedback
- 📊 ดูสรุปรายงานภาพรวม

### 👨‍💼 สำหรับผู้ดูแลระบบ | For Administrators
- 🏫 จัดการหมู่เรียน (Sections) และภาคการศึกษา (Terms)
- 👥 จัดการผู้ใช้งานทั้งหมด
- 📊 ดูสถิติและรายงานภาพรวม
- ⚙️ ตั้งค่าระบบและกำหนดสิทธิ์

---

## 🏗️ สถาปัตยกรรมระบบ | System Architecture

```
┌─────────────────────────────────────────────────┐
│       Frontend (Next.js 14 App Router)          │
│  ┌──────────┬──────────┬──────────┬──────────┐ │
│  │  Admin   │ Advisor  │ Student  │  Public  │ │
│  │Dashboard │Dashboard │Dashboard │  Pages   │ │
│  └──────────┴──────────┴──────────┴──────────┘ │
│              ↓                                   │
│        API Client (fetch + JWT Bearer Token)    │
└────────────────┬────────────────────────────────┘
                 │ HTTP
                 ↓
┌────────────────┴────────────────────────────────┐
│            Backend (NestJS 11)                  │
│  ┌──────────────────────────────────────────┐   │
│  │    Passport.js + JWT Authentication      │   │
│  │    Guards, Decorators, DTOs              │   │
│  └──────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────┐   │
│  │    12 Modules (sections, teams, etc.)    │   │
│  └──────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────┐   │
│  │    Prisma ORM 6.x (Type-safe queries)    │   │
│  └──────────────────────────────────────────┘   │
└────────────────┬────────────────────────────────┘
                 │
                 ↓
┌────────────────┴────────────────────────────────┐
│         Database (PostgreSQL 15)                │
│  Users │ Teams │ Projects │ Tasks │ Events      │
│  Sections │ Terms │ Grades │ Submissions        │
└─────────────────────────────────────────────────┘
```

---

## 🛠️ เทคโนโลยี | Tech Stack

### Frontend (Next.js)
| Technology | Version | Purpose |
|-----------|---------|---------|
| **Next.js** | 14.2.x | React Framework with App Router |
| **React** | 18.2.0 | UI Library |
| **TypeScript** | 5.x | Type Safety |
| **Tailwind CSS** | 3.4.x | Utility-first CSS |
| **Material-UI** | 7.x | Component Library |
| **Lucide React** | 0.469.x | Icon Library |
| **React Hook Form** | 7.x | Form Management |
| **Next Themes** | 0.4.x | Dark Mode Support |

### Backend (NestJS)
| Technology | Version | Purpose |
|-----------|---------|---------|
| **NestJS** | 11.x | Backend Framework |
| **Passport.js** | 0.7.x | Authentication Strategy |
| **@nestjs/jwt** | 11.x | JWT Token Management |
| **Prisma ORM** | 6.x | Database ORM |
| **class-validator** | 0.14.x | DTO Validation |
| **bcryptjs** | 3.x | Password Hashing |
| **PostgreSQL** | 15-alpine | Relational Database |

### Data Visualization & UI Components
| Library | Purpose |
|---------|---------|
| **Recharts** | 📊 Charts and Analytics |
| **Gantt Task React** | 📅 Gantt Chart for Timeline |
| **React DnD** | 🎯 Drag & Drop for Kanban |
| **Date-fns** | 📅 Date Formatting |

### DevOps & Tools
| Tool | Purpose |
|------|---------|
| **Docker** | 🐳 Containerization |
| **Docker Compose** | 🔧 Multi-container Orchestration |
| **Node.js** | 22.x LTS Runtime |
| **ESLint** | ✅ Code Linting |

---

## 📦 การติดตั้ง | Installation

### ✅ Prerequisites

ต้องติดตั้งโปรแกรมเหล่านี้ก่อน | Required installations:

- **Node.js** >= 18.x
- **npm** or **yarn** or **pnpm**
- **Docker** & **Docker Compose** (สำหรับ Development)
- **PostgreSQL** 15+ (หรือใช้ Docker)

### 🚀 Installation Steps

#### 1. Clone Repository

```bash
git clone https://github.com/ConfusezNy/project_manager.git
cd project_manager
```

#### 2. Install Dependencies

```bash
# Frontend
cd client
npm install

# Backend
cd ../server
npm install
```

#### 3. Setup Environment Variables

สร้างไฟล์ `.env` ในโฟลเดอร์ `server/`:

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/projectmanagement"

# JWT
JWT_SECRET="your-jwt-secret-key"
JWT_EXPIRES_IN="7d"

# Server
PORT=4000
```

สร้างไฟล์ `.env` ในโฟลเดอร์ `client/`:

```env
# API
NEXT_PUBLIC_API_URL="http://localhost:4000"
```

#### 4. Database Setup

**Option A: ใช้ Docker Compose (แนะนำ)**
```bash
# ที่ root directory
docker-compose up -d
```

**Option B: Manual Setup**
```bash
createdb projectmanagement
cd server
npx prisma migrate deploy
npx prisma generate
```

#### 5. Start Development Servers

```bash
# Terminal 1: Backend
cd server
npm run start:dev

# Terminal 2: Frontend
cd client
npm run dev
```

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:4000](http://localhost:4000)

---

## ⚙️ การตั้งค่า | Configuration

### 🔐 Environment Variables

| Variable | Location | Description | Required |
|----------|----------|-------------|----------|
| `DATABASE_URL` | server/.env | PostgreSQL connection string | ✅ |
| `JWT_SECRET` | server/.env | Secret key for JWT tokens | ✅ |
| `JWT_EXPIRES_IN` | server/.env | JWT expiration (e.g. "7d") | ✅ |
| `PORT` | server/.env | NestJS server port (default: 4000) | ✅ |
| `NEXT_PUBLIC_API_URL` | client/.env | NestJS backend URL | ✅ |

### 🗄️ Database Migration

```bash
# สร้าง migration ใหม่
npx prisma migrate dev --name migration_name

# Deploy migrations to production
npx prisma migrate deploy

# Reset database (ระวัง: จะลบข้อมูลทั้งหมด!)
npx prisma migrate reset

# Open Prisma Studio (GUI สำหรับดูข้อมูล)
npx prisma studio
```

---

## 📁 โครงสร้างโปรเจค | Project Structure

```
project_manager/
├── docker-compose.yml          # Docker: PostgreSQL + NestJS + Next.js
├── README.md                   # Documentation
├── notion/                     # Project documentation
│
├── server/                     # NestJS Backend
│   ├── src/
│   │   ├── auth/              # JWT + Passport authentication
│   │   ├── sections/          # Section management (11 endpoints)
│   │   ├── teams/             # Team management (12 endpoints)
│   │   ├── projects/          # Project management (6 endpoints)
│   │   ├── tasks/             # Task management (7 endpoints)
│   │   ├── events/            # Event management (5 endpoints)
│   │   ├── submissions/       # Submission management (4 endpoints)
│   │   ├── grades/            # Grade management (4 endpoints)
│   │   ├── users/             # User management (4 endpoints)
│   │   ├── advisors/          # Advisor management (2 endpoints)
│   │   ├── admin/             # Admin team management (5 endpoints)
│   │   ├── terms/             # Term management (2 endpoints)
│   │   ├── profile/           # Profile management (1 endpoint)
│   │   └── prisma/            # Shared Prisma module
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   └── migrations/        # Database migrations
│   └── package.json
│
└── client/                     # Next.js Frontend
    ├── src/
    │   ├── app/
    │   │   ├── (admin)/       # Admin dashboard pages
    │   │   ├── (advisor)/     # Advisor dashboard pages
    │   │   ├── (student)/     # Student dashboard pages
    │   │   └── (publlic)/     # Public pages (signin/signup)
    │   ├── modules/           # Feature modules (UI components)
    │   ├── shared/            # Shared components & utils
    │   └── lib/
    │       └── api.ts         # API client (→ NestJS backend)
    ├── Dockerfile
    ├── package.json
    └── tailwind.config.ts
```

---

## 🗄️ Database Schema

### 📊 Main Entities

#### Users (ผู้ใช้งาน)
```prisma
- users_id (PK)      # รหัสนักศึกษา/อาจารย์ (13 หลัก)
- role               # ADMIN | ADVISOR | STUDENT
- firstname, lastname
- email (unique)
- passwordHash
- profilePicture
```

#### Term (ภาคการศึกษา)
```prisma
- term_id (PK)
- academicYear       # ปีการศึกษา
- semester           # ภาคเรียน (1/2/3)
- startDate, endDate
```

#### Section (หมู่เรียน)
```prisma
- section_id (PK)
- section_code       # PRE-66-01
- course_type        # PRE_PROJECT | PROJECT
- study_type         # REG | LE
- min_team_size, max_team_size
- project_deadline, team_deadline
- term_id (FK)
```

#### Team (ทีมโครงงาน)
```prisma
- team_id (PK)
- teamname           # A, B, C...
- section_id (FK)
- members[] (Teammember)
```

#### Project (โครงงาน)
```prisma
- project_id (PK)
- projectname, projectnameEng
- description
- status, project_type
- team_id (FK, unique)
```

#### Task (งานย่อย)
```prisma
- task_id (PK)
- title, description
- status             # TODO | IN_PROGRESS | COMPLETED
- priority           # LOW | MEDIUM | HIGH
- startDate, dueDate
- project_id (FK)
```

#### Grade (เกรด)
```prisma
- grade_id (PK)
- student_id (FK)
- project_id (FK)
- evaluator_id (FK)
- score              # A | A_PLUS | B | B_PLUS...
```

### 🔗 Relationships

```
Users 1:N SectionEnrollment N:1 Section 1:N Team
Team 1:N Teammember N:1 Users
Team 1:1 Project
Project 1:N Task 1:N TaskAssignment N:1 Users
Project N:M ProjectAdvisor (Users as Advisor)
Users 1:N Grade (as Student)
Users 1:N Grade (as Evaluator)
```

---

## 🌐 API Endpoints

> ดูรายละเอียดทั้งหมดได้ที่ [Backend-API-Standards.md](./notion/Backend-API-Standards.md)

### Authentication
```
POST   /auth/signup              # ลงทะเบียนผู้ใช้ใหม่
POST   /auth/login               # เข้าสู่ระบบ → JWT
```

### Sections (หมู่เรียน) — 11 endpoints
```
GET    /sections                 # รายการ sections ทั้งหมด
POST   /sections                 # สร้าง section (Admin)
GET    /sections/:id             # ข้อมูล section
PATCH  /sections/:id             # แก้ไข section
DELETE /sections/:id             # ลบ section (Admin)
POST   /sections/:id/enroll      # ลงทะเบียนนักศึกษา
```

### Teams (ทีม) — 10 endpoints
```
GET    /teams                    # ทีมทั้งหมด
POST   /teams                    # สร้างทีม (Student)
GET    /teams/my-team            # ทีมของตนเอง
POST   /teams/invite             # เชิญสมาชิก
POST   /teams/join               # ตอบรับคำเชิญ
POST   /teams/leave              # ออกจากทีม
```

### Projects / Tasks / Events / Grades / Users
```
→ ดู Backend-API-Standards.md สำหรับ endpoints ทั้งหมด (63 endpoints)
```

---

## 🎮 การใช้งาน | Usage

### 👨‍💼 Admin Dashboard
1. เข้าสู่ระบบด้วยบัญชี Admin
2. จัดการภาคการศึกษา (Terms)
3. สร้างหมู่เรียน (Sections)
4. จัดการผู้ใช้งาน
5. ดูรายงานภาพรวม

### 👨‍🎓 Student Workflow
1. เข้าสู่ระบบด้วยรหัสนักศึกษา
2. ลงทะเบียนหมู่เรียน
3. สร้างหรือเข้าร่วมทีม
4. สร้างโครงงาน
5. จัดการงานด้วย Kanban Board
6. ติดตามความคืบหน้า
7. ส่งงานและรับเกรด

### 👨‍🏫 Advisor Workflow
1. เข้าสู่ระบบด้วยบัญชีอาจารย์
2. ดูโครงการที่รับผิดชอบ
3. ติดตามความคืบหน้าของทีม
4. ให้คำแนะนำและ Feedback
5. ประเมินผลและให้เกรด

---

## 🚢 Deployment

### 🐳 Docker Deployment (แนะนำ)

#### Production Build
```bash
# Build และ run ด้วย Docker Compose
docker-compose up -d --build

# หยุดการทำงาน
docker-compose down

# ดู logs
docker-compose logs -f server
docker-compose logs -f client
```

#### Environment Variables for Production
```env
# Server
DATABASE_URL="postgresql://postgres:password@postgres:5432/projectmanagement"
JWT_SECRET="<generate-secure-secret>"
JWT_EXPIRES_IN="7d"
PORT=4000
NODE_ENV="production"

# Client
NEXT_PUBLIC_API_URL="http://server:4000"
```

### 🗄️ Database Migration on Production

```bash
# เข้าไปใน container
docker exec -it projectmanagement_client sh

# Run migrations
npx prisma migrate deploy
```

---

## 💻 Development

### 📝 Available Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Linting
npm run lint

# Prisma commands
npx prisma studio      # เปิด Prisma Studio
npx prisma generate    # Generate Prisma Client
npx prisma db push     # Push schema to DB (dev only)
npx prisma migrate dev # Create migration
```

### 🎨 Code Style
- ใช้ **TypeScript** สำหรับ type safety
- ใช้ **ESLint** สำหรับ code quality
- ตั้งชื่อไฟล์ใช้ **camelCase**
- Component ใช้ **PascalCase**

### 🧪 Testing
```bash
# เพิ่ม testing library (optional)
npm install --save-dev @testing-library/react @testing-library/jest-dom jest
```

---

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👥 Authors

**Project Management System Development Team**

---

## 🙏 Acknowledgments

- Next.js Team
- Prisma Team
- Material-UI Team
- All contributors

---

<div align="center">

**Built with ❤️ using Next.js, NestJS, TypeScript, and PostgreSQL**

[⬆ กลับสู่ด้านบน | Back to Top](#-project-management-system)

</div>
