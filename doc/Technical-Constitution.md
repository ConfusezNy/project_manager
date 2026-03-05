# 🏛️ Technical Constitution

> กฎเหล็กทางเทคนิคที่ต้องปฏิบัติตามเสมอ (Updated: 2026-02-19)

---

## 1. Architecture: Client-Server (Next.js + NestJS)

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js 14)                    │
│  ┌─────────────────────────────────────────────────────────┐│
│  │              Next.js 14 App Router                      ││
│  │  ┌────────────────────┬────────────────────────────────┐││
│  │  │     Pages          │    Client Components           │││
│  │  │  (Admin/Advisor/   │    (React + Hydration)         │││
│  │  │   Student/Public)  │                                │││
│  │  └────────────────────┴────────────────────────────────┘││
│  │                    │                                    ││
│  │              API Client (fetch + JWT)                   ││
│  └─────────────────────────────────────────────────────────┘│
└────────────────────────────┬────────────────────────────────┘
                             │ HTTP + JWT Bearer Token
                             ▼
┌────────────────────────────┴────────────────────────────────┐
│                  Backend (NestJS 11)                         │
│  ┌─────────────────────────────────────────────────────────┐│
│  │      Passport.js + JWT Authentication                   ││
│  │      Guards, Decorators, DTOs (class-validator)         ││
│  └─────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────┐│
│  │      12 Modules: sections, teams, projects, tasks,      ││
│  │      events, submissions, grades, users, advisors,      ││
│  │      admin, terms, profile                              ││
│  └─────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────┐│
│  │      Prisma ORM 6.x (Type-safe queries)                ││
│  └─────────────────────────────────────────────────────────┘│
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                   PostgreSQL 15 (Docker)                     │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  Users │ Teams │ Projects │ Tasks │ Events │ Grades     ││
│  │  Sections │ Terms │ Submissions │ Notifications         ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Hosting & Deployment

| Layer    | Service        | Purpose                    |
| -------- | -------------- | -------------------------- |
| Frontend | Docker / Local | Next.js App (port 3000)    |
| API      | Docker / Local | NestJS Server (port 4000)  |
| Database | Docker         | PostgreSQL 15              |
| Auth     | Passport.js    | JWT (access + refresh)     |

> [!IMPORTANT]
> **Backend ใช้ NestJS** — ไม่ใช้ Next.js API Routes สำหรับ business logic
> NextAuth ถูกแทนที่ด้วย Passport.js + JWT

---

## 3. Tech Stack (Locked Versions)

### Server (NestJS Backend)

| Layer           | Technology     | Version | Purpose                    |
| --------------- | -------------- | ------- | -------------------------- |
| **Framework**   | NestJS         | 11.x    | Backend Framework          |
| **Auth**        | Passport.js    | 0.7.x   | Authentication Strategy    |
| **JWT**         | @nestjs/jwt    | 11.x    | Token Management           |
| **ORM**         | Prisma         | 6.x     | Database Access            |
| **Validation**  | class-validator| 0.14.x  | DTO Validation             |
| **Type Safety** | TypeScript     | 5.9.x   | Static Type Checking       |

### Client (Next.js Frontend)

| Layer           | Technology   | Version | Purpose                    |
| --------------- | ------------ | ------- | -------------------------- |
| **Framework**   | Next.js      | 14.2.x  | React Framework            |
| **UI Library**  | React        | 18.2.0  | Component-based UI         |
| **Type Safety** | TypeScript   | 5.x     | Static Type Checking       |
| **Styling**     | Tailwind CSS | 3.4.x   | Utility-first CSS          |
| **Components**  | Material-UI  | 7.x     | Component Library          |
| **Icons**       | Lucide React | 0.469.x | Icon Library               |

### Shared

| Layer           | Technology   | Version | Purpose                    |
| --------------- | ------------ | ------- | -------------------------- |
| **Database**    | PostgreSQL   | 15+     | Relational Database        |
| **Container**   | Docker       | latest  | Containerization           |
| **Node.js**     | Node.js      | 22.x    | Runtime                    |

> [!WARNING]
> ใช้ **Prisma 6.x** ไม่ใช่ 7.x — Prisma 7 มี breaking changes เรื่อง JSON protocol ที่ยังไม่เสถียร

---

## 4. Scaling Capacity

### ปัจจุบัน (Docker Compose Self-hosted)

| Metric           | Capacity       | โปรเจคนี้ใช้  |
| ---------------- | -------------- | ------------- |
| Database Size    | Unlimited      | ~10-50 MB     |
| API Requests     | Unlimited      | ~10-50K/month |
| Concurrent Users | ~100-500       | ~10-30 peak   |
| Projects         | ไม่จำกัด       | ~15-20/ปี     |

### 📊 Realistic Usage

```
3 ห้อง × 30 นักศึกษา = 90 users/ปี
+ อาจารย์ 5-10 คน
────────────────────────
Concurrent Users = ~10-30 คน (ไม่เกินแน่นอน)
```

> [!TIP]
> **NestJS + PostgreSQL Docker** รองรับ scale ได้เมื่อจำเป็น โดยเพิ่ม replicas หรือ load balancer

---

## 5. Project Structure

```
project_manager/
├── docker-compose.yml          # Docker: PostgreSQL + NestJS + Next.js
├── notion/                     # Documentation
│
├── server/                     # NestJS Backend
│   ├── src/
│   │   ├── auth/              # JWT + Passport module
│   │   ├── sections/          # Section management
│   │   ├── teams/             # Team management
│   │   ├── projects/          # Project management
│   │   ├── tasks/             # Task management
│   │   ├── events/            # Event management
│   │   ├── submissions/       # Submission management
│   │   ├── grades/            # Grade management
│   │   ├── users/             # User management
│   │   ├── advisors/          # Advisor management
│   │   ├── admin/             # Admin management
│   │   ├── terms/             # Term management
│   │   ├── profile/           # Profile management
│   │   └── prisma/            # Prisma module
│   └── prisma/
│       └── schema.prisma      # Database schema
│
└── client/                     # Next.js Frontend
    ├── src/
    │   ├── app/
    │   │   ├── (admin)/       # Admin Dashboard
    │   │   ├── (advisor)/     # Advisor Dashboard
    │   │   ├── (student)/     # Student Dashboard
    │   │   └── (publlic)/     # Public Pages
    │   ├── modules/           # Feature Modules
    │   ├── shared/            # Shared Code
    │   └── lib/
    │       ├── api.ts         # API Client (→ NestJS)
    │       └── prisma.ts      # Remove after migration
    └── package.json
```

---

## 6. File Naming Conventions

| Type              | Convention       | Example                      |
| ----------------- | ---------------- | ---------------------------- |
| **NestJS Module** | lowercase folder | `server/src/teams/`          |
| **Controller**    | `*.controller.ts`| `teams.controller.ts`        |
| **Service**       | `*.service.ts`   | `teams.service.ts`           |
| **DTO**           | `*.dto.ts`       | `create-team.dto.ts`         |
| **Guard**         | `*.guard.ts`     | `jwt-auth.guard.ts`          |
| **Component**     | PascalCase       | `TaskCard.tsx`               |
| **Page**          | `page.tsx` only  | `Teams/page.tsx`             |
| **Module barrel** | `index.ts`       | `team/index.ts`              |

---

## 7. Git Workflow

```
main (production) ← Push จาก develop
  └── develop
        ├── feature/xxx
        └── fix/xxx
```

### Commit Format

```
<type>: <description>

Types: feat, fix, docs, style, refactor, test, chore
```

---

> **Last Updated:** 2026-02-19
