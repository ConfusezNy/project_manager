# 🏛️ Technical Constitution

> กฎเหล็กทางเทคนิคที่ต้องปฏิบัติตามเสมอ

---

## 1. Architecture: Full-Stack Next.js Monolith

```
┌─────────────────────────────────────────────────────┐
│           Frontend (Next.js 14 App Router)          │
│  ┌──────────┬──────────┬──────────┬──────────┐     │
│  │  Admin   │ Advisor  │ Student  │  Public  │     │
│  │ Dashboard│Dashboard │Dashboard │  Pages   │     │
│  └──────────┴──────────┴──────────┴──────────┘     │
│              ↓ React Server Components              │
└────────────────┬────────────────────────────────────┘
                 │
                 ↓ Next.js API Routes
┌────────────────┴────────────────────────────────────┐
│              Backend (Next.js API)                  │
│  ┌──────────────────────────────────────────────┐  │
│  │      NextAuth.js (Session + JWT)             │  │
│  ├──────────────────────────────────────────────┤  │
│  │      Prisma ORM (Type-safe queries)          │  │
│  └──────────────────────────────────────────────┘  │
└────────────────┬────────────────────────────────────┘
                 │
                 ↓
┌────────────────┴────────────────────────────────────┐
│              Database (PostgreSQL)                  │
│  ┌──────────────────────────────────────────────┐  │
│  │ Users │ Teams │ Projects │ Tasks │ Grades    │  │
│  │ Sections │ Terms │ Comments │ Notifications  │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

---

## 2. Tech Stack (Locked Versions)

| Layer           | Technology   | Version | Purpose                    |
| --------------- | ------------ | ------- | -------------------------- |
| **Framework**   | Next.js      | 14.2.x  | Full-Stack React Framework |
| **UI Library**  | React        | 18.2.0  | Component-based UI         |
| **Type Safety** | TypeScript   | 5.x     | Static Type Checking       |
| **Styling**     | Tailwind CSS | 3.4.x   | Utility-first CSS          |
| **Components**  | Material-UI  | 7.x     | Component Library          |
| **Auth**        | NextAuth.js  | 4.24.x  | Authentication             |
| **ORM**         | Prisma       | 5.22.x  | Database Access            |
| **Database**    | PostgreSQL   | 15+     | Relational Database        |
| **Icons**       | Lucide React | 0.469.x | Icon Library               |

> [!IMPORTANT]
> **ไม่ใช้ Express.js** - ใช้ Next.js API Routes แทนเพื่อความเรียบง่ายและ type-safety

---

## 3. Development Workflow

### Git Branch Strategy

```
main (production)
  └── develop
        ├── feature/team-management
        ├── feature/task-board
        └── fix/login-issue
```

### Commit Message Format

```
<type>: <description>

Types:
- feat: New feature
- fix: Bug fix
- docs: Documentation
- style: Formatting
- refactor: Code restructure
- test: Adding tests
- chore: Maintenance
```

### Deployment Pipeline

```
Local Dev → Docker Compose → Vercel/Production
     ↓
  PostgreSQL (Docker)
```

---

## 4. File Naming Conventions

| Type          | Convention              | Example              |
| ------------- | ----------------------- | -------------------- |
| **Component** | PascalCase              | `TaskCard.tsx`       |
| **Page**      | `page.tsx` only         | `Teams/page.tsx`     |
| **Layout**    | `layout.tsx` only       | `(admin)/layout.tsx` |
| **API Route** | `route.ts` only         | `api/teams/route.ts` |
| **Utility**   | camelCase               | `formatDate.ts`      |
| **Types**     | camelCase or PascalCase | `next-auth.d.ts`     |
| **Config**    | kebab-case or camelCase | `tailwind.config.ts` |
