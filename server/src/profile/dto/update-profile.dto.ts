import { IsString, IsOptional, MaxLength } from 'class-validator';

/**
 * DTO สำหรับอัพเดทโปรไฟล์
 * 
 * ทุก field เป็น optional → แก้อันไหนส่งอันนั้นได้
 * MaxLength ตรงกับ Prisma schema:
 * - firstname: VarChar(50)
 * - lastname: VarChar(50)
 * - tel_number: VarChar(10)
 */
export class UpdateProfileDto {
    @IsString()
    @IsOptional()
    @MaxLength(50)
    firstname?: string;

    @IsString()
    @IsOptional()
    @MaxLength(50)
    lastname?: string;

    @IsString()
    @IsOptional()
    @MaxLength(10, { message: 'เบอร์โทรศัพท์ต้องไม่เกิน 10 หลัก' })
    tel_number?: string;

    @IsString()
    @IsOptional()
    profilePicture?: string;
}
