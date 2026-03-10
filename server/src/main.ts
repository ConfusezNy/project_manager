import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import helmet from 'helmet';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Security headers (XSS, Clickjacking, Content-type sniffing, etc.)
    // Allow images from the API server (cross-origin file uploads)
    app.use(
        helmet({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
                    styleSrc: ["'self'", "'unsafe-inline'"],
                    imgSrc: [
                        "'self'",
                        'data:',
                        'blob:',
                        'https://api.cpeproject.app',
                        'http://localhost:4000',
                    ],
                    connectSrc: ["'self'", 'https://api.cpeproject.app', 'http://localhost:4000'],
                    fontSrc: ["'self'", 'data:'],
                },
            },
            crossOriginResourcePolicy: { policy: 'cross-origin' },
        }),
    );

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
