import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubmitDto, FeedbackDto, RejectDto } from './dto/submission.dto';

/**
 * Submissions Service
 * ย้ายมาจาก: 4 route files ใน client/src/app/api/submissions/
 *
 * 📌 4 endpoints:
 * - findAll(query, user)         → GET /submissions
 * - submit(id, userId, dto)      → PATCH /submissions/:id/submit
 * - approve(id, userId, dto)     → PATCH /submissions/:id/approve
 * - reject(id, userId, dto)      → PATCH /submissions/:id/reject
 */
@Injectable()
export class SubmissionsService {
    constructor(private prisma: PrismaService) { }

    // =====================================================
    // GET /submissions?event_id=&team_id= — ดึง submissions
    // ย้ายจาก: submissions/route.ts → GET
    //
    // 📌 Student ดูได้เฉพาะของทีมตัวเอง
    // =====================================================
    async findAll(
        eventId: number | null,
        teamId: number | null,
        userId: string,
        userRole: string,
    ) {
        const where: any = {};

        if (eventId) where.event_id = eventId;
        if (teamId) where.team_id = teamId;

        // Student ดูเฉพาะของทีมตัวเอง
        if (userRole === 'STUDENT') {
            const membership = await this.prisma.teammember.findFirst({
                where: { user_id: userId },
            });
            if (membership) {
                where.team_id = membership.team_id;
            } else {
                return [];
            }
        }

        return this.prisma.submission.findMany({
            where,
            include: {
                Event: {
                    select: {
                        event_id: true,
                        name: true,
                        type: true,
                        dueDate: true,
                        order: true,
                        description: true,
                        Section: {
                            select: {
                                section_id: true,
                                section_code: true,
                                course_type: true,
                                Term: {
                                    select: { term_id: true, semester: true, academicYear: true },
                                },
                            },
                        },
                    },
                },
                Team: { select: { team_id: true, name: true, groupNumber: true } },
                ApprovedByUser: {
                    select: { users_id: true, firstname: true, lastname: true },
                },
            },
            orderBy: [
                { Event: { Section: { section_code: 'asc' } } },
                { Event: { order: 'asc' } },
            ],
        });
    }

    // =====================================================
    // PATCH /submissions/:id/submit — ส่งงาน (Student/Admin)
    // ย้ายจาก: submissions/[id]/submit/route.ts → PATCH
    // =====================================================
    async submit(id: number, userId: string, userRole: string, dto: SubmitDto) {
        const submission = await this.prisma.submission.findUnique({
            where: { submission_id: id },
            include: { Team: { include: { Teammember: true } } },
        });

        if (!submission) {
            throw new NotFoundException('Submission not found');
        }

        const isMember = submission.Team.Teammember.some(
            (m) => m.user_id === userId,
        );
        if (!isMember && userRole !== 'ADMIN') {
            throw new ForbiddenException('You are not a member of this team');
        }

        return this.prisma.submission.update({
            where: { submission_id: id },
            data: {
                status: 'SUBMITTED',
                submittedAt: new Date(),
                file: dto.file || null,
            },
            include: {
                Event: { select: { event_id: true, name: true, type: true } },
                Team: { select: { team_id: true, name: true } },
            },
        });
    }

    // =====================================================
    // PATCH /submissions/:id/approve — อนุมัติ (Advisor/Admin)
    // ย้ายจาก: submissions/[id]/approve/route.ts → PATCH
    // =====================================================
    async approve(id: number, userId: string, dto: FeedbackDto) {
        const submission = await this.prisma.submission.findUnique({
            where: { submission_id: id },
        });
        if (!submission) {
            throw new NotFoundException('Submission not found');
        }

        return this.prisma.submission.update({
            where: { submission_id: id },
            data: {
                status: 'APPROVED',
                approvedAt: new Date(),
                approvedBy: userId,
                feedback: dto.feedback || null,
            },
            include: {
                Event: { select: { event_id: true, name: true, type: true } },
                Team: { select: { team_id: true, name: true } },
                ApprovedByUser: {
                    select: { users_id: true, firstname: true, lastname: true },
                },
            },
        });
    }

    // =====================================================
    // PATCH /submissions/:id/reject — ปฏิเสธ (Advisor/Admin)
    // ย้ายจาก: submissions/[id]/reject/route.ts → PATCH
    // =====================================================
    async reject(id: number, dto: RejectDto) {
        const submission = await this.prisma.submission.findUnique({
            where: { submission_id: id },
        });
        if (!submission) {
            throw new NotFoundException('Submission not found');
        }

        return this.prisma.submission.update({
            where: { submission_id: id },
            data: {
                status: 'NEEDS_REVISION',
                feedback: dto.feedback,
                approvedAt: null,
                approvedBy: null,
            },
            include: {
                Event: { select: { event_id: true, name: true, type: true } },
                Team: { select: { team_id: true, name: true } },
            },
        });
    }
}
