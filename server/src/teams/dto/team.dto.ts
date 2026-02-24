import { IsInt, IsString, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

/** POST /teams — สร้างทีมใหม่ (Student) */
export class CreateTeamDto {
    @IsInt()
    @Type(() => Number)
    sectionId: number;
}

/** POST /teams/invite — เชิญสมาชิก */
export class InviteDto {
    @IsInt()
    @Type(() => Number)
    teamId: number;

    @IsString()
    inviteeUserId: string;
}

/** POST /teams/join — ตอบรับคำเชิญ */
export class JoinDto {
    @IsInt()
    @Type(() => Number)
    notificationId: number;
}

/** POST /teams/reject — ปฏิเสธคำเชิญ */
export class RejectDto {
    @IsInt()
    @Type(() => Number)
    notificationId: number;
}

/** PATCH /teams/assign-name — Admin ตั้งชื่อทีม */
export class AssignNameDto {
    @IsInt()
    @Type(() => Number)
    teamId: number;

    @IsString()
    teamname: string;
}
