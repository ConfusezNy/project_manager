import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminTeamsController } from './admin-teams.controller';
import { AdminTeamsService } from './admin-teams.service';

@Module({
    controllers: [AdminController, AdminTeamsController],
    providers: [AdminService, AdminTeamsService],
})
export class AdminModule { }
