import { IsInt, IsString, IsOptional, IsDateString, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

/** POST /events — สร้าง Event (Admin) */
export class CreateEventDto {
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsDateString()
    dueDate: string;

    @IsInt()
    @Type(() => Number)
    section_id: number;

    @IsOptional()
    @IsBoolean()
    requireFile?: boolean;

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
    description?: string;

    @IsOptional()
    @IsDateString()
    dueDate?: string;

    @IsOptional()
    @IsBoolean()
    requireFile?: boolean;
}
