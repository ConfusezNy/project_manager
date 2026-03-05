import { IsOptional, IsString } from 'class-validator';

export class CreateNotificationDto {
    @IsString()
    userId: string;

    @IsString()
    actorUserId: string;

    @IsString()
    eventType: string;

    @IsString()
    title: string;

    @IsString()
    message: string;

    @IsOptional()
    @IsString()
    link?: string;

    @IsOptional()
    teamId?: number;

    @IsOptional()
    taskId?: number;

    @IsOptional()
    projectId?: number;
}
