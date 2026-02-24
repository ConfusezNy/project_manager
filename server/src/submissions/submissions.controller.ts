import {
    Controller,
    Get,
    Patch,
    Param,
    Body,
    Query,
    UseGuards,
    ParseIntPipe,
} from '@nestjs/common';
import { SubmissionsService } from './submissions.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { SubmitDto, FeedbackDto, RejectDto } from './dto/submission.dto';

/**
 * Submissions Controller
 * ย้ายมาจาก: 4 route files ใน client/src/app/api/submissions/
 */
@Controller('submissions')
@UseGuards(JwtAuthGuard)
export class SubmissionsController {
    constructor(private readonly submissionsService: SubmissionsService) { }

    // GET /submissions?event_id=&team_id= — ดึง submissions
    @Get()
    async findAll(
        @Query('event_id') eventId: string,
        @Query('team_id') teamId: string,
        @CurrentUser() user: any,
    ) {
        return this.submissionsService.findAll(
            eventId ? parseInt(eventId) : null,
            teamId ? parseInt(teamId) : null,
            user.users_id,
            user.role,
        );
    }

    // PATCH /submissions/:id/submit — ส่งงาน
    @Patch(':id/submit')
    async submit(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser() user: any,
        @Body() dto: SubmitDto,
    ) {
        return this.submissionsService.submit(id, user.users_id, user.role, dto);
    }

    // PATCH /submissions/:id/approve — อนุมัติ (Advisor/Admin)
    @UseGuards(RolesGuard)
    @Roles('ADVISOR', 'ADMIN')
    @Patch(':id/approve')
    async approve(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser('users_id') userId: string,
        @Body() dto: FeedbackDto,
    ) {
        return this.submissionsService.approve(id, userId, dto);
    }

    // PATCH /submissions/:id/reject — ปฏิเสธ (Advisor/Admin)
    @UseGuards(RolesGuard)
    @Roles('ADVISOR', 'ADMIN')
    @Patch(':id/reject')
    async reject(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: RejectDto,
    ) {
        return this.submissionsService.reject(id, dto);
    }
}
