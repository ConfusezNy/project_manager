import {
    Injectable,
    UnauthorizedException,
    ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) { }

    /**
     * สมัครสมาชิก
     * ย้ายมาจาก: client/src/app/api/auth/signup/route.ts
     *
     * Flow:
     * 1. สร้าง users_id จาก email (เอาส่วนก่อน @)
     * 2. เช็ค duplicate email/users_id
     * 3. Hash password ด้วย bcrypt (10 rounds)
     * 4. สร้าง user ใน DB (default role = STUDENT)
     * 5. Generate JWT → return token + user info
     */
    async signup(dto: SignupDto) {
        // 1. สร้าง users_id จากอีเมล (เอาส่วนก่อน @)
        const users_id = dto.email.split('@')[0].trim();

        // 2. เช็ค duplicate
        const existingUser = await this.prisma.users.findFirst({
            where: {
                OR: [{ email: dto.email }, { users_id }],
            },
        });

        if (existingUser) {
            throw new ConflictException('อีเมลหรือรหัสผู้ใช้นี้มีอยู่ในระบบแล้ว');
        }

        // 3. Hash password
        const hashedPassword = bcrypt.hashSync(dto.password, 10);

        // 4. สร้าง user ใน DB
        const newUser = await this.prisma.users.create({
            data: {
                users_id,
                titles: dto.titles,
                firstname: dto.firstname,
                lastname: dto.lastname,
                tel_number: dto.tel_number,
                email: dto.email,
                passwordHash: hashedPassword,
                role: 'STUDENT', // default role
            },
        });

        // 5. Generate JWT
        const access_token = this.generateToken({
            users_id: newUser.users_id,
            email: newUser.email ?? '',
            role: newUser.role,
            firstname: newUser.firstname ?? '',
            lastname: newUser.lastname ?? '',
        });

        return {
            message: 'สมัครสมาชิกสำเร็จ',
            access_token,
            user: {
                users_id: newUser.users_id,
                email: newUser.email,
                firstname: newUser.firstname,
                lastname: newUser.lastname,
                role: newUser.role,
            },
        };
    }

    /**
     * เข้าสู่ระบบ
     * ย้ายมาจาก: client/src/lib/auth.ts → CredentialsProvider.authorize()
     *
     * Flow:
     * 1. หา user by email
     * 2. เทียบ password ด้วย bcrypt.compare()
     * 3. ถ้าตรง → Generate JWT
     * 4. Return { access_token, user }
     */
    async login(dto: LoginDto) {
        // 1. หา user by email
        const user = await this.prisma.users.findUnique({
            where: { email: dto.email },
        });

        // 2. เทียบ password
        if (
            !user ||
            !user.passwordHash ||
            !(await bcrypt.compare(dto.password, user.passwordHash))
        ) {
            throw new UnauthorizedException('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
        }

        // 3. Generate JWT
        const access_token = this.generateToken({
            users_id: user.users_id,
            email: user.email ?? '',
            role: user.role,
            firstname: user.firstname ?? '',
            lastname: user.lastname ?? '',
        });

        // 4. Return token + user info
        return {
            access_token,
            user: {
                users_id: user.users_id,
                email: user.email,
                firstname: user.firstname,
                lastname: user.lastname,
                role: user.role,
            },
        };
    }

    /**
     * สร้าง JWT token
     * Payload ตรงกับ jwt.strategy.ts → validate()
     */
    private generateToken(user: {
        users_id: string;
        email: string;
        role: string;
        firstname: string;
        lastname: string;
    }) {
        const payload = {
            sub: user.users_id,
            email: user.email,
            role: user.role,
            firstname: user.firstname,
            lastname: user.lastname,
        };
        return this.jwtService.sign(payload);
    }
}
