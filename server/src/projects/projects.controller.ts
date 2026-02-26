import {
    Controller,
    Get,
    Post,
    Put,
    Patch,
    Delete,
    Param,
    Body,
    Query,
    UseGuards,
    ParseIntPipe,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import {
    CreateProjectDto,
    UpdateProjectDto,
    AddAdvisorDto,
    UpdateStatusDto,
} from './dto/project.dto';
import { CheckSimilarityDto } from './dto/similarity.dto';

/**
 * Projects Controller
 * ย้ายมาจาก: 4 route files ใน client/src/app/api/projects/
 */
@Controller('projects')
export class ProjectsController {
    constructor(private readonly projectsService: ProjectsService) { }

    // GET /projects/archive/filters — ดึงตัวเลือก filter จากข้อมูลจริง
    @UseGuards(JwtAuthGuard)
    @Get('archive/filters')
    async getArchiveFilters() {
        return this.projectsService.getArchiveFilters();
    }

    // GET /projects/archive — คลังปริญญานิพนธ์ (ทุก role)
    @UseGuards(JwtAuthGuard)
    @Get('archive')
    async findArchived(@Query() query: { q?: string; year?: string; category?: string; advisor?: string }) {
        return this.projectsService.findArchived(query);
    }

    // GET /projects?team_id= — โครงงานของทีม
    @UseGuards(JwtAuthGuard)
    @Get()
    async findByTeam(@Query('team_id', ParseIntPipe) teamId: number) {
        return this.projectsService.findByTeam(teamId);
    }

    // POST /projects/check-similarity — ตรวจสอบโครงงานซ้ำ
    @UseGuards(JwtAuthGuard)
    @Post('check-similarity')
    @HttpCode(HttpStatus.OK)
    async checkSimilarity(@Body() dto: CheckSimilarityDto) {
        return this.projectsService.checkSimilarity(dto);
    }

    // POST /projects — สร้างโครงงาน
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('STUDENT')
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(
        @CurrentUser('users_id') userId: string,
        @Body() dto: CreateProjectDto,
    ) {
        return this.projectsService.create(userId, dto);
    }

    // PUT /projects/:id — แก้ไขโครงงาน
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('STUDENT')
    @Put(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser('users_id') userId: string,
        @Body() dto: UpdateProjectDto,
    ) {
        return this.projectsService.update(id, userId, dto);
    }

    // DELETE /projects/:id — ลบโครงงาน (ก่อน approve)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('STUDENT')
    @Delete(':id')
    async remove(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser('users_id') userId: string,
    ) {
        return this.projectsService.remove(id, userId);
    }

    // POST /projects/:id/advisor — เพิ่มอาจารย์ที่ปรึกษา
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('STUDENT')
    @Post(':id/advisor')
    async addAdvisor(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser('users_id') userId: string,
        @Body() dto: AddAdvisorDto,
    ) {
        return this.projectsService.addAdvisor(id, userId, dto);
    }

    // DELETE /projects/:id/advisor — ลบอาจารย์ที่ปรึกษา
    @UseGuards(JwtAuthGuard)
    @Delete(':id/advisor')
    async removeAdvisor(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser('users_id') userId: string,
    ) {
        return this.projectsService.removeAdvisor(id, userId);
    }

    // PUT /projects/:id/status — อนุมัติ/ปฏิเสธ (Advisor only)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADVISOR')
    @Put(':id/status')
    async updateStatus(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser('users_id') userId: string,
        @Body() dto: UpdateStatusDto,
    ) {
        return this.projectsService.updateStatus(id, userId, dto);
    }
}
