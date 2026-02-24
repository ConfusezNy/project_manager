import { IsInt, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO สำหรับสร้าง Term ใหม่
 * 
 * ตัวอย่าง body ที่ส่งมา:
 * {
 *   "academicYear": 2568,
 *   "semester": 1,
 *   "startDate": "2025-06-01",
 *   "endDate": "2025-10-31"
 * }
 * 
 * class-validator จะตรวจให้อัตโนมัติ:
 * - ถ้าไม่ส่ง field → error
 * - ถ้าส่งผิดเป็น string "abc" → error (เพราะ @IsInt)
 * - transform: true ใน main.ts จะแปลง string "2568" → number 2568
 */
export class CreateTermDto {
    @IsInt()
    @Type(() => Number) // แปลง string → number อัตโนมัติ
    academicYear: number;

    @IsInt()
    @Type(() => Number)
    semester: number;

    @IsDateString() // รับ ISO format เช่น "2025-06-01"
    startDate: string;

    @IsDateString()
    endDate: string;
}
