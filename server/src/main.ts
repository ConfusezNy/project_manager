import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // CORS — ให้ Next.js frontend เรียกได้
    app.enableCors({
        origin: process.env.CLIENT_URL || 'http://localhost:3000',
        credentials: true,
    });

    // Global validation pipe — ใช้ class-validator อัตโนมัติทุก endpoint
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,        // ตัด field ที่ไม่ได้ประกาศใน DTO ออก
            forbidNonWhitelisted: true, // error ถ้าส่ง field แปลกมา
            transform: true,        // แปลง string → number อัตโนมัติ
        }),
    );

    const port = process.env.PORT || 4000;
    await app.listen(port);
    console.log(`🚀 NestJS server running on http://localhost:${port}`);
}
bootstrap();
