import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { RequestOtpDto, VerifyOtpDto } from './dto/otp.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    // =====================================================
    // POST /auth/signup — สมัครสมาชิก (หลังผ่าน OTP แล้ว)
    // =====================================================
    @Post('signup')
    async signup(@Body() dto: SignupDto) {
        return this.authService.signup(dto);
    }

    // =====================================================
    // POST /auth/login — เข้าสู่ระบบด้วยรหัสผ่าน
    // =====================================================
    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }

    // =====================================================
    // POST /auth/request-otp — ขอรหัส OTP ทางอีเมล
    // =====================================================
    @Post('request-otp')
    @HttpCode(HttpStatus.OK)
    async requestOtp(@Body() dto: RequestOtpDto) {
        return this.authService.requestOtp(dto.email);
    }

    // =====================================================
    // POST /auth/verify-otp — ยืนยัน OTP + รับ role
    // =====================================================
    @Post('verify-otp')
    @HttpCode(HttpStatus.OK)
    async verifyOtp(@Body() dto: VerifyOtpDto) {
        return this.authService.verifyOtp(dto.email, dto.otp);
    }
}
