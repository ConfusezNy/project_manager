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

ระบบบริหารจัดการโครงงานนักศึกษาเป็นแพลตฟอร์มแบบ Full-Stack ที่พัฒนาด้วย **Next.js 14** และ **PostgreSQL** โดยออกแบบมาเพื่อจัดการโครงงานของนักศึกษาในระดับมหาวิทยาลัยอย่างมีประสิทธิภาพ รองรับการทำงานของ 3 บทบาทหลัก: **นักศึกษา (Student)**, **อาจารย์ที่ปรึกษา (Advisor)** และ **ผู้ดูแลระบบ (Admin)**

**Project Management System** is a comprehensive full-stack platform built with **Next.js 14** and **PostgreSQL**, designed to efficiently manage university student projects. It supports three main roles: **Students**, **Advisors**, and **Administrators**.

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
- ✅ จัดการงานด้วย Kanban Board
- 📊 ติดตามความคืบหน้าด้วย Gantt Chart
- 💬 แสดงความคิดเห็นและอัปโหลดไฟล์แนบ
- 🔔 รับการแจ้งเตือนแบบ Real-time
- 📱 ดูเกรดและผลการประเมิน

### 👨‍🏫 สำหรับอาจารย์ | For Advisors
- 📋 ดูโครงการที่รับผิดชอบทั้งหมด
- 💯 ประเมินผลและให้เกรดนักศึกษา
- 📈 ติดตามความคืบหน้าของทีม
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
│           Frontend (Next.js 14 App Router)      │
│  ┌──────────┬──────────┬──────────┬──────────┐ │
│  │  Admin   │ Advisor  │ Student  │  Public  │ │
│  │ Dashboard│Dashboard │Dashboard │  Pages   │ │
│  └──────────┴──────────┴──────────┴──────────┘ │
│              ↓                                   │
│        React Server Components                  │
│        Client Components (Hydration)            │
└────────────────┬────────────────────────────────┘
                 │
                 ↓ API Routes & Server Actions
┌────────────────┴────────────────────────────────┐
│              Backend (Next.js API)              │
│  ┌──────────────────────────────────────────┐   │
│  │      NextAuth.js Authentication          │   │
│  │      (Session-based + JWT)               │   │
│  └──────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────┐   │
│  │      Prisma ORM (Type-safe queries)      │   │
│  └──────────────────────────────────────────┘   │
└────────────────┬────────────────────────────────┘
                 │
                 ↓
┌────────────────┴────────────────────────────────┐
│         Database (PostgreSQL 15)                │
│  ┌──────────────────────────────────────────┐   │
│  │  Users │ Teams │ Projects │ Tasks        │   │
│  │  Sections │ Terms │ Grades │ Notifications│  │
│  └──────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

---

## 🛠️ เทคโนโลยี | Tech Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| **Next.js** | 14.2.33 | React Framework with App Router |
| **React** | 18.2.0 | UI Library |
| **TypeScript** | 5.x | Type Safety |
| **Tailwind CSS** | 3.4.18 | Utility-first CSS |
| **Material-UI** | 7.3.6 | Component Library |
| **Lucide React** | 0.469.0 | Icon Library |
| **React Hook Form** | 7.68.0 | Form Management |
| **Next Themes** | 0.4.6 | Dark Mode Support |

### Backend & Database
| Technology | Version | Purpose |
|-----------|---------|---------|
| **Next.js API Routes** | 14.2.33 | Backend API |
| **NextAuth.js** | 4.24.13 | Authentication |
| **Prisma ORM** | 5.22.0 | Database ORM |
| **PostgreSQL** | 15-alpine | Relational Database |
| **bcryptjs** | 3.0.3 | Password Hashing |

### Data Visualization & UI Components
| Library | Purpose |
|---------|---------|
| **Recharts** | 📊 Charts and Analytics |
| **Gantt Task React** | 📅 Gantt Chart for Timeline |
| **React DnD** | 🎯 Drag & Drop for Kanban |
| **Date-fns** | 📅 Date Formatting |
| **Axios** | 🌐 HTTP Client |

### DevOps & Tools
| Tool | Purpose |
|------|---------|
| **Docker** | 🐳 Containerization |
| **Docker Compose** | 🔧 Multi-container Orchestration |
| **ESLint** | ✅ Code Linting |
| **Autoprefixer** | 🎨 CSS Compatibility |

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
cd client
npm install
```

#### 3. Setup Environment Variables

สร้างไฟล์ `.env` ในโฟลเดอร์ `client/`:

```env
# Database
DATABASE_URL="your db"

# NextAuth
NEXTAUTH_SECRET="your nextauth key"
NEXTAUTH_URL="http://localhost:3000"
```

#### 4. Database Setup

**Option A: ใช้ Docker Compose (แนะนำ)**
```bash
# กลับไปที่ root directory
cd ..
docker-compose up -d
```

**Option B: ใช้ PostgreSQL ที่ติดตั้งเอง**
```bash
# สร้าง Database
createdb projectmanagement

# Run migrations
cd client
npx prisma migrate deploy
```

#### 5. Generate Prisma Client

```bash
npx prisma generate
```

#### 6. Start Development Server

```bash
npm run dev
```

เปิดเบราว์เซอร์ที่ [http://localhost:3000](http://localhost:3000)

---

## ⚙️ การตั้งค่า | Configuration

### 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `NEXTAUTH_SECRET` | Secret key for NextAuth.js | ✅ |
| `NEXTAUTH_URL` | Base URL of application | ✅ |

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
├── docker-compose.yml          # Docker configuration
├── README.md                   # Documentation
└── client/                     # Next.js application
    ├── prisma/
    │   ├── schema.prisma      # Database schema
    │   └── migrations/         # Database migrations
    ├── src/
    │   ├── app/
    │   │   ├── (admin)/       # Admin dashboard pages
    │   │   ├── (advisor)/     # Advisor dashboard pages
    │   │   ├── (student)/     # Student dashboard pages
    │   │   ├── (components)/  # Reusable components
    │   │   ├── (publlic)/     # Public pages (signin/signup)
    │   │   ├── api/           # API routes
    │   │   │   ├── auth/      # Authentication endpoints
    │   │   │   ├── sections/  # Section management
    │   │   │   ├── teams/     # Team management
    │   │   │   ├── terms/     # Term management
    │   │   │   └── profile/   # User profile
    │   │   ├── layout.tsx     # Root layout
    │   │   ├── page.tsx       # Home page
    │   │   └── providers.tsx  # Context providers
    │   ├── lib/
    │   │   ├── auth.ts        # NextAuth configuration
    │   │   ├── prisma.ts      # Prisma client instance
    │   │   └── require-user.ts # Auth middleware
    │   └── types/
    │       └── next-auth.d.ts # NextAuth type definitions
    ├── Dockerfile             # Docker image config
    ├── package.json           # Dependencies
    ├── tsconfig.json          # TypeScript config
    └── tailwind.config.ts     # Tailwind CSS config
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

### Authentication
```
POST   /api/auth/signup          # ลงทะเบียนผู้ใช้ใหม่
POST   /api/auth/signin          # เข้าสู่ระบบ
POST   /api/auth/signout         # ออกจากระบบ
GET    /api/auth/session         # ดูข้อมูล session ปัจจุบัน
```

### Sections (หมู่เรียน)
```
GET    /api/sections             # ดูรายการ sections ทั้งหมด
POST   /api/sections             # สร้าง section ใหม่
GET    /api/sections/[id]        # ดูข้อมูล section
PUT    /api/sections/[id]        # แก้ไข section
DELETE /api/sections/[id]        # ลบ section
```

### Teams (ทีม)
```
GET    /api/teams                # ดูรายการทีมทั้งหมด
POST   /api/teams                # สร้างทีมใหม่
GET    /api/teams/[id]           # ดูข้อมูลทีม
PUT    /api/teams/[id]           # แก้ไขทีม
DELETE /api/teams/[id]           # ลบทีม
```

### Terms (ภาคการศึกษา)
```
GET    /api/terms                # ดูรายการภาคการศึกษา
POST   /api/terms                # สร้างภาคการศึกษาใหม่
GET    /api/terms/[id]           # ดูข้อมูลภาคการศึกษา
PUT    /api/terms/[id]           # แก้ไขภาคการศึกษา
DELETE /api/terms/[id]           # ลบภาคการศึกษา
```

### Profile
```
GET    /api/profile              # ดูข้อมูลโปรไฟล์
PUT    /api/profile              # แก้ไขโปรไฟล์
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

### 🐳 Docker Deployment

#### Production Build
```bash
# Build และ run ด้วย Docker Compose
docker-compose up -d --build

# หยุดการทำงาน
docker-compose down

# ดู logs
docker-compose logs -f client
```

#### Environment Variables for Production
```env
DATABASE_URL="postgresql://postgres:password@postgres:5432/projectmanagement"
NEXTAUTH_SECRET="<generate-secure-secret>"
NEXTAUTH_URL="https://yourdomain.com"
NODE_ENV="production"
```

### ☁️ Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd client
vercel --prod
```

ตั้งค่า Environment Variables ใน Vercel Dashboard

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

**Built with ❤️ using Next.js, TypeScript, and PostgreSQL**

[⬆ กลับสู่ด้านบน | Back to Top](#-project-management-system)

</div>
