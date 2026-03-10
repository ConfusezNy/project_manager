import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { join } from 'path';
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
import { NotificationsModule } from './notifications/notifications.module';
import { UploadsModule } from './uploads/uploads.module';

@Module({
    imports: [
        // .env file loading
        ConfigModule.forRoot({ isGlobal: true }),

        // Rate limiting — global default: 10 req/sec, 100 req/min per IP
        ThrottlerModule.forRoot([
            { name: 'short', ttl: 1000, limit: 10 },
            { name: 'medium', ttl: 60000, limit: 100 },
        ]),

        // Serve uploaded files statically
        ServeStaticModule.forRoot({
            rootPath: join(process.cwd(), 'uploads'),
            serveRoot: '/uploads',
        }),

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
        NotificationsModule,
        UploadsModule,
    ],
    providers: [
        // Apply ThrottlerGuard globally to all routes
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
    ],
})
export class AppModule { }
