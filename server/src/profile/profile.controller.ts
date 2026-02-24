import { Controller, Patch, Body, UseGuards } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';

/**
 * Profile Controller
 * ย้ายมาจาก: client/src/app/api/profile/route.ts
 * 
 * 📌 มีแค่ PATCH เดียว — อัพเดทโปรไฟล์ตัวเอง
 * 📌 ต้อง login ก่อน (JwtAuthGuard)
 * 📌 ไม่ต้องเช็ค role — ทุก role แก้โปรไฟล์ตัวเองได้
 * 
 * 📌 @CurrentUser('users_id') คืออะไร?
 * → ดึง users_id จาก JWT token ที่ user ส่งมา
 * → ดูรายละเอียดที่ src/common/decorators/current-user.decorator.ts
 */
@Controller('profile')
export class ProfileController {
    constructor(private readonly profileService: ProfileService) { }

    /**
     * PATCH /profile — อัพเดทโปรไฟล์ตัวเอง
     * 
     * ตัวอย่างการเรียก:
     * ```
     * fetch('/profile', {
     *   method: 'PATCH',
     *   headers: {
     *     'Authorization': 'Bearer <token>',
     *     'Content-Type': 'application/json'
     *   },
     *   body: JSON.stringify({ firstname: 'สมชาย', tel_number: '0812345678' })
     * })
     * ```
     */
    @UseGuards(JwtAuthGuard)
    @Patch()
    async update(
        @CurrentUser('users_id') userId: string,
        @Body() dto: UpdateProfileDto,
    ) {
        return this.profileService.update(userId, dto);
    }
}
