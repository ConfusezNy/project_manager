import {
    Injectable,
    NotFoundException,
    ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BatchGradesDto, UpdateGradeDto } from './dto/grade.dto';
import { GradeScore } from '@prisma/client';

@Injectable()
export class GradesService {
    constructor(private prisma: PrismaService) { }

    // GET /grades?section_id= or ?student_id=
    async findAll(
        sectionId: number | null,
        studentId: string | null,
        userId: string,
        userRole: string,
    ) {
        // By section (Admin only)
        if (sectionId) {
            if (userRole !== 'ADMIN') {
                throw new ForbiddenException('Forbidden');
            }

            const section = await this.prisma.section.findUnique({
                where: { section_id: sectionId },
            });
            if (!section) throw new NotFoundException('Section not found');

            const teams = await this.prisma.team.findMany({
                where: { section_id: sectionId },
                include: { Project: true },
            });

            const projectIds = teams
                .filter((t) => t.Project)
                .map((t) => t.Project!.project_id);

            return this.prisma.grade.findMany({
                where: { project_id: { in: projectIds }, term_id: section.term_id },
                include: {
                    Users_Grade_evaluator_idToUsers: {
                        select: { firstname: true, lastname: true },
                    },
                    Users_Grade_student_idToUsers: {
                        select: { users_id: true, firstname: true, lastname: true },
                    },
                    Project: { select: { project_id: true, projectname: true } },
                    Term: { select: { term_id: true, semester: true, academicYear: true } },
                },
            });
        }

        // By student
        if (studentId) {
            if (userRole === 'STUDENT' && userId !== studentId) {
                throw new ForbiddenException('Forbidden');
            }

            return this.prisma.grade.findMany({
                where: { student_id: studentId },
                include: {
                    Users_Grade_evaluator_idToUsers: {
                        select: { firstname: true, lastname: true, titles: true },
                    },
                    Project: { select: { project_id: true, projectname: true } },
                    Term: { select: { term_id: true, semester: true, academicYear: true } },
                },
            });
        }

        return [];
    }

    // POST /grades — Batch upsert (Admin)
    async batchSave(userId: string, dto: BatchGradesDto) {
        const section = await this.prisma.section.findUnique({
            where: { section_id: dto.section_id },
        });
        if (!section) throw new NotFoundException('Section not found');

        const termId = section.term_id;
        const results: { grade_id: number; score: GradeScore }[] = [];

        for (const grade of dto.grades) {
            const pid = typeof grade.project_id === 'number'
                ? grade.project_id
                : parseInt(String(grade.project_id));

            const existing = await this.prisma.grade.findFirst({
                where: { student_id: grade.student_id, project_id: pid, term_id: termId },
            });

            if (existing) {
                const updated = await this.prisma.grade.update({
                    where: { grade_id: existing.grade_id },
                    data: { score: grade.score as GradeScore, evaluator_id: userId },
                });
                results.push(updated);
            } else {
                const created = await this.prisma.grade.create({
                    data: {
                        student_id: grade.student_id,
                        project_id: pid,
                        term_id: termId,
                        evaluator_id: userId,
                        score: grade.score as GradeScore,
                    },
                });
                results.push(created);
            }
        }

        return {
            message: `บันทึกเกรดสำเร็จ ${results.length} รายการ`,
            count: results.length,
            grades: results,
        };
    }

    // PATCH /grades/:id (Admin)
    async update(id: number, userId: string, dto: UpdateGradeDto) {
        const grade = await this.prisma.grade.findUnique({
            where: { grade_id: id },
        });
        if (!grade) throw new NotFoundException('Grade not found');

        const updated = await this.prisma.grade.update({
            where: { grade_id: id },
            data: { score: dto.score as GradeScore, evaluator_id: userId },
        });

        return { message: 'อัปเดตเกรดสำเร็จ', grade: updated };
    }

    // DELETE /grades/:id (Admin)
    async remove(id: number) {
        const grade = await this.prisma.grade.findUnique({
            where: { grade_id: id },
        });
        if (!grade) throw new NotFoundException('Grade not found');

        await this.prisma.grade.delete({ where: { grade_id: id } });
        return { message: 'ลบเกรดสำเร็จ' };
    }
}
