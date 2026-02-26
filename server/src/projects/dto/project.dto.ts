import { IsInt, IsString, IsOptional, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

/** POST /projects — สร้างโครงงาน */
export class CreateProjectDto {
    @IsString()
    projectname: string;

    @IsOptional()
    @IsString()
    projectnameEng?: string;

    @IsOptional()
    @IsString()
    project_type?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsInt()
    @Type(() => Number)
    team_id: number;
}

/** PUT /projects/:id — แก้ไขโครงงาน */
export class UpdateProjectDto {
    @IsOptional()
    @IsString()
    projectname?: string;

    @IsOptional()
    @IsString()
    projectnameEng?: string;

    @IsOptional()
    @IsString()
    project_type?: string;

    @IsOptional()
    @IsString()
    description?: string;
}

/** POST /projects/:id/advisor — เพิ่มอาจารย์ที่ปรึกษา */
export class AddAdvisorDto {
    @IsString()
    advisor_id: string;
}

/** PUT /projects/:id/status — อนุมัติ/ปฏิเสธ */
export class UpdateStatusDto {
    @IsString()
    @IsIn(['APPROVED', 'REJECTED'])
    status: 'APPROVED' | 'REJECTED';

    @IsOptional()
    @IsString()
    comment?: string;
}
