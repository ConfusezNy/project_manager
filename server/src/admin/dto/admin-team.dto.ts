import { IsString, IsOptional, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

/** GET /admin/teams?section_id=&status=&search= — query filters */
export class AdminTeamQueryDto {
    @IsOptional()
    @IsString()
    section_id?: string;

    @IsOptional()
    @IsString()
    status?: string;

    @IsOptional()
    @IsString()
    search?: string;
}

/** PUT /admin/teams/:teamId — แก้ไขชื่อ/เลขกลุ่ม */
export class UpdateAdminTeamDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    groupNumber?: string;
}

/** DELETE /admin/teams — body: { team_id } */
export class DeleteTeamBodyDto {
    @IsInt()
    @Type(() => Number)
    team_id: number;
}

/** POST /admin/teams/:teamId/members — body: { user_id } */
export class AddMemberDto {
    @IsString()
    user_id: string;
}
