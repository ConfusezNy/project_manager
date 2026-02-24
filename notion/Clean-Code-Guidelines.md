# 🧠 Clean Code Guidelines

> หลักคิดการเขียนโค้ดที่สะอาด ขยายได้ และ maintain ง่าย (Updated: 2026-02-25)

---

## 🎯 ปัญหาจริงคืออะไร?

```
❌ ไม่ใช่ App Router ที่ทำให้โค้ดยาว
❌ ไม่ใช่ Frontend + Backend อยู่ folder เดียว
✅ ปัญหาคือ เอา logic ทุกอย่างยัดไว้ใน page.tsx / route.ts
```

---

## 🔑 กฎทอง 3 ข้อ (จำแค่นี้พอ)

### 1️⃣ page.tsx = Composition ONLY

```typescript
// ❌ อย่าทำ
export default function TeamsPage() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  // ...fetch logic
  // ...business rules
  // ...validation
  // = 750 บรรทัด 💀
}

// ✅ ทำแบบนี้
export default function TeamsPage() {
  return <TeamDashboard />;
}
// = 10 บรรทัด ✨
```

**กฎ:**

- ❌ ไม่เขียน logic
- ❌ ไม่ fetch ตรง
- ❌ ไม่ map business rule
- ✅ ทำหน้าที่แค่ **ประกอบ component**

---

### 2️⃣ route.ts = HTTP Adapter ONLY

```typescript
// ❌ อย่าทำ
export async function POST(req: Request) {
  const body = await req.json();
  // validate 50 บรรทัด
  // transaction 100 บรรทัด
  // notify 50 บรรทัด
  // = 300 บรรทัด 💀
}

// ✅ ทำแบบนี้
export async function POST(req: Request) {
  const body = await req.json();
  const result = await createGrade(body);
  return Response.json(result);
}
// = 10 บรรทัด ✨
```

**กฎ:**

- ❌ ไม่เขียน business logic
- ❌ ไม่ validate ลึก
- ❌ ไม่เขียน transaction ซับซ้อน
- ✅ แค่ **รับ request → เรียก service → ส่ง response**

---

### 3️⃣ Logic ทั้งหมดอยู่ใน services/

```typescript
// modules/grade/services/createGrade.ts
export async function createGrade(input: CreateGradeInput) {
  // validate
  const validated = gradeSchema.parse(input);

  // transaction
  const grade = await prisma.grade.create({
    data: validated,
  });

  // notify
  await notifyAdvisor(grade);

  return grade;
}
```

**กฎ:**

- ✅ Logic อยู่ตรงนี้
- ✅ Test ได้
- ✅ Reuse ได้

---

## 🧱 โครงสร้าง Module ที่สมบูรณ์

```
modules/
├── grade/
│   ├── components/     ← UI Components
│   │   ├── GradeCard.tsx
│   │   └── GradeList.tsx
│   ├── services/       ← Business Logic ⭐
│   │   ├── getGrades.ts
│   │   ├── createGrade.ts
│   │   └── updateGrade.ts
│   ├── types.ts        ← TypeScript Types
│   ├── validators.ts   ← Zod Schemas
│   └── index.ts        ← Barrel Export
```

---

## 🔄 Clean Flow ที่ถูกต้อง

### Frontend Flow

```
page.tsx (10 บรรทัด)
    ↓
components/GradeList.tsx (50 บรรทัด)
    ↓
services/getGrades.ts (30 บรรทัด)
    ↓
Prisma → Database
```

### Backend Flow (NestJS) ✅

```
Controller (20 บรรทัด) — รับ request + Guards + DTO validation
    ↓
Service (100-200 บรรทัด) — Business logic + Prisma
    ↓
Prisma → Database
```

```typescript
// ✅ NestJS Controller Pattern
@Controller('grades')
@UseGuards(JwtAuthGuard)
export class GradesController {
  @UseGuards(RolesGuard) @Roles('ADMIN')
  @Post()
  async batchSave(@CurrentUser('users_id') userId: string, @Body() dto: BatchGradesDto) {
    return this.gradesService.batchSave(userId, dto);
  }
}
```

> ⚠️ Legacy Next.js `route.ts` files จะถูกลบใน Phase 6

---

## 📏 กติกาความยาวไฟล์

| ไฟล์       | ยาวสูงสุด      | ถ้าเกิน               |
| ---------- | -------------- | --------------------- |
| `page.tsx` | **50 บรรทัด**  | แตกเป็น component     |
| `route.ts` | **50 บรรทัด**  | ย้าย logic ไป service |
| Component  | **150 บรรทัด** | แตกเป็น sub-component |
| Service    | **200 บรรทัด** | แยกเป็นหลาย service   |

---

## 📝 ตัวอย่างการ Refactor

### Before (❌ ไม่ดี)

```typescript
// app/(student)/Teams/page.tsx = 750 บรรทัด
export default function TeamsPage() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/teams/my-team")
      .then((res) => res.json())
      .then((data) => {
        // 100 บรรทัด logic
      });
  }, []);

  // อีก 600 บรรทัด...
}
```

### After (✅ ดี)

```typescript
// app/(student)/Teams/page.tsx = 10 บรรทัด
import { TeamDashboard } from '@/modules/team';

export default function TeamsPage() {
  return <TeamDashboard />;
}
```

```typescript
// modules/team/components/TeamDashboard.tsx = 80 บรรทัด
import { useTeamData } from '../hooks/useTeamData';

export function TeamDashboard() {
  const { team, loading, error } = useTeamData();
  if (loading) return <Loading />;
  return <TeamContent team={team} />;
}
```

```typescript
// modules/team/hooks/useTeamData.ts = 30 บรรทัด
export function useTeamData() {
  const [team, setTeam] = useState(null);
  useEffect(() => {
    getMyTeam().then(setTeam);
  }, []);
  return { team, loading: !team };
}
```

---

## 🏷️ คำจำง่าย

```
Page    = Layout     (ประกอบร่าง)
Route   = Adapter    (รับ-ส่ง)
Service = Brain      (คิด)
```

---

> **หลักการ:** ถ้าไฟล์ยาวเกิน = แยกออก, ถ้า logic ซับซ้อน = ย้ายไป service
