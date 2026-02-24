import { IsInt, IsString, IsOptional, IsIn, IsDateString, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

/** POST /events — สร้าง Event (Admin) */
export class CreateEventDto {
    @IsString()
    name: string;

    @IsString()
    @IsIn(['PROGRESS_REPORT', 'DOCUMENT', 'POSTER', 'EXAM', 'FINAL_SUBMISSION', 'SEMINAR'])
    type: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsInt()
    @Type(() => Number)
    order: number;

    @IsDateString()
    dueDate: string;

    @IsInt()
    @Type(() => Number)
    section_id: number;

    @IsOptional()
    @IsBoolean()
    createSubmissionsForAllTeams?: boolean;
}

/** PUT/PATCH /events/:id — แก้ไข Event (Admin) */
export class UpdateEventDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    type?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsInt()
    @Type(() => Number)
    order?: number;

    @IsOptional()
    @IsDateString()
    dueDate?: string;
}
