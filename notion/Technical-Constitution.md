# 🏛️ Technical Constitution

> กฎเหล็กทางเทคนิคที่ต้องปฏิบัติตามเสมอ (Updated: 2026-01-28)

---

## 1. Architecture: Full-Stack Next.js Monolith

```
┌─────────────────────────────────────────────────────────────┐
│                       VERCEL                                 │
│  ┌─────────────────────────────────────────────────────────┐│
│  │              Next.js 14 App Router                      ││
│  │  ┌────────────────────┬────────────────────────────────┐││
│  │  │     Frontend       │        Backend (API Routes)   │││
│  │  │  (React Pages)     │   /api/teams, /api/users...   │││
│  │  └────────────────────┴────────────────────────────────┘││
│  │                    │                                    ││
│  │              Prisma ORM + NextAuth.js                   ││
│  └─────────────────────────────────────────────────────────┘│
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                      SUPABASE                                │
│  ┌─────────────────────────────────────────────────────────┐│
│  │              PostgreSQL Database                        ││
│  │  (Users, Teams, Projects, Sections, Tasks, Grades)      ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Hosting & Deployment

| Layer    | Service  | Plan     | Purpose       |
| -------- | -------- | -------- | ------------- |
| Frontend | Vercel   | Free/Pro | Next.js App   |
| API      | Vercel   | Free/Pro | API Routes    |
| Database | Supabase | Free     | PostgreSQL    |
| Auth     | NextAuth | -        | Session + JWT |

> [!IMPORTANT]
> **ไม่ใช้ Express.js** - ใช้ Next.js API Routes แทนเพื่อความเรียบง่าย

---

## 3. Tech Stack (Locked Versions)

| Layer           | Technology   | Version | Purpose                    |
| --------------- | ------------ | ------- | -------------------------- |
| **Framework**   | Next.js      | 14.2.x  | Full-Stack React Framework |
| **UI Library**  | React        | 18.2.0  | Component-based UI         |
| **Type Safety** | TypeScript   | 5.x     | Static Type Checking       |
| **Styling**     | Tailwind CSS | 3.4.x   | Utility-first CSS          |
| **Auth**        | NextAuth.js  | 4.24.x  | Authentication             |
| **ORM**         | Prisma       | 5.22.x  | Database Access            |
| **Database**    | PostgreSQL   | 15+     | Relational Database        |
| **Icons**       | Lucide React | 0.469.x | Icon Library               |

---

## 4. Scaling Capacity

### ปัจจุบัน (Supabase Free + Vercel Free)

| Metric           | Limit      | โปรเจคนี้ใช้  |
| ---------------- | ---------- | ------------- |
| Database Size    | 500 MB     | ~10-50 MB     |
| API Requests     | 500K/month | ~10-50K/month |
| Concurrent Users | ~50-100    | ~10-30 peak   |
| Projects         | ไม่จำกัด   | ~15-20/ปี     |

### 📊 Realistic Usage

```
3 ห้อง × 30 นักศึกษา = 90 users/ปี
+ อาจารย์ 5-10 คน
────────────────────────
Concurrent Users = ~10-30 คน (ไม่เกินแน่นอน)
```

> [!TIP]
> **Next.js + Supabase Free เพียงพอสำหรับ 5-10 ปี** โดยไม่ต้องเปลี่ยน architecture

---

## 5. Future Roadmap (If Needed)

### Phase 1: ปัจจุบัน - 2 ปี ✅

- Keep current stack
- Add Pagination
- Add Import Feature (Excel)

### Phase 2: ถ้าข้อมูล > 500 โปรเจค

- Add Meilisearch (Full-text search)
- Add Redis (Caching)
- Upgrade Supabase Pro ($25/mo)

### Phase 3: ถ้า concurrent > 100 users

- แยก NestJS Backend (ถ้าจำเป็น)
- ไม่น่าถึง Phase นี้

---

## 6. Code Structure (Modular Monolith)

```
src/
├── app/                  # Next.js Pages + API
│   ├── (admin)/          # Admin Dashboard
│   ├── (advisor)/        # Advisor Dashboard
│   ├── (student)/        # Student Dashboard
│   └── api/              # Backend API Routes
│
├── modules/              # Feature Modules
│   ├── team/             # 8 components ✅
│   ├── project/          # 2 components ✅
│   ├── notification/     # 1 component ✅
│   └── ...
│
└── shared/               # Shared Code
    └── components/       # Reusable UI
```

---

## 7. File Naming Conventions

| Type          | Convention       | Example              |
| ------------- | ---------------- | -------------------- |
| **Component** | PascalCase       | `TaskCard.tsx`       |
| **Page**      | `page.tsx` only  | `Teams/page.tsx`     |
| **API Route** | `route.ts` only  | `api/teams/route.ts` |
| **Module**    | lowercase folder | `modules/team/`      |
| **Barrel**    | `index.ts`       | `team/index.ts`      |

---

## 8. Git Workflow

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

> **Last Updated:** 2026-01-28
