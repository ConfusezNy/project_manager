# 🚫 Non-Negotiable Rules

> กฎที่ห้ามละเมิดไม่ว่ากรณีใด

---

## ❌ FORBIDDEN - สิ่งที่ห้ามทำ

| #   | Rule                                   | Reason                               |
| --- | -------------------------------------- | ------------------------------------ |
| 1   | ❌ ใช้ Express.js                      | ใช้ Next.js API Routes แทน           |
| 2   | ❌ เก็บ password แบบ plain text        | ต้อง hash ด้วย bcrypt เสมอ           |
| 3   | ❌ Query database without Prisma       | ใช้ Prisma ORM เท่านั้น              |
| 4   | ❌ Skip authentication check           | ทุก protected route ต้องตรวจ session |
| 5   | ❌ Hardcode user_id                    | ต้องดึงจาก session เสมอ              |
| 6   | ❌ ลบ Team ที่มี Project               | ต้องลบ Project ก่อน                  |
| 7   | ❌ Student อยู่หลายทีมใน Section เดียว | บังคับ unique constraint             |
| 8   | ❌ ใช้ `any` type                      | ต้องกำหนด type ชัดเจน                |
| 9   | ❌ Commit secrets to git               | ใช้ .env และ .gitignore              |
| 10  | ❌ Skip input validation               | ตรวจสอบ input ทุกครั้ง               |

---

## ✅ ALWAYS DO - สิ่งที่ต้องทำเสมอ

| #   | Rule                         | Implementation                          |
| --- | ---------------------------- | --------------------------------------- |
| 1   | ✅ ใช้ TypeScript            | ทุกไฟล์ต้องเป็น `.ts` หรือ `.tsx`       |
| 2   | ✅ Validate input            | ตรวจสอบ request body ก่อนใช้งาน         |
| 3   | ✅ Handle errors             | ใช้ try-catch และ return error response |
| 4   | ✅ Use enums                 | สถานะต่างๆ ต้องใช้ enum ไม่ใช่ string   |
| 5   | ✅ Check role                | ตรวจสอบ role ก่อนทำ action              |
| 6   | ✅ Log important actions     | บันทึก action สำคัญ                     |
| 7   | ✅ Use environment variables | ไม่ hardcode secrets                    |
| 8   | ✅ Use Prisma transactions   | สำหรับ operations หลายตาราง             |
| 9   | ✅ Return proper HTTP status | 200, 201, 400, 401, 403, 404, 500       |
| 10  | ✅ Follow naming conventions | ตาม Technical Constitution              |

---

## 🔒 Security Rules

### Authentication

```typescript
// ✅ ถูกต้อง - ตรวจสอบ session
const session = await getServerSession(authOptions);
if (!session) {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}

// ❌ ผิด - ไม่ตรวจสอบ
const data = await prisma.project.findMany();
```

### Password Handling

```typescript
// ✅ ถูกต้อง - hash password
import bcrypt from "bcryptjs";
const hashedPassword = await bcrypt.hash(password, 10);

// ❌ ผิด - เก็บ plain text
await prisma.users.create({ data: { password: plainPassword } });
```

### Input Validation

```typescript
// ✅ ถูกต้อง - validate ก่อนใช้
const { teamname, section_id } = await request.json();
if (!teamname || !section_id) {
  return Response.json({ error: "Missing fields" }, { status: 400 });
}

// ❌ ผิด - ไม่ validate
const body = await request.json();
await prisma.team.create({ data: body });
```

---

## 🗄️ Database Rules

### Unique Constraints

```prisma
// ✅ Student อยู่ได้ 1 ทีม ต่อ 1 Section
model Teammember {
  @@unique([user_id, section_id])
}

// ✅ 1 Team = 1 Project
model Project {
  team_id Int @unique
}
```

### Cascade Delete Prevention

```typescript
// ✅ ตรวจสอบก่อนลบ
const project = await prisma.project.findFirst({
  where: { team_id: teamId },
});
if (project) {
  return Response.json({ error: "Must delete project first" }, { status: 400 });
}
await prisma.team.delete({ where: { team_id: teamId } });
```

---

## 📝 Code Quality Rules

### TypeScript

```typescript
// ✅ ถูกต้อง - กำหนด type
interface CreateTeamInput {
  teamname: string;
  section_id: number;
}

// ❌ ผิด - ใช้ any
function createTeam(data: any) { ... }
```

### Error Handling

```typescript
// ✅ ถูกต้อง - handle errors
try {
  const team = await prisma.team.create({ data });
  return Response.json({ data: team });
} catch (error) {
  console.error("Create team error:", error);
  return Response.json({ error: "Failed to create team" }, { status: 500 });
}

// ❌ ผิด - ไม่ handle
const team = await prisma.team.create({ data });
return Response.json(team);
```
