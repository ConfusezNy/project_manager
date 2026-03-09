import { Controller, Get, Post, Delete, Body, Param, ParseIntPipe, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { TermsService } from './terms.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CreateTermDto } from './dto/create-term.dto';

/**
 * Terms Controller
 * ย้ายมาจาก: client/src/app/api/terms/route.ts
 * 
 * 📌 Request Flow (POST /terms ตัวอย่าง):
 * 1. Client ส่ง POST /terms + Bearer token
 * 2. JwtAuthGuard → ตรวจ token → ใส่ user ใน request
 * 3. RolesGuard → ตรวจว่า user.role === 'ADMIN'
 * 4. ValidationPipe → ตรวจ body ตาม CreateTermDto
 * 5. TermsService.create() → Prisma query → return
 */
@Controller('terms')
export class TermsController {
    constructor(private readonly termsService: TermsService) { }

    /**
     * GET /terms — ดึงรายการเทอมทั้งหมด
     * 
     * 🛡️ เพิ่ม Auth guard (โค้ดเดิมไม่มี auth!)
     * เดิม: ใครเรียกก็ได้ ไม่ต้อง login
     * แก้: ต้อง login ก่อน (แต่ไม่จำกัด role)
     */
    @UseGuards(JwtAuthGuard)
    @Get()
    async findAll() {
        return this.termsService.findAll();
    }

    /**
     * POST /terms — สร้างเทอมใหม่
     * 
     * 🛡️ เพิ่ม Admin guard (โค้ดเดิมไม่มี auth เลย — ใครก็สร้าง term ได้!)
     * เดิม: ไม่มี auth → security gap!
     * แก้: Admin only
     * 
     * @param dto — body ที่ส่งมา (ผ่าน validation แล้ว จาก CreateTermDto)
     */
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() dto: CreateTermDto) {
        return this.termsService.create(dto);
    }

    /**
     * DELETE /terms/:id — ลบเทอม (เฉพาะถ้าไม่มี Section ผูก)
     * 🛡️ Admin only
     */
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number) {
        return this.termsService.remove(id);
    }
}
