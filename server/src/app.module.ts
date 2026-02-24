import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { SectionsModule } from './sections/sections.module';
import { TeamsModule } from './teams/teams.module';
import { ProjectsModule } from './projects/projects.module';
import { TasksModule } from './tasks/tasks.module';
import { EventsModule } from './events/events.module';
import { SubmissionsModule } from './submissions/submissions.module';
import { GradesModule } from './grades/grades.module';
import { UsersModule } from './users/users.module';
import { AdvisorsModule } from './advisors/advisors.module';
import { AdminModule } from './admin/admin.module';
import { TermsModule } from './terms/terms.module';
import { ProfileModule } from './profile/profile.module';

@Module({
    imports: [
        // .env file loading
        ConfigModule.forRoot({ isGlobal: true }),

        // Database (ใช้ทุก module)
        PrismaModule,

        // Auth (JWT + Passport)
        AuthModule,

        // Feature Modules (13 modules)
        SectionsModule,
        TeamsModule,
        ProjectsModule,
        TasksModule,
        EventsModule,
        SubmissionsModule,
        GradesModule,
        UsersModule,
        AdvisorsModule,
        AdminModule,
        TermsModule,
        ProfileModule,
    ],
})
export class AppModule { }
