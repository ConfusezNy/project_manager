import { IsInt, IsString, IsOptional, IsArray, IsIn, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class GradeItem {
    @IsString()
    student_id: string;

    @IsInt()
    @Type(() => Number)
    project_id: number;

    @IsString()
    @IsIn(['A', 'B_PLUS', 'B', 'C_PLUS', 'C', 'D_PLUS', 'D', 'F'])
    score: string;
}

/** POST /grades — Batch upsert */
export class BatchGradesDto {
    @IsInt()
    @Type(() => Number)
    section_id: number;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => GradeItem)
    grades: GradeItem[];
}

/** PATCH /grades/:id */
export class UpdateGradeDto {
    @IsString()
    @IsIn(['A', 'B_PLUS', 'B', 'C_PLUS', 'C', 'D_PLUS', 'D', 'F'])
    score: string;
}
