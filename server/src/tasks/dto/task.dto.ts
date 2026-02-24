import { IsInt, IsString, IsOptional, IsArray, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

/** POST /tasks — สร้าง Task */
export class CreateTaskDto {
    @IsString()
    title: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    status?: string;

    @IsOptional()
    @IsString()
    priority?: string;

    @IsOptional()
    @IsString()
    tags?: string;

    @IsOptional()
    @IsDateString()
    startDate?: string;

    @IsOptional()
    @IsDateString()
    dueDate?: string;

    @IsInt()
    @Type(() => Number)
    project_id: number;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    assigneeIds?: string[];
}

/** PUT /tasks/:id — แก้ไข Task */
export class UpdateTaskDto {
    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    status?: string;

    @IsOptional()
    @IsString()
    priority?: string;

    @IsOptional()
    @IsString()
    tags?: string;

    @IsOptional()
    @IsDateString()
    startDate?: string;

    @IsOptional()
    @IsDateString()
    dueDate?: string;

    @IsOptional()
    @IsInt()
    @Type(() => Number)
    position?: number;
}

/** POST /tasks/:id/assign — มอบหมายงาน */
export class AssignTaskDto {
    @IsString()
    user_id: string;
}

/** POST /tasks/:id/comments — เพิ่ม comment */
export class CreateCommentDto {
    @IsString()
    text: string;
}
