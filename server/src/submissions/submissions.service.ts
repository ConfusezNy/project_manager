import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { SubmitDto, FeedbackDto, RejectDto } from './dto/submission.dto';

/**
 * Submissions Service
 *
 * 📌 4 endpoints:
 * - findAll(query, user)         → GET /submissions
 * - submit(id, userId, dto)      → PATCH /submissions/:id/submit
 * - approve(id, userId, dto)     → PATCH /submissions/:id/approve
 * - reject(id, userId, dto)      → PATCH /submissions/:id/reject
 */
@Injectable()
export class SubmissionsService {
    constructor(
        private prisma: PrismaService,
        private notificationsService: NotificationsService,
    ) { }

    // =====================================================
    // GET /submissions?event_id=&team_id= — ดึง submissions
    // =====================================================
    async findAll(
        eventId: number | null,
        teamId: number | null,
        userId: string,
        userRole: string,
        sectionIds?: number[],
    ) {
        const where: Record<string, unknown> = {};

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

        // filter เฉพาะ events ใน section ที่ระบุ (ถ้ามี)
        if (sectionIds && sectionIds.length > 0) {
            where.Event = { section_id: { in: sectionIds } };
        }

        return this.prisma.submission.findMany({
            where,
            include: {
                Event: {
                    select: {
                        event_id: true,
                        name: true,
                        requireFile: true,
                        dueDate: true,
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
                Team: { select: { team_id: true, groupNumber: true } },
                ApprovedByUser: {
                    select: { users_id: true, firstname: true, lastname: true },
                },
            },
            orderBy: [
                { Event: { Section: { section_code: 'asc' } } },
                { Event: { dueDate: 'asc' } },
            ],
        });
    }

    // =====================================================
    // PATCH /submissions/:id/submit — ส่งงาน (Student/Admin)
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

        const updated = await this.prisma.submission.update({
            where: { submission_id: id },
            data: {
                status: 'SUBMITTED',
                submittedAt: new Date(),
                file: dto.file || null,
            },
        });

        // แจ้ง advisor ว่ามีการส่งงานใหม่
        const team = await this.prisma.team.findUnique({
            where: { team_id: updated.team_id },
            include: {
                Project: { include: { ProjectAdvisor: true } },
                _count: false,
            },
        });
        const event = await this.prisma.event.findUnique({
            where: { event_id: updated.event_id },
            select: { name: true },
        });

        if (team?.Project) {
            await this.notificationsService.createForProjectAdvisors(
                team.Project.project_id,
                userId,
                'SUBMISSION_SUBMITTED',
                'มีการส่งงานใหม่',
                `กลุ่ม ${team.groupNumber} ส่งงาน "${event?.name ?? ''}"`,
                { teamId: updated.team_id, link: '/events' },
            );
        }

        return updated;
    }

    // =====================================================
    // PATCH /submissions/:id/approve — อนุมัติ (Advisor/Admin)
    // =====================================================
    async approve(id: number, userId: string, dto: FeedbackDto) {
        const submission = await this.prisma.submission.findUnique({
            where: { submission_id: id },
        });
        if (!submission) {
            throw new NotFoundException('Submission not found');
        }

        const approved = await this.prisma.submission.update({
            where: { submission_id: id },
            data: {
                status: 'APPROVED',
                approvedAt: new Date(),
                approvedBy: userId,
                feedback: dto.feedback || null,
            },
            include: {
                ApprovedByUser: {
                    select: { users_id: true, firstname: true, lastname: true },
                },
            },
        });

        // ดึง event/team แยกสำหรับ notification
        const [team, event] = await Promise.all([
            this.prisma.team.findUnique({ where: { team_id: approved.team_id }, select: { team_id: true, groupNumber: true } }),
            this.prisma.event.findUnique({ where: { event_id: approved.event_id }, select: { name: true } }),
        ]);

        // แจ้งสมาชิกทีมว่างานได้รับการอนุมัติ
        if (team) {
            await this.notificationsService.createForTeamMembers(
                team.team_id,
                userId,
                'SUBMISSION_APPROVED',
                'งานได้รับการอนุมัติ',
                `งาน "${event?.name ?? ''}" ได้รับการอนุมัติแล้ว`,
                { link: '/events' },
            );
        }

        return approved;
    }

    // =====================================================
    // PATCH /submissions/:id/reject — ปฏิเสธ (Advisor/Admin)
    // =====================================================
    async reject(id: number, dto: RejectDto) {
        const submission = await this.prisma.submission.findUnique({
            where: { submission_id: id },
        });
        if (!submission) {
            throw new NotFoundException('Submission not found');
        }

        const rejected = await this.prisma.submission.update({
            where: { submission_id: id },
            data: {
                status: 'NEEDS_REVISION',
                feedback: dto.feedback,
                approvedAt: null,
                approvedBy: null,
            },
        });

        // ดึง event/team แยกสำหรับ notification
        const event = await this.prisma.event.findUnique({
            where: { event_id: rejected.event_id },
            select: { name: true },
        });

        // แจ้งสมาชิกทีมว่างานถูกขอแก้ไข
        await this.notificationsService.createForTeamMembers(
            rejected.team_id,
            '', // system action
            'SUBMISSION_REJECTED',
            'งานถูกขอแก้ไข',
            `งาน "${event?.name ?? ''}" ต้องแก้ไข: ${dto.feedback || ''}`,
            { link: '/events' },
        );

        return rejected;
    }
}
