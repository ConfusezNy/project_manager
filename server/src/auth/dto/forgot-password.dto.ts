/**
 * Forgot Password DTOs
 * สำหรับ flow ลืมรหัสผ่าน → ขอ OTP → เปลี่ยนรหัสผ่านใหม่
 */

import { IsEmail, IsString, Length, MinLength, Matches } from 'class-validator';

// POST /auth/forgot-password — ขอ OTP สำหรับรีเซ็ตรหัสผ่าน
export class ForgotPasswordDto {
    @IsEmail({}, { message: 'รูปแบบอีเมลไม่ถูกต้อง' })
    email: string;
}

// POST /auth/reset-password — ยืนยัน OTP + ตั้งรหัสผ่านใหม่
export class ResetPasswordDto {
    @IsEmail({}, { message: 'รูปแบบอีเมลไม่ถูกต้อง' })
    email: string;

    @IsString()
    @Length(6, 6, { message: 'OTP ต้องมี 6 หลักเท่านั้น' })
    otp: string;

    @IsString()
    @MinLength(8, { message: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร' })
    @Matches(/\d/, { message: 'รหัสผ่านต้องมีตัวเลขอย่างน้อย 1 ตัว' })
    newPassword: string;
}
