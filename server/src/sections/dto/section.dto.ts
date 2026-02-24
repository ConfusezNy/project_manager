import {
    IsString,
    IsEnum,
    IsInt,
    IsOptional,
    IsBoolean,
    Min,
    IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO สำหรับสร้าง Section ใหม่
 * ย้ายจาก: sections/create/route.ts → POST
 * 
 * 📌 class-validator ทำ validation ให้แทน manual check
 * ⚠️ เดิม: เขียน manual 60 บรรทัด (เช็ค missing fields, enum, range...)
 * ✅ ใหม่: class-validator ทำให้อัตโนมัติ
 */
export class CreateSectionDto {
    @IsString()
    section_code: string;

    @IsEnum(['PRE_PROJECT', 'PROJECT'], {
        message: 'course_type ต้องเป็น PRE_PROJECT หรือ PROJECT',
    })
    course_type: string;

    @IsEnum(['REG', 'LE'], {
        message: 'study_type ต้องเป็น REG หรือ LE',
    })
    study_type: string;

    @IsInt()
    @Min(1, { message: 'ขนาดทีมต้องมากกว่า 0' })
    @Type(() => Number)
    min_team_size: number;

    @IsInt()
    @Min(1, { message: 'ขนาดทีมต้องมากกว่า 0' })
    @Type(() => Number)
    max_team_size: number;


    @IsBoolean()
    @IsOptional()
    @Type(() => Boolean)
    team_locked?: boolean;

    @IsInt()
    @Type(() => Number)
    term_id: number;
}

/**
 * DTO สำหรับอัพเดท Section settings
 * ย้ายจาก: sections/[id]/route.ts → PATCH
 * 
 * ทุก field optional → ส่งเฉพาะที่จะแก้
 */
export class UpdateSectionDto {
    @IsBoolean()
    @IsOptional()
    team_locked?: boolean;


    @IsInt()
    @IsOptional()
    @Type(() => Number)
    min_team_size?: number;

    @IsInt()
    @IsOptional()
    @Type(() => Number)
    max_team_size?: number;
}

/**
 * DTO สำหรับ enroll นักศึกษาเข้า Section (batch)
 * ย้ายจาก: sections/[id]/enroll/route.ts → POST
 */
export class EnrollDto {
    @IsArray()
    @IsString({ each: true })
    users_ids: string[];
}

/**
 * DTO สำหรับต่อวิชา PRE_PROJECT → PROJECT
 * ย้ายจาก: sections/[id]/continue-to-project/route.ts → POST
 */
export class ContinueToProjectDto {
    @IsInt()
    @Type(() => Number)
    new_term_id: number;

    @IsArray()
    @IsInt({ each: true })
    @IsOptional()
    team_ids?: number[];
}
