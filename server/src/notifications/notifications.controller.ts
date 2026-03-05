import {
    Controller,
    Get,
    Patch,
    Param,
    ParseIntPipe,
    UseGuards,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

/**
 * Notifications Controller
 *
 * 📌 3 endpoints:
 * - GET    /notifications           → ดึง notifications ของ user
 * - PATCH  /notifications/:id/read  → mark เป็นอ่านแล้ว
 * - PATCH  /notifications/read-all  → mark ทั้งหมด
 */
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    // GET /notifications — ดึง notifications ตาม JWT user
    @Get()
    async findAll(@CurrentUser('users_id') userId: string) {
        return this.notificationsService.findAll(userId);
    }

    // PATCH /notifications/read-all — mark ทั้งหมดเป็นอ่านแล้ว
    // ⚠️ ต้องประกาศก่อน :id/read เพื่อไม่ให้ NestJS match "read-all" เป็น :id
    @Patch('read-all')
    @HttpCode(HttpStatus.OK)
    async markAllAsRead(@CurrentUser('users_id') userId: string) {
        await this.notificationsService.markAllAsRead(userId);
        return { message: 'ทำเครื่องหมายอ่านแล้วทั้งหมด' };
    }

    // PATCH /notifications/:id/read — mark เป็นอ่านแล้ว
    @Patch(':id/read')
    @HttpCode(HttpStatus.OK)
    async markAsRead(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser('users_id') userId: string,
    ) {
        await this.notificationsService.markAsRead(id, userId);
        return { message: 'อ่านแล้ว' };
    }
}
