import {
    Controller,
    Get,
    Post,
    Put,
    Patch,
    Delete,
    Param,
    Body,
    Query,
    UseGuards,
    ParseIntPipe,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CreateEventDto, UpdateEventDto } from './dto/event.dto';

/**
 * Events Controller
 * ย้ายมาจาก: 2 route files ใน client/src/app/api/events/
 */
@Controller('events')
@UseGuards(JwtAuthGuard)
export class EventsController {
    constructor(private readonly eventsService: EventsService) { }

    // GET /events?section_id= — Events ของ Section
    @Get()
    async findBySection(@Query('section_id', ParseIntPipe) sectionId: number) {
        return this.eventsService.findBySection(sectionId);
    }

    // POST /events — สร้าง Event (Admin)
    @UseGuards(RolesGuard)
    @Roles('ADMIN')
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() dto: CreateEventDto) {
        return this.eventsService.create(dto);
    }

    // GET /events/:id — Event เดียว
    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.eventsService.findOne(id);
    }

    // PUT /events/:id — แก้ไข Event (Admin)
    @UseGuards(RolesGuard)
    @Roles('ADMIN')
    @Put(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateEventDto,
    ) {
        return this.eventsService.update(id, dto);
    }

    // PATCH /events/:id — Partial update (Admin)
    @UseGuards(RolesGuard)
    @Roles('ADMIN')
    @Patch(':id')
    async partialUpdate(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateEventDto,
    ) {
        return this.eventsService.partialUpdate(id, dto);
    }

    // DELETE /events/:id — ลบ Event (Admin, cascade)
    @UseGuards(RolesGuard)
    @Roles('ADMIN')
    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number) {
        return this.eventsService.remove(id);
    }
}
