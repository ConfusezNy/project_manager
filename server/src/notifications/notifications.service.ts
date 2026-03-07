import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';

/**
 * Notifications Service
 *
 * 📌 จัดการ Notification ทั้งระบบ:
 * - findAll(userId)   → GET /notifications
 * - markAsRead(id)    → PATCH /notifications/:id/read
 * - markAllAsRead(userId) → PATCH /notifications/read-all
 * - create(dto)       → Helper method สำหรับ services อื่นเรียกใช้
 * - createForTeam(teamId, ...) → Helper: แจ้งสมาชิกทีมทุกคน
 */
@Injectable()
export class NotificationsService {
    private readonly logger = new Logger(NotificationsService.name);

    constructor(private prisma: PrismaService) { }

    // =====================================================
    // GET /notifications — ดึง notifications ของ user
    // =====================================================
    async findAll(userId: string) {
        return this.prisma.notification.findMany({
            where: { user_id: userId },
            include: {
                Users_Notification_actor_user_idToUsers: {
                    select: { users_id: true, firstname: true, lastname: true },
                },
                Team: {
                    select: {
                        team_id: true,
                        groupNumber: true,
                        Section: { select: { section_code: true } },
                    },
                },
                Task: {
                    select: { task_id: true, title: true },
                },
                Project: {
                    select: { project_id: true, projectname: true },
                },
            },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
    }

    // =====================================================
    // PATCH /notifications/:id/read — mark เป็นอ่านแล้ว
    // =====================================================
    async markAsRead(id: number, userId: string) {
        return this.prisma.notification.updateMany({
            where: { notification_id: id, user_id: userId },
            data: { isRead: true },
        });
    }

    // =====================================================
    // PATCH /notifications/read-all — mark ทั้งหมดเป็นอ่านแล้ว
    // =====================================================
    async markAllAsRead(userId: string) {
        return this.prisma.notification.updateMany({
            where: { user_id: userId, isRead: false },
            data: { isRead: true },
        });
    }

    // =====================================================
    // Helper: สร้าง notification
    // เรียกจาก services อื่นๆ (Teams, Tasks, Submissions, etc.)
    // =====================================================
    async create(dto: CreateNotificationDto) {
        try {
            // ไม่แจ้งเตือนตัวเอง
            if (dto.actorUserId && dto.userId === dto.actorUserId) {
                return null;
            }

            // ตรวจสอบว่า actorUserId (ถ้ามี) มีอยู่จริงใน DB
            let safeActorId: string | undefined = dto.actorUserId || undefined;
            if (safeActorId) {
                const actorExists = await this.prisma.users.findUnique({
                    where: { users_id: safeActorId },
                    select: { users_id: true },
                });
                if (!actorExists) safeActorId = undefined;
            }

            return await this.prisma.notification.create({
                data: {
                    user_id: dto.userId,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    actor_user_id: (safeActorId ?? null) as any, // nullable after migration 20260306203723
                    event_type: dto.eventType,
                    title: dto.title,
                    message: dto.message,
                    link: dto.link || null,
                    team_id: dto.teamId || null,
                    task_id: dto.taskId || null,
                    project_id: dto.projectId || null,
                },
            });
        } catch (error) {
            // Log error แต่ไม่ fail operation หลัก
            this.logger.error(`Failed to create notification: ${error}`);
            return null;
        }
    }

    // =====================================================
    // Helper: แจ้งสมาชิกทีมทุกคน (ยกเว้น actor)
    // =====================================================
    async createForTeamMembers(
        teamId: number,
        actorUserId: string,
        eventType: string,
        title: string,
        message: string,
        extra?: { link?: string; taskId?: number; projectId?: number },
    ) {
        const members = await this.prisma.teammember.findMany({
            where: { team_id: teamId },
            select: { user_id: true },
        });

        const notifications = members
            .filter((m) => m.user_id !== actorUserId)
            .map((m) =>
                this.create({
                    userId: m.user_id,
                    actorUserId,
                    eventType,
                    title,
                    message,
                    teamId,
                    taskId: extra?.taskId,
                    projectId: extra?.projectId,
                    link: extra?.link,
                }),
            );

        return Promise.all(notifications);
    }

    // =====================================================
    // Helper: แจ้ง advisors ของ project
    // =====================================================
    async createForProjectAdvisors(
        projectId: number,
        actorUserId: string,
        eventType: string,
        title: string,
        message: string,
        extra?: { link?: string; teamId?: number; taskId?: number },
    ) {
        const advisors = await this.prisma.projectAdvisor.findMany({
            where: { project_id: projectId },
            select: { advisor_id: true },
        });

        const notifications = advisors
            .filter((a) => a.advisor_id !== actorUserId)
            .map((a) =>
                this.create({
                    userId: a.advisor_id,
                    actorUserId,
                    eventType,
                    title,
                    message,
                    projectId,
                    teamId: extra?.teamId,
                    taskId: extra?.taskId,
                    link: extra?.link,
                }),
            );

        return Promise.all(notifications);
    }
}
