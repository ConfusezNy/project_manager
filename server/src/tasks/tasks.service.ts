import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto, UpdateTaskDto, AssignTaskDto, CreateCommentDto } from './dto/task.dto';

/**
 * Tasks Service
 * ย้ายมาจาก: 4 route files ใน client/src/app/api/tasks/
 *
 * 📌 9 endpoints:
 * - findByProject(projectId, user) → GET /tasks?project_id=
 * - create(userId, userRole, dto)  → POST /tasks
 * - findOne(id, user)              → GET /tasks/:id
 * - update(id, user, dto)          → PUT /tasks/:id
 * - remove(id, user)               → DELETE /tasks/:id
 * - assign(id, user, dto)          → POST /tasks/:id/assign
 * - unassign(id, user, dto)        → DELETE /tasks/:id/assign
 * - getComments(id, user)          → GET /tasks/:id/comments
 * - addComment(id, userId, userRole, dto) → POST /tasks/:id/comments
 */
@Injectable()
export class TasksService {
    constructor(private prisma: PrismaService) { }

    // =====================================================
    // Helper: ดึง task + เช็คสิทธิ์ (สมาชิกทีม หรือ advisor)
    // =====================================================
    private async getTaskWithAuthCheck(taskId: number, userId: string, userRole: string) {
        const task = await this.prisma.task.findUnique({
            where: { task_id: taskId },
            include: {
                Project: { include: { Team: { include: { Teammember: true } } } },
            },
        });
        if (!task) {
            throw new NotFoundException('Task not found');
        }

        const isMember = task.Project.Team.Teammember.some(
            (m) => m.user_id === userId,
        );
        const isAdvisor = userRole === 'ADVISOR';
        const isAdmin = userRole === 'ADMIN';

        if (!isMember && !isAdvisor && !isAdmin) {
            throw new ForbiddenException('Forbidden');
        }

        return task;
    }

    // =====================================================
    // GET /tasks?project_id= — ดึง Tasks ของ Project
    // ย้ายจาก: tasks/route.ts → GET
    // =====================================================
    async findByProject(projectId: number, userId: string, userRole: string) {
        const project = await this.prisma.project.findUnique({
            where: { project_id: projectId },
            include: { Team: { include: { Teammember: true } } },
        });
        if (!project) {
            throw new NotFoundException('Project not found');
        }

        const isMember = project.Team.Teammember.some(
            (m) => m.user_id === userId,
        );
        if (!isMember && userRole !== 'ADVISOR' && userRole !== 'ADMIN') {
            throw new ForbiddenException('Forbidden');
        }

        const tasks = await this.prisma.task.findMany({
            where: { project_id: projectId },
            include: {
                Users: {
                    select: { users_id: true, firstname: true, lastname: true, profilePicture: true },
                },
                TaskAssignment: {
                    include: {
                        Users: {
                            select: { users_id: true, firstname: true, lastname: true, profilePicture: true },
                        },
                    },
                },
                _count: { select: { Comment: true } },
            },
            orderBy: [{ position: 'asc' }, { dueDate: 'asc' }],
        });

        // Normalize for frontend
        return tasks.map((task) => ({
            ...task,
            author: task.Users,
            assignees: task.TaskAssignment.map((ta) => ({
                user_id: ta.user_id,
                user: ta.Users,
            })),
        }));
    }

    // =====================================================
    // POST /tasks — สร้าง Task ใหม่
    // ย้ายจาก: tasks/route.ts → POST
    //
    // 📌 รองรับ assigneeIds ตอนสร้าง
    // 📌 กฎ: Student ห้าม assign ให้ Advisor
    // =====================================================
    async create(userId: string, userRole: string, dto: CreateTaskDto) {
        const project = await this.prisma.project.findUnique({
            where: { project_id: dto.project_id },
            include: { Team: { include: { Teammember: true } } },
        });
        if (!project) {
            throw new NotFoundException('Project not found');
        }

        const isMember = project.Team.Teammember.some(
            (m) => m.user_id === userId,
        );
        if (!isMember && userRole !== 'ADVISOR' && userRole !== 'ADMIN') {
            throw new ForbiddenException('คุณไม่ใช่สมาชิกของทีมนี้');
        }

        // ตรวจสอบ assignees
        let validAssigneeIds: string[] = [];
        if (dto.assigneeIds && dto.assigneeIds.length > 0) {
            const cleanIds = dto.assigneeIds.filter(
                (id): id is string => typeof id === 'string' && id.length > 0,
            );

            if (cleanIds.length > 0) {
                const assignees = await this.prisma.users.findMany({
                    where: { users_id: { in: cleanIds } },
                    select: { users_id: true, role: true },
                });

                // กฎ: Student ห้าม assign ให้ Advisor
                if (userRole === 'STUDENT') {
                    const hasAdvisor = assignees.some((a) => a.role === 'ADVISOR');
                    if (hasAdvisor) {
                        throw new ForbiddenException('นักศึกษาไม่สามารถมอบหมายงานให้อาจารย์ได้');
                    }
                }

                validAssigneeIds = assignees.map((a) => a.users_id);
            }
        }

        const task = await this.prisma.task.create({
            data: {
                title: dto.title,
                description: dto.description || null,
                status: dto.status || 'TODO',
                priority: dto.priority || 'MEDIUM',
                tags: dto.tags || null,
                startDate: dto.startDate ? new Date(dto.startDate) : null,
                dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
                project_id: dto.project_id,
                authorUserId: userId,
                TaskAssignment: {
                    create: validAssigneeIds.map((uid) => ({ user_id: uid })),
                },
            },
            include: {
                Users: {
                    select: { users_id: true, firstname: true, lastname: true },
                },
                TaskAssignment: {
                    include: {
                        Users: {
                            select: { users_id: true, firstname: true, lastname: true, profilePicture: true },
                        },
                    },
                },
            },
        });

        return { ...task, author: task.Users };
    }

    // =====================================================
    // GET /tasks/:id — ดึงรายละเอียด Task
    // ย้ายจาก: tasks/[id]/route.ts → GET
    // =====================================================
    async findOne(id: number, userId: string, userRole: string) {
        const task = await this.prisma.task.findUnique({
            where: { task_id: id },
            include: {
                Users: {
                    select: { users_id: true, firstname: true, lastname: true, email: true, profilePicture: true },
                },
                TaskAssignment: {
                    include: {
                        Users: {
                            select: { users_id: true, firstname: true, lastname: true, email: true, profilePicture: true },
                        },
                    },
                },
                Comment: {
                    include: {
                        Users: {
                            select: { users_id: true, firstname: true, lastname: true, profilePicture: true },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                },
                Project: { include: { Team: { include: { Teammember: true } } } },
            },
        });

        if (!task) {
            throw new NotFoundException('Task not found');
        }

        const isMember = task.Project.Team.Teammember.some(
            (m) => m.user_id === userId,
        );
        if (!isMember && userRole !== 'ADVISOR' && userRole !== 'ADMIN') {
            throw new ForbiddenException('Forbidden');
        }

        return {
            ...task,
            author: task.Users,
            assignees: task.TaskAssignment.map((ta) => ({
                user_id: ta.user_id,
                user: ta.Users,
            })),
            comments: task.Comment.map((c) => ({ ...c, user: c.Users })),
        };
    }

    // =====================================================
    // PUT /tasks/:id — อัพเดท Task (partial update สำหรับ drag & drop)
    // ย้ายจาก: tasks/[id]/route.ts → PUT
    // =====================================================
    async update(id: number, userId: string, userRole: string, dto: UpdateTaskDto) {
        await this.getTaskWithAuthCheck(id, userId, userRole);

        const data: Record<string, any> = {};
        if (dto.title) data.title = dto.title;
        if (dto.description !== undefined) data.description = dto.description;
        if (dto.status) data.status = dto.status;
        if (dto.priority) data.priority = dto.priority;
        if (dto.tags !== undefined) data.tags = dto.tags;
        if (dto.startDate !== undefined)
            data.startDate = dto.startDate ? new Date(dto.startDate) : null;
        if (dto.dueDate !== undefined)
            data.dueDate = dto.dueDate ? new Date(dto.dueDate) : null;
        if (dto.position !== undefined) data.position = dto.position;

        const updatedTask = await this.prisma.task.update({
            where: { task_id: id },
            data,
            include: {
                Users: {
                    select: { users_id: true, firstname: true, lastname: true },
                },
                TaskAssignment: {
                    include: {
                        Users: {
                            select: { users_id: true, firstname: true, lastname: true },
                        },
                    },
                },
            },
        });

        return {
            ...updatedTask,
            author: updatedTask.Users,
            assignees: updatedTask.TaskAssignment.map((ta) => ({
                user_id: ta.user_id,
                user: ta.Users,
            })),
        };
    }

    // =====================================================
    // DELETE /tasks/:id — ลบ Task (cascade)
    // ย้ายจาก: tasks/[id]/route.ts → DELETE
    //
    // ⚠️ โค้ดเดิมไม่ใช้ $transaction! → แก้แล้ว
    // =====================================================
    async remove(id: number, userId: string, userRole: string) {
        await this.getTaskWithAuthCheck(id, userId, userRole);

        // ✅ ครอบ $transaction เพราะลบหลาย table
        await this.prisma.$transaction(async (tx) => {
            await tx.taskAssignment.deleteMany({ where: { task_id: id } });
            await tx.comment.deleteMany({ where: { task_id: id } });
            await tx.attachment.deleteMany({ where: { task_id: id } });
            await tx.notification.deleteMany({ where: { task_id: id } });
            await tx.task.delete({ where: { task_id: id } });
        });

        return { message: 'Task deleted' };
    }

    // =====================================================
    // POST /tasks/:id/assign — Assign user ให้ task
    // ย้ายจาก: tasks/[id]/assign/route.ts → POST
    // =====================================================
    async assign(id: number, userId: string, userRole: string, dto: AssignTaskDto) {
        const task = await this.getTaskWithAuthCheck(id, userId, userRole);

        // เช็คว่า assignee เป็นสมาชิกทีม
        const isInTeam = task.Project.Team.Teammember.some(
            (m) => m.user_id === dto.user_id,
        );
        if (!isInTeam) {
            throw new BadRequestException('User ไม่ได้เป็นสมาชิกของทีม');
        }

        // เช็คว่า assign แล้วหรือยัง
        const exists = await this.prisma.taskAssignment.findFirst({
            where: { task_id: id, user_id: dto.user_id },
        });
        if (exists) {
            throw new BadRequestException('User ถูก assign แล้ว');
        }

        await this.prisma.taskAssignment.create({
            data: { task_id: id, user_id: dto.user_id },
        });

        return { message: 'Assigned successfully' };
    }

    // =====================================================
    // DELETE /tasks/:id/assign — Unassign user จาก task
    // ย้ายจาก: tasks/[id]/assign/route.ts → DELETE
    // =====================================================
    async unassign(id: number, userId: string, userRole: string, dto: AssignTaskDto) {
        await this.getTaskWithAuthCheck(id, userId, userRole);

        await this.prisma.taskAssignment.deleteMany({
            where: { task_id: id, user_id: dto.user_id },
        });

        return { message: 'Unassigned successfully' };
    }

    // =====================================================
    // GET /tasks/:id/comments — ดู comments
    // ย้ายจาก: tasks/[id]/comments/route.ts → GET
    // =====================================================
    async getComments(id: number, userId: string, userRole: string) {
        await this.getTaskWithAuthCheck(id, userId, userRole);

        const comments = await this.prisma.comment.findMany({
            where: { task_id: id },
            include: {
                Users: {
                    select: { users_id: true, firstname: true, lastname: true, profilePicture: true },
                },
            },
            orderBy: { createdAt: 'asc' },
        });

        return comments.map((c) => ({ ...c, user: c.Users }));
    }

    // =====================================================
    // POST /tasks/:id/comments — เพิ่ม comment
    // ย้ายจาก: tasks/[id]/comments/route.ts → POST
    // =====================================================
    async addComment(id: number, userId: string, userRole: string, dto: CreateCommentDto) {
        await this.getTaskWithAuthCheck(id, userId, userRole);

        const comment = await this.prisma.comment.create({
            data: {
                text: dto.text.trim(),
                task_id: id,
                user_id: userId,
            },
            include: {
                Users: {
                    select: { users_id: true, firstname: true, lastname: true, profilePicture: true },
                },
            },
        });

        return { ...comment, user: comment.Users };
    }
}
