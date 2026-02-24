import { Controller, Get, Put, Post, Delete, Param, Body, UseGuards, Query } from '@nestjs/common';
import { AdminTeamsService } from './admin-teams.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin/teams')
export class AdminTeamsController {
    constructor(private readonly adminTeamsService: AdminTeamsService) { }

    // GET /admin/teams?section_id=&status=&search=
    @Get()
    async findAll(@Query() query: { section_id?: string; status?: string; search?: string }) {
        return this.adminTeamsService.findAll(query);
    }

    // GET /admin/teams/:teamId
    @Get(':teamId')
    async findOne(@Param('teamId') teamId: string) {
        return this.adminTeamsService.findOne(Number(teamId));
    }

    // PUT /admin/teams/:teamId
    @Put(':teamId')
    async update(@Param('teamId') teamId: string, @Body() dto: { name?: string; groupNumber?: string }) {
        return this.adminTeamsService.update(Number(teamId), dto);
    }

    // DELETE /admin/teams — body: { team_id }
    // (frontend ส่ง team_id มาใน body สำหรับ delete จากตาราง)
    @Delete()
    async removeByBody(@Body() dto: { team_id: number }) {
        return this.adminTeamsService.removeByBody(dto);
    }

    // DELETE /admin/teams/:teamId
    @Delete(':teamId')
    async remove(@Param('teamId') teamId: string) {
        return this.adminTeamsService.remove(Number(teamId));
    }

    // GET /admin/teams/:teamId/members
    @Get(':teamId/members')
    async getMembers(@Param('teamId') teamId: string) {
        return this.adminTeamsService.getMembers(Number(teamId));
    }

    // POST /admin/teams/:teamId/members — body: { user_id }
    @Post(':teamId/members')
    async addMember(@Param('teamId') teamId: string, @Body() dto: { user_id: string }) {
        return this.adminTeamsService.addMember(Number(teamId), dto);
    }

    // DELETE /admin/teams/:teamId/members/:memberId
    @Delete(':teamId/members/:memberId')
    async removeMember(@Param('teamId') teamId: string, @Param('memberId') memberId: string) {
        return this.adminTeamsService.removeMember(Number(teamId), memberId);
    }

    // GET /admin/teams/:teamId/available-members?search=
    @Get(':teamId/available-members')
    async getAvailableMembers(
        @Param('teamId') teamId: string,
        @Query('search') search?: string,
    ) {
        return this.adminTeamsService.getAvailableMembers(Number(teamId), search);
    }
}
