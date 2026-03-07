/**
 * OTP DTO
 * สร้างใหม่สำหรับระบบ OTP Email (ยืนยันตัวตนด้วย @mail.rmutt.ac.th / @en.rmutt.ac.th)
 * ⚠️ DEV MODE: รับ @gmail.com ด้วย สำหรับทดสอบ role ADVISOR
 * TODO: ลบ @gmail.com ออกก่อน production
 */

import { IsEmail, IsString, Length, Matches } from 'class-validator';

// =====================================================
// POST /auth/request-otp — ขอ OTP
// =====================================================
export class RequestOtpDto {
    @IsEmail({}, { message: 'รูปแบบอีเมลไม่ถูกต้อง' })
    // DEV: รับ @gmail.com ด้วย → ทำให้ role = ADVISOR ใน verifyOtp()
    @Matches(/@(mail|en)\.rmutt\.ac\.th$|@gmail\.com$/, {
        message: 'อีเมลต้องเป็น @mail.rmutt.ac.th (นักศึกษา) หรือ @en.rmutt.ac.th (อาจารย์) เท่านั้น',
    })
    email: string;
}

// =====================================================
// POST /auth/verify-otp — ยืนยัน OTP
// =====================================================
export class VerifyOtpDto {
    @IsEmail({}, { message: 'รูปแบบอีเมลไม่ถูกต้อง' })
    email: string;

    @IsString()
    @Length(6, 6, { message: 'OTP ต้องมี 6 หลักเท่านั้น' })
    otp: string;
}
