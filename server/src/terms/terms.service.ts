import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTermDto } from './dto/create-term.dto';

/**
 * Terms Service
 * ย้ายมาจาก: client/src/app/api/terms/route.ts
 * 
 * 📌 หน้าที่: จัดการข้อมูลเทอม (ปีการศึกษา + เทอม)
 * 📌 เดิม: ไม่มี auth เลย! (ใครก็สร้างเทอมได้)
 * 📌 แก้ไข: เพิ่ม Admin guard ใน controller
 */
@Injectable()
export class TermsService {
    constructor(private prisma: PrismaService) { }

    /**
     * ดึงรายการเทอมทั้งหมด (เรียงจากใหม่ → เก่า)
     * ย้ายจาก: terms/route.ts → GET
     * 
     * SQL ที่ Prisma สร้าง:
     * SELECT * FROM "Term" ORDER BY "academicYear" DESC, "semester" DESC
     */
    async findAll() {
        return this.prisma.term.findMany({
            orderBy: [
                { academicYear: 'desc' },
                { semester: 'desc' },
            ],
            include: {
                _count: { select: { Section: true } },
            },
        });
    }

    /**
     * สร้างเทอมใหม่
     * ย้ายจาก: terms/route.ts → POST
     * 
     * ⚠️ เดิม: ไม่มี auth → ใครก็สร้างได้
     * ✅ แก้: เพิ่ม @Roles('ADMIN') ใน controller
     * 
     * @param dto - ข้อมูลเทอม (ผ่าน validation แล้ว)
     */
    async create(dto: CreateTermDto) {
        const newTerm = await this.prisma.term.create({
            data: {
                academicYear: dto.academicYear,
                semester: dto.semester,
                startDate: new Date(dto.startDate),
                endDate: new Date(dto.endDate),
            },
        });

        return {
            message: 'สร้างเทอมสำเร็จ',
            data: newTerm,
        };
    }

    /**
     * ลบเทอม — เฉพาะถ้าไม่มี Section ผูกอยู่
     */
    async remove(id: number) {
        const term = await this.prisma.term.findUnique({ where: { term_id: id } });
        if (!term) throw new NotFoundException('ไม่พบเทอมนี้');

        const sectionCount = await this.prisma.section.count({ where: { term_id: id } });
        if (sectionCount > 0) {
            throw new BadRequestException(
                `ไม่สามารถลบได้ มีหมู่เรียน ${sectionCount} หมู่ที่ใช้เทอมนี้อยู่`,
            );
        }

        await this.prisma.term.delete({ where: { term_id: id } });
        return { message: 'ลบเทอมเรียบร้อย' };
    }
}
