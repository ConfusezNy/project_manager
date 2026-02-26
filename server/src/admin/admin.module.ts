import { Module } from '@nestjs/common';
import { AdminTeamsController } from './admin-teams.controller';
import { AdminTeamsService } from './admin-teams.service';
import { AdminProjectsController } from './admin-projects.controller';
import { ProjectsModule } from '../projects/projects.module';

@Module({
    imports: [ProjectsModule],
    controllers: [AdminTeamsController, AdminProjectsController],
    providers: [AdminTeamsService],
})
export class AdminModule { }
