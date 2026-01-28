# 👥 Role-Based Access Control

> Permissions และ User Roles Matrix

---

## 👤 User Roles

| Role           | Description             | Dashboard Route |
| -------------- | ----------------------- | --------------- |
| 👨‍🎓 **STUDENT** | นักศึกษาที่ทำโครงงาน    | `(student)/`    |
| 👨‍🏫 **ADVISOR** | อาจารย์ที่ปรึกษาโครงงาน | `(advisor)/`    |
| 👨‍💼 **ADMIN**   | ผู้ดูแลระบบ             | `(admin)/`      |

---

## 🔐 Permissions Matrix

| Feature              | 👨‍🎓 Student | 👨‍🏫 Advisor | 👨‍💼 Admin |
| -------------------- | :--------: | :--------: | :------: |
| **ดูโครงงานตนเอง**   |     ✅     |     ✅     |    ✅    |
| **สร้างทีม**         |     ✅     |     ❌     |    ❌    |
| **เข้าร่วมทีม**      |     ✅     |     ❌     |    ❌    |
| **สร้าง/แก้ไข Task** |     ✅     |     ❌     |    ❌    |
| **แนบไฟล์**          |     ✅     |     ✅     |    ❌    |
| **ให้ Comment**      |     ✅     |     ✅     |    ❌    |
| **ดูทีมที่ปรึกษา**   |     ❌     |     ✅     |    ✅    |
| **อนุมัติโครงงาน**   |     ❌     |     ✅     |    ✅    |
| **ให้คะแนน**         |     ❌     |     ✅     |    ❌    |
| **จัดการ Section**   |     ❌     |     ❌     |    ✅    |
| **จัดการ Term**      |     ❌     |     ❌     |    ✅    |
| **จัดการผู้ใช้**     |     ❌     |     ❌     |    ✅    |
| **ดูสถิติภาพรวม**    |     ❌     |     ✅     |    ✅    |

---

## 📍 Dashboard Routes

### Student Dashboard (`(student)/`)

| Route       | Feature      |
| ----------- | ------------ |
| `/Teams`    | จัดการทีม    |
| `/Timeline` | ดู Timeline  |
| `/Search`   | ค้นหาโครงงาน |
| `/settings` | ตั้งค่า      |

### Advisor Dashboard (`(advisor)/`)

| Route           | Feature        |
| --------------- | -------------- |
| `/advisorteams` | ดูทีมที่ปรึกษา |
| `/Timeline`     | ดู Timeline    |
| `/settings`     | ตั้งค่า        |

### Admin Dashboard (`(admin)/`)

| Route       | Feature         |
| ----------- | --------------- |
| `/sections` | จัดการหมู่เรียน |
| `/users`    | จัดการผู้ใช้    |
| `/settings` | ตั้งค่าระบบ     |

---

## 🛡️ Route Protection

```typescript
// ตรวจสอบ role ใน API
const session = await getServerSession(authOptions);

if (!session) {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}

if (session.user.role !== "ADMIN") {
  return Response.json({ error: "Forbidden" }, { status: 403 });
}
```

---

## 👨‍🎓 Student Features

- สร้างและจัดการทีม
- เข้าร่วม/ออกจากทีม
- สร้างโครงงาน
- จัดการ Task (สร้าง, แก้ไข, ลบ)
- อัพโหลดไฟล์แนบ
- ดู Timeline และความคืบหน้า
- ค้นหาโครงงานย้อนหลัง
- ดูเกรด

## 👨‍🏫 Advisor Features

- ดูทีมที่เป็นที่ปรึกษา
- ให้ Comment และคำแนะนำ
- อนุมัติ/ปฏิเสธโครงงาน
- ให้คะแนน
- ดูสถิติภาพรวม

## 👨‍💼 Admin Features

- จัดการ Term (ภาคการศึกษา)
- จัดการ Section (หมู่เรียน)
- จัดการผู้ใช้ทั้งหมด
- ดูสถิติและรายงาน
- ตั้งค่าระบบ
