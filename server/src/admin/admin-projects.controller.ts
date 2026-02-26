import { Controller, Get, Patch, Param, ParseIntPipe, UseGuards, Query } from '@nestjs/common';
import { AdminTeamsService } from './admin-teams.service';
import { ProjectsService } from '../projects/projects.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { AdminProjectQueryDto } from './dto/admin-project.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin/projects')
export class AdminProjectsController {
    constructor(
        private readonly adminTeamsService: AdminTeamsService,
        private readonly projectsService: ProjectsService,
    ) { }

    // GET /admin/projects?section_id=&status=&search=
    @Get()
    async findAll(@Query() query: AdminProjectQueryDto) {
        return this.adminTeamsService.findAllProjects(query);
    }

    // PATCH /admin/projects/:id/archive — toggle เผยแพร่/ยกเลิก
    @Patch(':id/archive')
    async toggleArchive(@Param('id', ParseIntPipe) id: number) {
        return this.projectsService.toggleArchive(id);
    }
}
