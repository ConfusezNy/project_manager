import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { Resend } from 'resend';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly resend: Resend;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    // -------------------------
    // เริ่มต้น Resend client
    // -------------------------
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    this.resend = new Resend(apiKey);
  }

  // =====================================================
  // requestOtp — POST /auth/request-otp
  // ยืนยันตัวตนด้วยอีเมลมหาลัย + ส่ง OTP ผ่าน Resend
  // =====================================================
  async requestOtp(email: string) {
    // 1. ตรวจ domain — DEV: รับ @gmail.com ด้วย (TODO: ลบก่อน production)
    const allowed =
      email.endsWith('@mail.rmutt.ac.th') ||
      email.endsWith('@en.rmutt.ac.th') ||
      email.endsWith('@gmail.com'); // DEV only
    if (!allowed) {
      throw new BadRequestException(
        'อีเมลต้องเป็น @mail.rmutt.ac.th (นักศึกษา) หรือ @en.rmutt.ac.th (อาจารย์) เท่านั้น',
      );
    }


    // 2. ตรวจว่าขอ OTP บ่อยเกินไป (rate limit: max 5 requests / 5 min)
    const recentCount = await this.prisma.otpCode.count({
      where: {
        email,
        createdAt: { gte: new Date(Date.now() - 5 * 60 * 1000) },
      },
    });
    if (recentCount >= 5) {
      throw new BadRequestException('ขอ OTP บ่อยเกินไป กรุณารอ 5 นาทีแล้วลองใหม่');
    }

    // 3. ลบ OTP เก่าของ email นี้ที่ยังไม่ได้ใช้
    await this.prisma.otpCode.deleteMany({
      where: { email, isUsed: false },
    });

    // 3. สร้าง OTP 6 หลัก
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 4. บันทึก OTP ลง DB (หมดอายุใน 5 นาที)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await this.prisma.otpCode.create({
      data: { email, otp, expiresAt },
    });

    this.logger.log(`OTP สร้างสำเร็จสำหรับ ${email}`);

    // 5. ส่งอีเมลผ่าน Resend
    const fromEmail = this.configService.get<string>('RESEND_FROM');
    const { error } = await this.resend.emails.send({
      from: `ระบบปริญญานิพนธ์ CPE RMUTT <${fromEmail ?? 'onboarding@resend.dev'}>`,
      to: [email],
      subject: `[CPE RMUTT] รหัส OTP ของคุณคือ ${otp} — ใช้ได้ภายใน 5 นาที`,
      html: `<!DOCTYPE html>
<html lang="th">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 16px;">
  <tr><td align="center">
    <table width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;background:#ffffff;border-radius:8px;border:1px solid #e5e5e5;">

      <!-- Header -->
      <tr><td style="padding:32px 40px 24px;border-bottom:1px solid #f0f0f0;">
        <p style="margin:0;font-size:13px;font-weight:600;color:#111111;letter-spacing:0.3px;">🎓 ระบบบริหารจัดการปริญญานิพนธ์</p>
        <p style="margin:4px 0 0;font-size:12px;color:#888888;">ภาควิชาวิศวกรรมคอมพิวเตอร์ · RMUTT</p>
      </td></tr>

      <!-- Body -->
      <tr><td style="padding:32px 40px;">
        <p style="margin:0 0 6px;font-size:15px;font-weight:600;color:#111111;">รหัส OTP ของคุณ</p>
        <p style="margin:0 0 28px;font-size:13px;color:#666666;line-height:1.6;">
          คำขอสมัครสมาชิกสำหรับบัญชี <strong style="color:#111111;">${email}</strong>
        </p>

        <!-- OTP -->
        <div style="background:#f9f9f9;border:1px solid #e5e5e5;border-radius:6px;padding:28px;text-align:center;margin:0 0 24px;">
          <p style="margin:0 0 10px;font-size:11px;color:#888888;letter-spacing:2px;text-transform:uppercase;">รหัสยืนยัน</p>
          <div style="font-size:42px;font-weight:700;letter-spacing:14px;color:#111111;font-family:'Courier New',monospace;padding-left:14px;">${otp}</div>
          <p style="margin:12px 0 0;font-size:12px;color:#888888;">ใช้ได้ภายใน <strong style="color:#111111;">5 นาที</strong></p>
        </div>

        <p style="margin:0;font-size:12px;color:#999999;line-height:1.6;">
          หากคุณไม่ได้ดำเนินการนี้ กรุณาเพิกเฉยต่ออีเมลฉบับนี้
        </p>
      </td></tr>

      <!-- Footer -->
      <tr><td style="padding:16px 40px 24px;border-top:1px solid #f0f0f0;">
        <p style="margin:0;font-size:11px;color:#bbbbbb;line-height:1.6;">
          อีเมลนี้ถูกส่งโดยอัตโนมัติ · กรุณาอย่าตอบกลับ<br>
          Sent to: ${email}
        </p>
      </td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>`,
    });


    if (error) {
      this.logger.error(`ส่งอีเมลล้มเหลว: ${JSON.stringify(error)}`);
      throw new BadRequestException('ไม่สามารถส่งอีเมลได้ กรุณาลองใหม่อีกครั้ง');
    }

    this.logger.log(`ส่ง OTP ไปยัง ${email} สำเร็จ`);
    return { message: `ส่งรหัส OTP ไปยัง ${email} แล้ว กรุณาตรวจสอบกล่องจดหมาย (หมดอายุใน 5 นาที)` };
  }

  // =====================================================
  // verifyOtp — POST /auth/verify-otp
  // ตรวจ OTP + แยก role ตาม domain → return สำหรับ redirect
  // =====================================================
  async verifyOtp(email: string, otp: string) {
    // 1. หา OTP ล่าสุดของ email นี้
    const record = await this.prisma.otpCode.findFirst({
      where: { email, isUsed: false },
      orderBy: { createdAt: 'desc' },
    });

    if (!record) {
      throw new UnauthorizedException('ไม่พบรหัส OTP กรุณาขอรหัสใหม่');
    }

    // ✅ เช็คว่าถูก lock หรือไม่ (failCount >= 5)
    if (record.failCount >= 5) {
      throw new UnauthorizedException('รหัส OTP ถูก lock เนื่องจากใส่ผิดหลายครั้ง กรุณาขอรหัสใหม่');
    }

    // 2. เช็คหมดอายุ
    if (record.expiresAt < new Date()) {
      throw new UnauthorizedException('รหัส OTP หมดอายุแล้ว กรุณาขอรหัสใหม่');
    }

    // 3. เช็ค OTP ตรง
    if (record.otp !== otp) {
      // ✅ เพิ่ม failCount เมื่อ OTP ผิด
      await this.prisma.otpCode.update({
        where: { id: record.id },
        data: { failCount: { increment: 1 } },
      });
      const remaining = 4 - record.failCount; // record.failCount ยังไม่บวก
      if (remaining <= 0) {
        throw new UnauthorizedException('รหัส OTP ไม่ถูกต้อง และถูก lock แล้ว กรุณาขอรหัสใหม่');
      }
      throw new UnauthorizedException(`รหัส OTP ไม่ถูกต้อง (เหลือ ${remaining} ครั้ง)`);
    }

    // 4. Mark ว่าใช้แล้ว
    await this.prisma.otpCode.update({
      where: { id: record.id },
      data: { isUsed: true },
    });

    // 5. แยก role จาก domain
    // DEV: @gmail.com → ADVISOR สำหรับทดสอบ | TODO: ลบออกก่อน production
    let role: 'STUDENT' | 'ADVISOR' = 'STUDENT';
    if (email.endsWith('@en.rmutt.ac.th') || email.endsWith('@gmail.com')) {
      role = 'ADVISOR';
    }

    this.logger.log(`Verify OTP สำเร็จ: ${email} → role: ${role}`);
    return { verified: true, email, role };
  }

  /**
   * สมัครสมาชิก
   * ย้ายมาจาก: client/src/app/api/auth/signup/route.ts
   *
   * Flow:
   * 1. สร้าง users_id จาก email (เอาส่วนก่อน @)
   * 2. เช็ค duplicate email/users_id
   * 3. Hash password ด้วย bcrypt (10 rounds)
   * 4. สร้าง user ใน DB — role แยกตาม domain อัตโนมัติ
   * 5. Generate JWT → return token + user info
   *
   * ⚠️ แก้จากเดิม: role ไม่ hardcode 'STUDENT' แต่แยกจาก email domain
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

    // 4. แยก role จาก domain อัตโนมัติ
    // DEV: @gmail.com → ADVISOR | TODO: ลบก่อน production
    let role: 'STUDENT' | 'ADVISOR' = 'STUDENT';
    if (dto.email.endsWith('@en.rmutt.ac.th') || dto.email.endsWith('@gmail.com')) {
      role = 'ADVISOR';
    }

    // 5. สร้าง user ใน DB
    const newUser = await this.prisma.users.create({
      data: {
        users_id,
        titles: dto.titles,
        firstname: dto.firstname,
        lastname: dto.lastname,
        tel_number: dto.tel_number,
        email: dto.email,
        passwordHash: hashedPassword,
        role,
        expertiseAreas: dto.expertiseAreas, // เฉพาะ ADVISOR
      },
    });

    this.logger.log(`สมัครสมาชิกสำเร็จ: ${newUser.email} (role: ${newUser.role})`);

    // 6. Generate JWT
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
