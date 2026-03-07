import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto, UpdateEventDto } from './dto/event.dto';

/**
 * Events Service
 *
 * 📌 6 endpoints:
 * - findBySection(sectionId)     → GET /events?section_id=
 * - create(dto)                  → POST /events (Admin)
 * - findOne(id)                  → GET /events/:id
 * - update(id, dto)              → PUT /events/:id (Admin)
 * - partialUpdate(id, dto)       → PATCH /events/:id (Admin)
 * - remove(id)                   → DELETE /events/:id (Admin)
 */
@Injectable()
export class EventsService {
    constructor(private prisma: PrismaService) { }

    // =====================================================
    // GET /events?section_id= — ดึง Events ของ Section
    // =====================================================
    async findBySection(sectionId: number) {
        const section = await this.prisma.section.findUnique({
            where: { section_id: sectionId },
        });
        if (!section) {
            throw new NotFoundException('Section not found');
        }

        const events = await this.prisma.event.findMany({
            where: { section_id: sectionId },
            orderBy: { dueDate: 'asc' },
            include: {
                Submission: {
                    include: {
                        Team: { select: { team_id: true, groupNumber: true } },
                    },
                },
                _count: { select: { Submission: true } },
            },
        });

        // คำนวณสถิติ
        return events.map((event) => {
            const totalTeams = event.Submission.length;
            const submitted = event.Submission.filter(
                (s) => s.status === 'SUBMITTED' || s.status === 'APPROVED',
            ).length;
            const approved = event.Submission.filter(
                (s) => s.status === 'APPROVED',
            ).length;

            return {
                ...event,
                stats: { totalTeams, submitted, approved, pending: totalTeams - submitted },
            };
        });
    }

    // =====================================================
    // POST /events — สร้าง Event (Admin)
    // =====================================================
    async create(dto: CreateEventDto) {
        const section = await this.prisma.section.findUnique({
            where: { section_id: dto.section_id },
            include: { Team: true },
        });
        if (!section) {
            throw new NotFoundException('Section not found');
        }

        const event = await this.prisma.event.create({
            data: {
                name: dto.name,
                description: dto.description || null,
                dueDate: new Date(dto.dueDate),
                section_id: dto.section_id,
                requireFile: dto.requireFile ?? false,
            },
        });

        // Auto-create submissions for all teams in section
        // ถ้า requireFile=false → auto-set SUBMITTED (ไม่ต้องอัพโหลดเอกสาร แค่รายละเอียด+วันที่ก็พอ)
        if (dto.createSubmissionsForAllTeams && section.Team.length > 0) {
            const autoStatus = event.requireFile ? 'PENDING' : 'SUBMITTED';
            const autoSubmittedAt = event.requireFile ? null : new Date();
            await this.prisma.submission.createMany({
                data: section.Team.map((team) => ({
                    event_id: event.event_id,
                    team_id: team.team_id,
                    status: autoStatus,
                    submittedAt: autoSubmittedAt,
                })),
            });
        }

        return this.prisma.event.findUnique({
            where: { event_id: event.event_id },
            include: {
                Submission: {
                    include: {
                        Team: { select: { team_id: true, groupNumber: true } },
                    },
                },
            },
        });
    }

    // =====================================================
    // GET /events/:id — ดึง Event เดียว
    // =====================================================
    async findOne(id: number) {
        const event = await this.prisma.event.findUnique({
            where: { event_id: id },
            include: {
                Section: true,
                Submission: {
                    include: {
                        Team: { select: { team_id: true, groupNumber: true } },
                        ApprovedByUser: {
                            select: { users_id: true, firstname: true, lastname: true },
                        },
                    },
                },
            },
        });

        if (!event) {
            throw new NotFoundException('Event not found');
        }

        return event;
    }

    // =====================================================
    // PUT /events/:id — แก้ไข Event (Admin)
    // =====================================================
    async update(id: number, dto: UpdateEventDto) {
        const data: Record<string, unknown> = {};
        if (dto.name) data.name = dto.name;
        if (dto.description !== undefined) data.description = dto.description;
        if (dto.dueDate) data.dueDate = new Date(dto.dueDate);
        if (dto.requireFile !== undefined) data.requireFile = dto.requireFile;

        return this.prisma.event.update({
            where: { event_id: id },
            data,
        });
    }

    // =====================================================
    // PATCH /events/:id — Partial update (Admin)
    // =====================================================
    async partialUpdate(id: number, dto: UpdateEventDto) {
        return this.update(id, dto);
    }

    // =====================================================
    // backfillSubmissionsForTeam — Backfill submissions
    // =====================================================
    async backfillSubmissionsForTeam(teamId: number, sectionId: number, tx?: Parameters<Parameters<typeof this.prisma.$transaction>[0]>[0]) {
        const client = tx ?? this.prisma;

        // ดึง event พร้อม requireFile เพื่อตัดสินใจ status อัตโนมัติ
        const events = await client.event.findMany({
            where: { section_id: sectionId },
            select: { event_id: true, requireFile: true },
        });

        if (events.length === 0) return { backfilled: 0 };

        await client.submission.createMany({
            data: events.map((e) => ({
                event_id: e.event_id,
                team_id: teamId,
                // requireFile=false → auto-submit ทันที ไม่ต้องให้นักเรียนกดส่ง
                status: (e.requireFile ? 'PENDING' : 'SUBMITTED') as 'PENDING' | 'SUBMITTED',
                submittedAt: e.requireFile ? null : new Date(),
            })),
            skipDuplicates: true,
        });

        return { backfilled: events.length };
    }

    // =====================================================
    // DELETE /events/:id — ลบ Event (Admin, cascade submissions)
    // =====================================================
    async remove(id: number) {
        await this.prisma.$transaction(async (tx) => {
            await tx.submission.deleteMany({ where: { event_id: id } });
            await tx.event.delete({ where: { event_id: id } });
        });

        return { message: 'Event deleted successfully' };
    }

    // =====================================================
    // fixNoFileSubmissions — แก้ PENDING submissions ที่เป็น
    // events ไม่ต้องไฟล์ (requireFile=false) ให้เป็น SUBMITTED
    // เรียกได้ 1 ครั้งหลัง deploy เพื่อ fix existing data
    // =====================================================
    async fixNoFileSubmissions() {
        const result = await this.prisma.submission.updateMany({
            where: {
                status: 'PENDING',
                Event: { requireFile: false },
            },
            data: {
                status: 'SUBMITTED',
                submittedAt: new Date(),
            },
        });

        return { fixed: result.count, message: `Updated ${result.count} submissions to SUBMITTED` };
    }
}
