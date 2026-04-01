import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ForbiddenException,
    ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    // POST /users (Admin) — สร้าง user ใหม่
    async create(dto: CreateUserDto) {
        // 1. สร้าง users_id จาก email (เอาส่วนก่อน @)
        const users_id = dto.email.split('@')[0].trim();

        // 2. เช็ค duplicate
        const existing = await this.prisma.users.findFirst({
            where: {
                OR: [{ email: dto.email }, { users_id }],
            },
        });
        if (existing) {
            throw new ConflictException('อีเมลหรือรหัสผู้ใช้นี้มีอยู่ในระบบแล้ว');
        }

        // 3. Hash password
        const hashedPassword = bcrypt.hashSync(dto.password, 10);

        // 4. สร้าง user ใน DB
        const newUser = await this.prisma.users.create({
            data: {
                users_id,
                titles: dto.titles,
                firstname: dto.firstname,
                lastname: dto.lastname,
                tel_number: dto.tel_number,
                email: dto.email,
                passwordHash: hashedPassword,
                role: dto.role,
                profilePicture: dto.profilePicture,
                expertiseAreas: dto.expertiseAreas,
            },
        });

        return {
            message: 'สร้างผู้ใช้งานสำเร็จ',
            user: {
                users_id: newUser.users_id,
                firstname: newUser.firstname,
                lastname: newUser.lastname,
                email: newUser.email,
                role: newUser.role,
            },
        };
    }

    // GET /users?role= — ดึง users ตาม role-scoped visibility
    async findAll(userId: string, userRole: string, roleFilter?: string) {
        if (userRole === 'ADMIN' || userRole === 'ADVISOR') {
            const where: Prisma.UsersWhereInput = {};
            if (roleFilter && roleFilter !== 'All') where.role = roleFilter as Prisma.EnumRoleFilter;

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
                            Team: {
                                include: {
                                    Project: { select: { projectname: true } }
                                }
                            },
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
                            Team: {
                                include: {
                                    Project: { select: { projectname: true } }
                                }
                            },
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
                        Team: { select: { team_id: true, groupNumber: true } },
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
                role: true,
            },
        });

        if (!user || user.role !== 'STUDENT') return null;
        return user;
    }

    // PATCH /users/:id (Admin) — update user
    async update(id: string, data: UpdateUserDto) {
        const user = await this.prisma.users.findUnique({ where: { users_id: id } });
        if (!user) throw new NotFoundException('User not found');

        const validRoles = ['ADMIN', 'ADVISOR', 'STUDENT'];
        if (data.role && !validRoles.includes(data.role)) {
            throw new BadRequestException('Invalid role');
        }

        const updateData: Prisma.UsersUpdateInput = {};
        if (data.role !== undefined) updateData.role = data.role;
        if (data.firstname !== undefined) updateData.firstname = data.firstname;
        if (data.lastname !== undefined) updateData.lastname = data.lastname;
        if (data.email !== undefined) updateData.email = data.email;
        if (data.tel_number !== undefined) updateData.tel_number = data.tel_number;
        if (data.titles !== undefined) updateData.titles = data.titles;
        if (data.profilePicture !== undefined) updateData.profilePicture = data.profilePicture;
        if (data.expertiseAreas !== undefined) updateData.expertiseAreas = data.expertiseAreas;

        // Handle password change
        if (data.newPassword) {
            updateData.passwordHash = bcrypt.hashSync(data.newPassword, 10);
        }

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

    private formatUser(u: Record<string, unknown>) {
        return {
            users_id: u.users_id,
            titles: u.titles,
            firstname: u.firstname,
            lastname: u.lastname,
            email: u.email,
            tel_number: u.tel_number,
            role: u.role,
            profilePicture: u.profilePicture,
            expertiseAreas: u.expertiseAreas,
            sections: (u.Section_Enrollment as Array<Record<string, unknown>>)?.map((e) => ({
                section_id: (e.Section as Record<string, unknown>).section_id,
                section_code: (e.Section as Record<string, unknown>).section_code,
                course_type: (e.Section as Record<string, unknown>).course_type,
            })) || [],
            teams: (u.Teammember as Array<Record<string, unknown>>)?.map((t) => {
                const team = t.Team as Record<string, any>;
                return {
                    team_id: team.team_id,
                    groupNumber: team.groupNumber,
                    name: team.Project?.projectname || "",
                    project: team.Project ? { projectname: team.Project.projectname } : null
                };
            }) || [],
        };
    }
}
