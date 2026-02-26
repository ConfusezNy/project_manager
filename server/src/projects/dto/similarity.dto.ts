import { IsString, IsOptional } from 'class-validator';

/** POST /projects/check-similarity — ตรวจสอบโครงงานซ้ำ */
export class CheckSimilarityDto {
    @IsString()
    title: string;

    @IsOptional()
    @IsString()
    description?: string;
}
