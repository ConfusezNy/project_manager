import { Module } from '@nestjs/common';
import { SectionsController } from './sections.controller';
import { SectionsService } from './sections.service';
import { EventsModule } from '../events/events.module';

@Module({
    imports: [EventsModule],
    controllers: [SectionsController],
    providers: [SectionsService],
})
export class SectionsModule { }
