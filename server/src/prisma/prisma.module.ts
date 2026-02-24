import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // ← ทำให้ทุก module ใช้ PrismaService ได้โดยไม่ต้อง import
@Module({
    providers: [PrismaService],
    exports: [PrismaService],
})
export class PrismaModule { }
