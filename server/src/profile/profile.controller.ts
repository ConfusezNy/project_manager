import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';

/**
 * Profile Controller
 * ย้ายมาจาก: client/src/app/api/profile/route.ts
 * 
 * 📌 GET /profile — ดึงข้อมูลโปรไฟล์ตัวเอง (รวม profilePicture ที่ไม่ได้อยู่ใน JWT)
 * 📌 PATCH /profile — อัพเดทโปรไฟล์ตัวเอง
 * 📌 ต้อง login ก่อน (JwtAuthGuard)
 * 📌 ไม่ต้องเช็ค role — ทุก role แก้โปรไฟล์ตัวเองได้
 */
@Controller('profile')
export class ProfileController {
    constructor(private readonly profileService: ProfileService) { }

    /** GET /profile — ดึงข้อมูลโปรไฟล์ตัวเอง */
    @UseGuards(JwtAuthGuard)
    @Get()
    async getProfile(
        @CurrentUser('users_id') userId: string,
    ) {
        return this.profileService.findOne(userId);
    }

    /**
     * PATCH /profile — อัพเดทโปรไฟล์ตัวเอง
     * อาจารย์/นักศึกษา แก้ได้แค่รูปโปรไฟล์ ไม่สามารถแก้ชื่อหรือเบอร์โทรได้
     */
    @UseGuards(JwtAuthGuard)
    @Patch()
    async update(
        @CurrentUser('users_id') userId: string,
        @CurrentUser('role') role: string,
        @Body() dto: UpdateProfileDto,
    ) {
        return this.profileService.update(userId, role, dto);
    }
}
