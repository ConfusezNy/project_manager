# 🚫 Non-Negotiable Rules

> กฎที่ห้ามละเมิดไม่ว่ากรณีใด (Updated: 2026-02-19)

---

## ❌ FORBIDDEN - สิ่งที่ห้ามทำ

| #   | Rule                                   | Reason                                    |
| --- | -------------------------------------- | ----------------------------------------- |
| 1   | ❌ เขียน business logic ใน Next.js API Routes | ใช้ NestJS Backend เท่านั้น                |
| 2   | ❌ เก็บ password แบบ plain text        | ต้อง hash ด้วย bcrypt เสมอ                |
| 3   | ❌ Query database without Prisma       | ใช้ Prisma ORM เท่านั้น (ไม่ใช้ raw SQL)  |
| 4   | ❌ Skip authentication check           | ทุก protected route ต้องใช้ JWT Guard     |
| 5   | ❌ Hardcode user_id                    | ต้องดึงจาก JWT payload เสมอ               |
| 6   | ❌ ลบ Team ที่มี Project               | ต้องลบ Project ก่อน                       |
| 7   | ❌ Student อยู่หลายทีมใน Section เดียว | บังคับ unique constraint                  |
| 8   | ❌ ใช้ `any` type                      | ต้องกำหนด type / DTO ชัดเจน              |
| 9   | ❌ Commit secrets to git               | ใช้ .env และ .gitignore                   |
| 10  | ❌ Skip input validation               | ใช้ class-validator ใน DTO ทุกครั้ง        |
| 11  | ❌ Cascade delete ไม่มี transaction    | ลบหลาย table ต้องใช้ `prisma.$transaction()` |

---

## ✅ ALWAYS DO - สิ่งที่ต้องทำเสมอ

| #   | Rule                         | Implementation                              |
| --- | ---------------------------- | ------------------------------------------- |
| 1   | ✅ ใช้ TypeScript            | ทุกไฟล์ต้องเป็น `.ts` หรือ `.tsx`           |
| 2   | ✅ Validate input ด้วย DTO   | ใช้ `class-validator` decorators             |
| 3   | ✅ Handle errors             | NestJS Exception Filters + try-catch        |
| 4   | ✅ Use enums                 | สถานะต่างๆ ต้องใช้ enum ไม่ใช่ string       |
| 5   | ✅ Check role ด้วย Guard     | `@UseGuards(JwtAuthGuard)` + `@Roles()`     |
| 6   | ✅ Log important actions     | ใช้ NestJS Logger                            |
| 7   | ✅ Use environment variables | ใช้ `@nestjs/config` ConfigModule            |
| 8   | ✅ Use Prisma transactions   | สำหรับ operations หลายตาราง                  |
| 9   | ✅ Return proper HTTP status | 200, 201, 400, 401, 403, 404, 500           |
| 10  | ✅ Follow naming conventions | ตาม Technical Constitution                   |

---

## 🔒 Security Rules

### Authentication (NestJS)

```typescript
// ✅ ถูกต้อง - ใช้ Guard + Decorator
@UseGuards(JwtAuthGuard)
@Get('my-team')
async getMyTeam(@CurrentUser() user: JwtPayload) {
  return this.teamsService.getMyTeam(user.users_id);
}

// ✅ ถูกต้อง - ใช้ Role Guard
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Delete(':id')
async deleteSection(@Param('id') id: string) {
  return this.sectionsService.delete(+id);
}

// ❌ ผิด - ไม่มี Guard
@Get('users')
async getAll() {
  return this.usersService.findAll(); // ใครก็เข้าได้!
}
```

### Password Handling

```typescript
// ✅ ถูกต้อง - hash password
import * as bcrypt from 'bcryptjs';
const hashedPassword = await bcrypt.hash(password, 10);

// ❌ ผิด - เก็บ plain text
await this.prisma.users.create({ data: { passwordHash: plainPassword } });
```

### Input Validation (DTO)

```typescript
// ✅ ถูกต้อง - ใช้ DTO + class-validator
import { IsString, IsInt, Min, Max } from 'class-validator';

export class CreateTeamDto {
  @IsString()
  name: string;

  @IsInt()
  section_id: number;
}

// ❌ ผิด - ไม่ validate
@Post()
async create(@Body() body: any) { // ห้ามใช้ any!
  await this.prisma.team.create({ data: body });
}
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

### Cascade Delete ต้องใช้ Transaction

```typescript
// ✅ ถูกต้อง - ใช้ transaction
await this.prisma.$transaction(async (tx) => {
  await tx.taskAssignment.deleteMany({ where: { task_id: id } });
  await tx.comment.deleteMany({ where: { task_id: id } });
  await tx.attachment.deleteMany({ where: { task_id: id } });
  await tx.task.delete({ where: { task_id: id } });
});

// ❌ ผิด - ลบทีละ table แยก (ถ้า error กลางทาง ข้อมูลพัง)
await this.prisma.taskAssignment.deleteMany({ where: { task_id: id } });
await this.prisma.comment.deleteMany({ where: { task_id: id } });
// ถ้า error ตรงนี้ → task ยังอยู่ แต่ data ลูกหายไปแล้ว!
```

---

## 📝 Code Quality Rules

### TypeScript + NestJS

```typescript
// ✅ ถูกต้อง - กำหนด DTO
export class CreateTeamDto {
  @IsString()
  name: string;

  @IsInt()
  section_id: number;
}

// ❌ ผิด - ใช้ any
createTeam(data: any) { ... }
```

### Error Handling (NestJS)

```typescript
// ✅ ถูกต้อง - ใช้ NestJS Exceptions
import { NotFoundException, ForbiddenException } from '@nestjs/common';

async findOne(id: number) {
  const team = await this.prisma.team.findUnique({ where: { team_id: id } });
  if (!team) {
    throw new NotFoundException('Team not found');
  }
  return team;
}

// ❌ ผิด - return manual error response
if (!team) {
  return { error: 'Team not found', status: 404 }; // ไม่ใช่วิธี NestJS!
}
```

---

> **Last Updated:** 2026-02-19
