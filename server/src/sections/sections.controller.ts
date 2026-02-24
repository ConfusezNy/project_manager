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
import { SectionsService } from './sections.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import {
    CreateSectionDto,
    UpdateSectionDto,
    EnrollDto,
    ContinueToProjectDto,
} from './dto/section.dto';

/**
 * Sections Controller
 * ย้ายมาจาก: 10 route files ใน client/src/app/api/sections/
 * 
 * 📌 ParseIntPipe คืออะไร?
 * → NestJS จะแปลง param ":id" (string) → number ให้อัตโนมัติ
 * → ถ้าส่งค่าที่ไม่ใช่ตัวเลข → return 400 Bad Request
 * → แทนการเขียน `const id = Number(params.id); if (isNaN(id)) ...`
 */
@Controller('sections')
export class SectionsController {
    constructor(private readonly sectionsService: SectionsService) { }

    // ==========================================
    // GET /sections — ดึงรายการทั้งหมด
    // 🛡️ เดิม: ไม่มี auth → แก้: ต้อง login
    // ==========================================
    @UseGuards(JwtAuthGuard)
    @Get()
    async findAll() {
        return this.sectionsService.findAll();
    }

    // ==========================================
    // GET /sections/my-section — section ที่ login อยู่
    // 🛡️ Student only
    //
    // ⚠️ ต้องอยู่ก่อน :id routes!
    // ไม่งั้น "my-section" จะถูก match เป็น :id
    // ==========================================
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('STUDENT')
    @Get('my-section')
    async findMySection(@CurrentUser('users_id') userId: string) {
        return this.sectionsService.findMySection(userId);
    }

    // ==========================================
    // GET /sections/:id — ดึง section เดียว
    // ==========================================
    @UseGuards(JwtAuthGuard)
    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.sectionsService.findOne(id);
    }

    // ==========================================
    // POST /sections — สร้าง section ใหม่
    // 🛡️ Admin only
    // ==========================================
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() dto: CreateSectionDto) {
        return this.sectionsService.create(dto);
    }

    // ==========================================
    // PATCH /sections/:id — อัพเดท settings
    // 🛡️ Admin only
    // ==========================================
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @Patch(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateSectionDto,
    ) {
        return this.sectionsService.update(id, dto);
    }

    // ==========================================
    // DELETE /sections/:id — ลบ section
    // 🛡️ Admin only
    // ==========================================
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number) {
        return this.sectionsService.remove(id);
    }

    // ==========================================
    // POST /sections/:id/enroll — ลงทะเบียนนักศึกษา (batch)
    // 🛡️ Admin only
    // ==========================================
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @Post(':id/enroll')
    async enroll(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: EnrollDto,
    ) {
        return this.sectionsService.enroll(id, dto);
    }

    // ==========================================
    // GET /sections/:id/enrollments — รายชื่อนักศึกษา
    // 🛡️ Admin only
    // ==========================================
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @Get(':id/enrollments')
    async findEnrollments(@Param('id', ParseIntPipe) id: number) {
        return this.sectionsService.findEnrollments(id);
    }

    // ==========================================
    // GET /sections/:id/teams — รายการทีมใน section
    // 🛡️ Admin only
    // ==========================================
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @Get(':id/teams')
    async findTeams(@Param('id', ParseIntPipe) id: number) {
        return this.sectionsService.findTeams(id);
    }

    // ==========================================
    // GET /sections/:id/candidates — นักศึกษาที่ match section code
    // 🛡️ Admin only
    // ==========================================
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @Get(':id/candidates')
    async findCandidates(@Param('id', ParseIntPipe) id: number) {
        return this.sectionsService.findCandidates(id);
    }

    // ==========================================
    // GET /sections/:id/available-students
    // นักศึกษาที่ลงทะเบียนแล้วแต่ยังไม่มีทีม
    // 🛡️ Auth (ทุก role)
    // ==========================================
    @UseGuards(JwtAuthGuard)
    @Get(':id/available-students')
    async findAvailableStudents(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser('users_id') userId: string,
    ) {
        return this.sectionsService.findAvailableStudents(id, userId);
    }

    // ==========================================
    // POST /sections/:id/continue-to-project
    // ต่อวิชา PRE_PROJECT → PROJECT
    // 🛡️ Admin only
    // ==========================================
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @Post(':id/continue-to-project')
    async continueToProject(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: ContinueToProjectDto,
    ) {
        return this.sectionsService.continueToProject(id, dto);
    }
}
