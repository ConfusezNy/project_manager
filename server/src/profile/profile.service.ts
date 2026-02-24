import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

/**
 * Profile Service
 * ย้ายมาจาก: client/src/app/api/profile/route.ts
 * 
 * 📌 หน้าที่: อัพเดทข้อมูลส่วนตัวของ user ที่ login อยู่
 * 
 * ⚠️ สิ่งที่แก้ไขจากโค้ดเดิม:
 * 1. เดิม: ใช้ session.user.email หา user → อาจถูก spoof
 * 2. แก้: ใช้ users_id จาก JWT token → ปลอดภัยกว่า
 *    (token ถูกเซ็นด้วย secret → แก้ไม่ได้)
 */
@Injectable()
export class ProfileService {
    constructor(private prisma: PrismaService) { }

    /**
     * อัพเดทโปรไฟล์
     * ย้ายจาก: profile/route.ts → PATCH
     * 
     * 📌 เปรียบเทียบโค้ดเดิม:
     * 
     * เดิม (Next.js):
     * ```
     * const session = await getServerSession();
     * where: { email: session.user.email }  // ← ใช้ email
     * ```
     * 
     * ใหม่ (NestJS):
     * ```
     * where: { users_id: userId }  // ← ใช้ users_id จาก JWT
     * ```
     * 
     * @param userId - users_id ดึงจาก JWT (ใน controller ใช้ @CurrentUser('users_id'))
     * @param dto - ข้อมูลที่จะอัพเดท (ส่งเฉพาะ field ที่แก้ก็ได้)
     */
    async update(userId: string, dto: UpdateProfileDto) {
        const updatedUser = await this.prisma.users.update({
            where: { users_id: userId },
            data: {
                ...(dto.firstname !== undefined && { firstname: dto.firstname }),
                ...(dto.lastname !== undefined && { lastname: dto.lastname }),
                ...(dto.tel_number !== undefined && { tel_number: dto.tel_number }),
                ...(dto.profilePicture !== undefined && { profilePicture: dto.profilePicture }),
            },
        });

        return {
            message: 'บันทึกสำเร็จ',
            data: {
                users_id: updatedUser.users_id,
                firstname: updatedUser.firstname,
                lastname: updatedUser.lastname,
                tel_number: updatedUser.tel_number,
                email: updatedUser.email,
                profilePicture: updatedUser.profilePicture,
            },
        };
    }
}
