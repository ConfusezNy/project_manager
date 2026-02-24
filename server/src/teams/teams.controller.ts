import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Param,
    Body,
    UseGuards,
    ParseIntPipe,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { TeamsService } from './teams.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import {
    CreateTeamDto,
    InviteDto,
    JoinDto,
    RejectDto,
    AssignNameDto,
} from './dto/team.dto';

/**
 * Teams Controller
 * ย้ายมาจาก: 9 route files ใน client/src/app/api/teams/
 */
@Controller('teams')
export class TeamsController {
    constructor(private readonly teamsService: TeamsService) { }

    // GET /teams — ทีมที่ user เป็นสมาชิก
    @UseGuards(JwtAuthGuard)
    @Get()
    async findAll(@CurrentUser('users_id') userId: string) {
        return this.teamsService.findAll(userId);
    }

    // GET /teams/my-team — ทีมเดียวของ user
    @UseGuards(JwtAuthGuard)
    @Get('my-team')
    async findMyTeam(@CurrentUser('users_id') userId: string) {
        return this.teamsService.findMyTeam(userId);
    }

    // GET /teams/pending-invites — คำเชิญที่รอตอบรับ
    @UseGuards(JwtAuthGuard)
    @Get('pending-invites')
    async getPendingInvites(@CurrentUser() user: any) {
        return this.teamsService.getPendingInvites(user.users_id, user.role);
    }

    // POST /teams — สร้างทีม (Student only)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('STUDENT')
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(
        @CurrentUser('users_id') userId: string,
        @Body() dto: CreateTeamDto,
    ) {
        return this.teamsService.create(userId, dto);
    }

    // POST /teams/invite — เชิญสมาชิก
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('STUDENT')
    @Post('invite')
    async invite(
        @CurrentUser('users_id') userId: string,
        @Body() dto: InviteDto,
    ) {
        return this.teamsService.invite(userId, dto);
    }

    // POST /teams/join — ตอบรับคำเชิญ
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('STUDENT')
    @Post('join')
    async join(
        @CurrentUser('users_id') userId: string,
        @Body() dto: JoinDto,
    ) {
        return this.teamsService.join(userId, dto);
    }

    // POST /teams/leave — ออกจากทีม
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('STUDENT')
    @Post('leave')
    async leave(@CurrentUser('users_id') userId: string) {
        return this.teamsService.leave(userId);
    }

    // POST /teams/reject — ปฏิเสธคำเชิญ
    @UseGuards(JwtAuthGuard)
    @Post('reject')
    async reject(
        @CurrentUser('users_id') userId: string,
        @Body() dto: RejectDto,
    ) {
        return this.teamsService.reject(userId, dto);
    }

    // PATCH /teams/assign-name — Admin ตั้งชื่อทีม
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @Patch('assign-name')
    async assignName(@Body() dto: AssignNameDto) {
        return this.teamsService.assignName(dto);
    }

    // DELETE /teams/:id/members/:memberId — ลบสมาชิก
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('STUDENT')
    @Delete(':id/members/:memberId')
    async removeMember(
        @Param('id', ParseIntPipe) teamId: number,
        @Param('memberId') memberId: string,
        @CurrentUser('users_id') userId: string,
    ) {
        return this.teamsService.removeMember(teamId, memberId, userId);
    }
}
