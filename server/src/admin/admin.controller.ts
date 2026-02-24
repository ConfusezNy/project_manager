import {
    Controller, Get, Post, Put, Delete,
    Param, Body, Query, UseGuards, ParseIntPipe,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UpdateTeamAdminDto, DeleteTeamDto, AddMemberDto } from './dto/admin.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

    // GET /admin/teams?section_id=&term_id=&status=&search=
    @Get('teams')
    async findAllTeams(
        @Query('section_id') sectionId: string,
        @Query('term_id') termId: string,
        @Query('status') status: string,
        @Query('search') search: string,
    ) {
        return this.adminService.findAllTeams(
            sectionId ? parseInt(sectionId) : undefined,
            termId ? parseInt(termId) : undefined,
            status || undefined,
            search || undefined,
        );
    }

    // DELETE /admin/teams (body: { team_id })
    @Delete('teams')
    async deleteTeamFromBody(@Body() dto: DeleteTeamDto) {
        return this.adminService.deleteTeam(dto.team_id);
    }

    // GET /admin/teams/:teamId
    @Get('teams/:teamId')
    async findOneTeam(@Param('teamId', ParseIntPipe) teamId: number) {
        return this.adminService.findOneTeam(teamId);
    }

    // PUT /admin/teams/:teamId
    @Put('teams/:teamId')
    async updateTeam(
        @Param('teamId', ParseIntPipe) teamId: number,
        @Body() dto: UpdateTeamAdminDto,
    ) {
        return this.adminService.updateTeam(teamId, dto);
    }

    // DELETE /admin/teams/:teamId
    @Delete('teams/:teamId')
    async deleteTeam(@Param('teamId', ParseIntPipe) teamId: number) {
        return this.adminService.deleteTeam(teamId);
    }

    // GET /admin/teams/:teamId/members
    @Get('teams/:teamId/members')
    async getTeamMembers(@Param('teamId', ParseIntPipe) teamId: number) {
        return this.adminService.getTeamMembers(teamId);
    }

    // POST /admin/teams/:teamId/members
    @Post('teams/:teamId/members')
    async addTeamMember(
        @Param('teamId', ParseIntPipe) teamId: number,
        @Body() dto: AddMemberDto,
    ) {
        return this.adminService.addTeamMember(teamId, dto);
    }

    // DELETE /admin/teams/:teamId/members/:memberId
    @Delete('teams/:teamId/members/:memberId')
    async removeTeamMember(
        @Param('teamId', ParseIntPipe) teamId: number,
        @Param('memberId') memberId: string,
    ) {
        return this.adminService.removeTeamMember(teamId, memberId);
    }

    // GET /admin/teams/:teamId/available-members?search=
    @Get('teams/:teamId/available-members')
    async getAvailableMembers(
        @Param('teamId', ParseIntPipe) teamId: number,
        @Query('search') search: string,
    ) {
        return this.adminService.getAvailableMembers(teamId, search || undefined);
    }
}
