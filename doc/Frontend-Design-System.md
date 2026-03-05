# 🎨 Frontend Design System

> UI Components และ Directory Structure (Updated: 2026-01-28)

---

## 📁 Directory Structure (Modular Monolith)

```
src/
├── app/                    # Next.js App Router Pages
│   ├── (admin)/            # Admin Dashboard Pages
│   ├── (advisor)/          # Advisor Dashboard Pages
│   ├── (student)/          # Student Dashboard Pages
│   ├── (publlic)/          # Public Pages (signin/signup)
│   ├── api/                # API Routes
│   └── (components)/       # Legacy Components (deprecating)
│
├── modules/                # 🆕 Feature Modules
│   ├── auth/               # Authentication
│   ├── grade/              # Grade Management
│   ├── notification/       # Notifications
│   ├── project/            # Project Management
│   ├── section/            # Section Management
│   ├── task/               # Task Management
│   ├── team/               # Team Management ✅
│   ├── timeline/           # Timeline
│   └── user/               # User Management
│
└── shared/                 # 🆕 Shared Code
    ├── components/         # Reusable UI (Button, Modal)
    ├── hooks/              # Custom Hooks
    ├── utils/              # Utilities
    └── types/              # Shared Types
```

---

## 🧩 Module Structure

แต่ละ module มีโครงสร้างดังนี้:

```
modules/team/
├── components/             # UI Components
│   ├── CreateTeamModal.tsx
│   ├── TeamMembersTable.tsx
│   └── ...
├── services/               # API Services (TODO)
├── hooks/                  # Custom Hooks (TODO)
├── types/                  # Module Types
└── index.ts                # Barrel Export
```

### Import Pattern

```typescript
// ✅ ถูกต้อง: Import จาก module
import { CreateTeamModal, TeamMembersTable } from "@/modules/team";
import { ProjectCard } from "@/modules/project";
import Button from "@/shared/components/Button";

// ❌ ไม่ควรใช้: Import จาก (components)
import { CreateTeamModal } from "@/app/(components)/Teams/CreateTeamModal";
```

---

## 🏷️ Component Naming Convention

| Type          | Convention              | Example                 |
| ------------- | ----------------------- | ----------------------- |
| **Module**    | lowercase folder        | `modules/team/`         |
| **Component** | PascalCase file         | `CreateTeamModal.tsx`   |
| **Modal**     | `*Modal` suffix         | `InviteMemberModal.tsx` |
| **Form**      | `*Form` or `*FormModal` | `ProjectFormModal.tsx`  |
| **Barrel**    | `index.ts`              | `modules/team/index.ts` |

---

## 🧩 Migrated Components

### Team Module ✅

| Component           | Status | Description       |
| ------------------- | ------ | ----------------- |
| `CreateTeamModal`   | ✅     | สร้างทีมใหม่      |
| `TeamMembersTable`  | ✅     | แสดงรายชื่อสมาชิก |
| `InviteMemberModal` | ✅     | เชิญสมาชิกเข้าทีม |
| `TeamHeader`        | ✅     | Header ของทีม     |
| `TeamProjectDetail` | ✅     | รายละเอียดโครงงาน |
| `TeamSettingsModal` | ✅     | แก้ไขทีม          |
| `TeamInfoCards`     | ✅     | การ์ดข้อมูลทีม    |
| `EmptyTeamState`    | ✅     | Empty state       |

### Project Module ✅

| Component          | Status | Description      |
| ------------------ | ------ | ---------------- |
| `ProjectCard`      | ✅     | การ์ดแสดงโปรเจค  |
| `ProjectFormModal` | ✅     | ฟอร์มสร้างโปรเจค |

### Notification Module ✅

| Component              | Status | Description        |
| ---------------------- | ------ | ------------------ |
| `NotificationDropdown` | ✅     | Dropdown แจ้งเตือน |

### Shared Components ✅

| Component | Location                    | Description  |
| --------- | --------------------------- | ------------ |
| `Button`  | `shared/components/Button/` | ปุ่มกดทั่วไป |

---

## 🎨 Styling Guidelines

1. **ใช้ Tailwind CSS** เป็นหลัก
2. **Responsive Design** ต้องรองรับทุกขนาดหน้าจอ
3. **Dark Mode** รองรับผ่าน `next-themes`
4. **ไม่ใช้ Glassmorphism** บนส่วนที่เกี่ยวกับเงิน
