import {
    Controller, Get, Post, Patch, Delete,
    Param, Body, Query, UseGuards, ParseIntPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import { GradesService } from './grades.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { BatchGradesDto, UpdateGradeDto } from './dto/grade.dto';

@Controller('grades')
@UseGuards(JwtAuthGuard)
export class GradesController {
    constructor(private readonly gradesService: GradesService) { }

    @Get()
    async findAll(
        @Query('section_id') sectionId: string,
        @Query('student_id') studentId: string,
        @CurrentUser() user: any,
    ) {
        return this.gradesService.findAll(
            sectionId ? parseInt(sectionId) : null,
            studentId || null,
            user.users_id,
            user.role,
        );
    }

    @UseGuards(RolesGuard)
    @Roles('ADMIN')
    @Post()
    @HttpCode(HttpStatus.OK)
    async batchSave(
        @CurrentUser('users_id') userId: string,
        @Body() dto: BatchGradesDto,
    ) {
        return this.gradesService.batchSave(userId, dto);
    }

    @UseGuards(RolesGuard)
    @Roles('ADMIN')
    @Patch(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser('users_id') userId: string,
        @Body() dto: UpdateGradeDto,
    ) {
        return this.gradesService.update(id, userId, dto);
    }

    @UseGuards(RolesGuard)
    @Roles('ADMIN')
    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number) {
        return this.gradesService.remove(id);
    }
}
