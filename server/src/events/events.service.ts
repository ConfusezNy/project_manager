import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto, UpdateEventDto } from './dto/event.dto';
import { EventType } from '@prisma/client';

/**
 * Events Service
 * ย้ายมาจาก: 2 route files ใน client/src/app/api/events/
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
    // ย้ายจาก: events/route.ts → GET
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
            orderBy: { order: 'asc' },
            include: {
                Submission: {
                    include: {
                        Team: { select: { team_id: true, name: true, groupNumber: true } },
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
    // ย้ายจาก: events/route.ts → POST
    //
    // 📌 createSubmissionsForAllTeams → auto-create PENDING submissions
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
                type: dto.type as EventType,
                description: dto.description || null,
                order: dto.order,
                dueDate: new Date(dto.dueDate),
                section_id: dto.section_id,
            },
        });

        // Auto-create submissions for all teams in section
        if (dto.createSubmissionsForAllTeams && section.Team.length > 0) {
            await this.prisma.submission.createMany({
                data: section.Team.map((team) => ({
                    event_id: event.event_id,
                    team_id: team.team_id,
                    status: 'PENDING',
                })),
            });
        }

        return this.prisma.event.findUnique({
            where: { event_id: event.event_id },
            include: {
                Submission: {
                    include: {
                        Team: { select: { team_id: true, name: true, groupNumber: true } },
                    },
                },
            },
        });
    }

    // =====================================================
    // GET /events/:id — ดึง Event เดียว
    // ย้ายจาก: events/[id]/route.ts → GET
    // =====================================================
    async findOne(id: number) {
        const event = await this.prisma.event.findUnique({
            where: { event_id: id },
            include: {
                Section: true,
                Submission: {
                    include: {
                        Team: { select: { team_id: true, name: true, groupNumber: true } },
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
    // ย้ายจาก: events/[id]/route.ts → PUT
    // =====================================================
    async update(id: number, dto: UpdateEventDto) {
        const data: Record<string, any> = {};
        if (dto.name) data.name = dto.name;
        if (dto.type) data.type = dto.type;
        if (dto.description !== undefined) data.description = dto.description;
        if (dto.order !== undefined) data.order = dto.order;
        if (dto.dueDate) data.dueDate = new Date(dto.dueDate);

        return this.prisma.event.update({
            where: { event_id: id },
            data,
        });
    }

    // =====================================================
    // PATCH /events/:id — Partial update (Admin)
    // ย้ายจาก: events/[id]/route.ts → PATCH (same logic as PUT)
    // =====================================================
    async partialUpdate(id: number, dto: UpdateEventDto) {
        return this.update(id, dto);
    }

    // =====================================================
    // DELETE /events/:id — ลบ Event (Admin, cascade submissions)
    // ย้ายจาก: events/[id]/route.ts → DELETE
    //
    // ⚠️ โค้ดเดิมไม่ใช้ $transaction → แก้แล้ว
    // =====================================================
    async remove(id: number) {
        await this.prisma.$transaction(async (tx) => {
            await tx.submission.deleteMany({ where: { event_id: id } });
            await tx.event.delete({ where: { event_id: id } });
        });

        return { message: 'Event deleted successfully' };
    }
}
