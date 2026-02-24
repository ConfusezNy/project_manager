import { IsString, IsOptional, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

/** PUT /admin/teams/:teamId — แก้ไขทีม */
export class UpdateTeamAdminDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    groupNumber?: string;

    @IsOptional()
    @IsString()
    status?: string;

    @IsOptional()
    @IsString()
    semester?: string;
}

/** DELETE /admin/teams — ลบทีมจาก body */
export class DeleteTeamDto {
    @IsInt()
    @Type(() => Number)
    team_id: number;
}

/** POST /admin/teams/:teamId/members — เพิ่มสมาชิก */
export class AddMemberDto {
    @IsString()
    user_id: string;
}
