import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    // GET /users?role= — ดึง users ตาม role-scoped visibility
    async findAll(userId: string, userRole: string, roleFilter?: string) {
        if (userRole === 'ADMIN' || userRole === 'ADVISOR') {
            const where: any = {};
            if (roleFilter && roleFilter !== 'All') where.role = roleFilter;

            const users = await this.prisma.users.findMany({
                where,
                include: {
                    Section_Enrollment: {
                        include: {
                            Section: { select: { section_id: true, section_code: true, course_type: true } },
                        },
                    },
                    Teammember: {
                        include: {
                            Team: { select: { team_id: true, name: true, groupNumber: true } },
                        },
                    },
                },
                orderBy: [{ role: 'asc' }, { users_id: 'asc' }],
            });

            return users.map((u) => this.formatUser(u));
        } else {
            // Student: เฉพาะคนใน Section เดียวกัน
            const enrollments = await this.prisma.section_Enrollment.findMany({
                where: { users_id: userId },
                select: { section_id: true },
            });

            const sectionIds = enrollments.map((e) => e.section_id);
            if (sectionIds.length === 0) return [];

            const users = await this.prisma.users.findMany({
                where: {
                    Section_Enrollment: { some: { section_id: { in: sectionIds } } },
                },
                include: {
                    Section_Enrollment: {
                        include: {
                            Section: { select: { section_id: true, section_code: true, course_type: true } },
                        },
                    },
                    Teammember: {
                        include: {
                            Team: { select: { team_id: true, name: true, groupNumber: true } },
                        },
                    },
                },
                orderBy: [{ users_id: 'asc' }],
            });

            return users.map((u) => this.formatUser(u));
        }
    }

    // GET /users/:id
    async findOne(id: string) {
        const user = await this.prisma.users.findUnique({
            where: { users_id: id },
            include: {
                Section_Enrollment: {
                    include: {
                        Section: { select: { section_id: true, section_code: true, course_type: true } },
                    },
                },
                Teammember: {
                    include: {
                        Team: { select: { team_id: true, name: true, groupNumber: true } },
                    },
                },
            },
        });

        if (!user) throw new NotFoundException('User not found');
        return this.formatUser(user);
    }

    // GET /users/search?id= — ค้นหา Student
    async search(usersId: string) {
        const user = await this.prisma.users.findUnique({
            where: { users_id: usersId },
            select: {
                users_id: true,
                firstname: true,
                lastname: true,
                teamId: true,
                role: true,
            },
        });

        if (!user || user.role !== 'STUDENT') return null;
        return user;
    }

    // PATCH /users/:id (Admin) — update user
    async update(id: string, data: any) {
        const user = await this.prisma.users.findUnique({ where: { users_id: id } });
        if (!user) throw new NotFoundException('User not found');

        const validRoles = ['ADMIN', 'ADVISOR', 'STUDENT'];
        if (data.role && !validRoles.includes(data.role)) {
            throw new BadRequestException('Invalid role');
        }

        const updateData: any = {};
        if (data.role !== undefined) updateData.role = data.role;
        if (data.firstname !== undefined) updateData.firstname = data.firstname;
        if (data.lastname !== undefined) updateData.lastname = data.lastname;
        if (data.email !== undefined) updateData.email = data.email;
        if (data.tel_number !== undefined) updateData.tel_number = data.tel_number;
        if (data.titles !== undefined) updateData.titles = data.titles;

        const updated = await this.prisma.users.update({
            where: { users_id: id },
            data: updateData,
        });

        return {
            message: 'อัปเดตข้อมูลผู้ใช้เรียบร้อย',
            user: {
                users_id: updated.users_id,
                firstname: updated.firstname,
                lastname: updated.lastname,
                email: updated.email,
                role: updated.role,
            },
        };
    }

    // DELETE /users/:id (Admin) — cascade delete
    async remove(id: string, currentUserId: string) {
        const user = await this.prisma.users.findUnique({ where: { users_id: id } });
        if (!user) throw new NotFoundException('User not found');

        if (id === currentUserId) {
            throw new BadRequestException('ไม่สามารถลบบัญชีของตัวเองได้');
        }

        await this.prisma.$transaction(async (tx) => {
            await tx.section_Enrollment.deleteMany({ where: { users_id: id } });
            await tx.teammember.deleteMany({ where: { user_id: id } });
            await tx.users.delete({ where: { users_id: id } });
        });

        return { message: 'ลบผู้ใช้เรียบร้อย', deleted_user_id: id };
    }

    private formatUser(u: any) {
        return {
            users_id: u.users_id,
            titles: u.titles,
            firstname: u.firstname,
            lastname: u.lastname,
            email: u.email,
            tel_number: u.tel_number,
            role: u.role,
            profilePicture: u.profilePicture,
            sections: u.Section_Enrollment?.map((e: any) => ({
                section_id: e.Section.section_id,
                section_code: e.Section.section_code,
                course_type: e.Section.course_type,
            })) || [],
            teams: u.Teammember?.map((t: any) => ({
                team_id: t.Team.team_id,
                name: t.Team.name,
                groupNumber: t.Team.groupNumber,
            })) || [],
        };
    }
}
