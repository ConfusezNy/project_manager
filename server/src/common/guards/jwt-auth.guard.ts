import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * JWT Authentication Guard
 * ใส่ @UseGuards(JwtAuthGuard) ที่ controller → บังคับให้ส่ง JWT token
 *
 * Flow:
 * 1. Client ส่ง Authorization: Bearer <token>
 * 2. Guard ส่งไปให้ JwtStrategy ตรวจสอบ
 * 3. ถ้า OK → request.user = JWT payload
 * 4. ถ้า NG → return 401 Unauthorized
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') { }
