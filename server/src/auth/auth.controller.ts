import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { RequestOtpDto, VerifyOtpDto } from './dto/otp.dto';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/forgot-password.dto';

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
    @Throttle({ short: { ttl: 60000, limit: 5 } }) // max 5 ครั้ง/นาที per IP
    async login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }

    // =====================================================
    // POST /auth/request-otp — ขอรหัส OTP ทางอีเมล
    // =====================================================
    @Post('request-otp')
    @HttpCode(HttpStatus.OK)
    @Throttle({ short: { ttl: 60000, limit: 3 } }) // max 3 ครั้ง/นาที per IP
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

    // =====================================================
    // POST /auth/forgot-password — ขอ OTP สำหรับรีเซ็ตรหัสผ่าน
    // =====================================================
    @Post('forgot-password')
    @HttpCode(HttpStatus.OK)
    @Throttle({ short: { ttl: 60000, limit: 3 } }) // max 3 ครั้ง/นาที per IP
    async forgotPassword(@Body() dto: ForgotPasswordDto) {
        return this.authService.requestPasswordResetOtp(dto.email);
    }

    // =====================================================
    // POST /auth/reset-password — ยืนยัน OTP + เปลี่ยนรหัสผ่าน
    // =====================================================
    @Post('reset-password')
    @HttpCode(HttpStatus.OK)
    async resetPassword(@Body() dto: ResetPasswordDto) {
        return this.authService.resetPassword(dto.email, dto.otp, dto.newPassword);
    }
}
