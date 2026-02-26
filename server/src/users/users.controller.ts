import {
    Controller, Get, Patch, Delete,
    Param, Body, Query, UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get('search')
    async search(@Query('id') id: string) {
        return this.usersService.search(id);
    }

    @Get()
    async findAll(
        @CurrentUser() user: JwtPayload,
        @Query('role') roleFilter: string,
    ) {
        return this.usersService.findAll(user.users_id, user.role, roleFilter);
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.usersService.findOne(id);
    }

    @UseGuards(RolesGuard)
    @Roles('ADMIN')
    @Patch(':id')
    async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
        return this.usersService.update(id, dto);
    }

    @UseGuards(RolesGuard)
    @Roles('ADMIN')
    @Delete(':id')
    async remove(
        @Param('id') id: string,
        @CurrentUser('users_id') currentUserId: string,
    ) {
        return this.usersService.remove(id, currentUserId);
    }
}
