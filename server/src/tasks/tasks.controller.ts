import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Param,
    Body,
    Query,
    UseGuards,
    ParseIntPipe,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateTaskDto, UpdateTaskDto, AssignTaskDto, CreateCommentDto } from './dto/task.dto';

/**
 * Tasks Controller
 * ย้ายมาจาก: 4 route files ใน client/src/app/api/tasks/
 */
@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
    constructor(private readonly tasksService: TasksService) { }

    // GET /tasks?project_id= — Tasks ของ project
    @Get()
    async findByProject(
        @Query('project_id', ParseIntPipe) projectId: number,
        @CurrentUser() user: any,
    ) {
        return this.tasksService.findByProject(projectId, user.users_id, user.role);
    }

    // POST /tasks — สร้าง Task
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(
        @CurrentUser() user: any,
        @Body() dto: CreateTaskDto,
    ) {
        return this.tasksService.create(user.users_id, user.role, dto);
    }

    // GET /tasks/:id — รายละเอียด Task
    @Get(':id')
    async findOne(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser() user: any,
    ) {
        return this.tasksService.findOne(id, user.users_id, user.role);
    }

    // PUT /tasks/:id — อัพเดท Task
    @Put(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser() user: any,
        @Body() dto: UpdateTaskDto,
    ) {
        return this.tasksService.update(id, user.users_id, user.role, dto);
    }

    // DELETE /tasks/:id — ลบ Task (cascade)
    @Delete(':id')
    async remove(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser() user: any,
    ) {
        return this.tasksService.remove(id, user.users_id, user.role);
    }

    // POST /tasks/:id/assign — มอบหมายงาน
    @Post(':id/assign')
    async assign(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser() user: any,
        @Body() dto: AssignTaskDto,
    ) {
        return this.tasksService.assign(id, user.users_id, user.role, dto);
    }

    // DELETE /tasks/:id/assign — ยกเลิกมอบหมาย
    @Delete(':id/assign')
    async unassign(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser() user: any,
        @Body() dto: AssignTaskDto,
    ) {
        return this.tasksService.unassign(id, user.users_id, user.role, dto);
    }

    // GET /tasks/:id/comments — ดู comments
    @Get(':id/comments')
    async getComments(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser() user: any,
    ) {
        return this.tasksService.getComments(id, user.users_id, user.role);
    }

    // POST /tasks/:id/comments — เพิ่ม comment
    @Post(':id/comments')
    @HttpCode(HttpStatus.CREATED)
    async addComment(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser() user: any,
        @Body() dto: CreateCommentDto,
    ) {
        return this.tasksService.addComment(id, user.users_id, user.role, dto);
    }
}
