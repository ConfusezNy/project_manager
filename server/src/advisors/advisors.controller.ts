import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdvisorsService } from './advisors.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('advisors')
@UseGuards(JwtAuthGuard)
export class AdvisorsController {
    constructor(private readonly advisorsService: AdvisorsService) { }

    @Get('available')
    async getAvailable() {
        return this.advisorsService.getAvailable();
    }

    @UseGuards(RolesGuard)
    @Roles('ADVISOR')
    @Get('my-projects')
    async getMyProjects(@CurrentUser('users_id') userId: string) {
        return this.advisorsService.getMyProjects(userId);
    }
}
