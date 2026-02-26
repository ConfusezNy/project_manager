import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';

/** Raw JWT token payload (from jsonwebtoken) */
interface JwtTokenPayload {
    sub: string;
    email: string;
    role: 'ADMIN' | 'ADVISOR' | 'STUDENT';
    firstname: string;
    lastname: string;
    iat: number;
    exp: number;
}

/**
 * JWT Strategy — Passport ใช้ตรวจสอบ token
 *
 * Flow:
 * 1. Client ส่ง header: Authorization: Bearer <token>
 * 2. ExtractJwt ดึง token จาก header
 * 3. Passport verify ด้วย JWT_SECRET
 * 4. validate() ถูกเรียก → return payload (ใส่ใน request.user)
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(config: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: config.get<string>('JWT_SECRET')!,
        });
    }

    /**
     * หลัง verify token สำเร็จ → return ค่านี้จะอยู่ใน request.user
     * ดึงได้ด้วย @CurrentUser() decorator
     */
    async validate(payload: JwtTokenPayload): Promise<JwtPayload> {
        return {
            users_id: payload.sub,
            email: payload.email,
            role: payload.role,
            firstname: payload.firstname,
            lastname: payload.lastname,
        };
    }
}
