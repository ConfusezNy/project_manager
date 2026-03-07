import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Uploads Service
 *
 * 📌 จัดการไฟล์อัปโหลด:
 * - saveFile(file, subfolder) → เก็บไฟล์ลง disk, return absolute URL
 * - deleteFile(filePath) → ลบไฟล์เก่า
 */
@Injectable()
export class UploadsService {
    private readonly logger = new Logger(UploadsService.name);
    private readonly uploadRoot: string;
    /** Base URL ของ NestJS server เอง (ต้องเป็น absolute ไม่ใช่ port 3000) */
    private readonly baseUrl: string;

    constructor() {
        this.uploadRoot = path.join(process.cwd(), 'uploads');
        this.baseUrl = process.env.BACKEND_URL || 'http://localhost:4000';
        // สร้าง folder หลักถ้ายังไม่มี
        this.ensureDir(this.uploadRoot);
        this.ensureDir(path.join(this.uploadRoot, 'profiles'));
        this.ensureDir(path.join(this.uploadRoot, 'submissions'));
        this.ensureDir(path.join(this.uploadRoot, 'attachments'));
    }

    private ensureDir(dir: string) {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    }

    /**
     * Sanitize ชื่อไฟล์: ลบอักขระอันตราย เก็บ Unicode (ภาษาไทย/ญี่ปุ่น etc.)
     */
    private sanitizeFilename(original: string): string {
        // ✅ Multer เก็บ originalname เป็น latin1 ต้อง decode กลับเป็น utf8
        const decoded = Buffer.from(original, 'latin1').toString('utf8');
        // แยก extension ออกก่อน
        const ext = path.extname(decoded).toLowerCase();
        const base = path.basename(decoded, ext);
        // แทน path separator / \ และ null byte ด้วย underscore
        const sanitized = base
            .replace(/[/\\?%*:|"<>\x00]/g, '_')
            .replace(/\s+/g, '_')
            .slice(0, 100); // จำกัดความยาว
        return sanitized + ext;
    }

    /**
     * บันทึกไฟล์ลง disk
     * @returns absolute fileUrl เช่น "http://localhost:4000/uploads/submissions/uuid_report.pdf"
     */
    saveFile(
        file: Express.Multer.File,
        subfolder: 'profiles' | 'submissions' | 'attachments',
    ): { fileUrl: string; filename: string } {
        const cleanName = this.sanitizeFilename(file.originalname);
        // UUID prefix เพื่อให้ไฟล์ชื่อซ้ำกันไม่ได้ แต่ยังคงชื่อเดิมไว้
        const uniqueName = `${this.generateUuid()}_${cleanName}`;
        const destDir = path.join(this.uploadRoot, subfolder);
        this.ensureDir(destDir);
        const destPath = path.join(destDir, uniqueName);

        fs.writeFileSync(destPath, file.buffer);

        this.logger.log(`File saved: ${subfolder}/${uniqueName} (${file.size} bytes)`);

        // ✅ Return absolute URL → ตรงไป port 4000 ไม่ผ่าน Next.js
        return {
            fileUrl: `${this.baseUrl}/uploads/${subfolder}/${uniqueName}`,
            filename: Buffer.from(file.originalname, 'latin1').toString('utf8'),
        };
    }

    /**
     * ลบไฟล์จาก disk (เช่น เปลี่ยนรูป profile)
     */
    deleteFile(fileUrl: string): boolean {
        // รองรับทั้ง absolute URL และ relative path
        const relativePath = fileUrl.includes('/uploads/')
            ? fileUrl.substring(fileUrl.indexOf('/uploads/'))
            : fileUrl;

        if (!relativePath.startsWith('/uploads/')) return false;

        const filePath = path.join(process.cwd(), relativePath);
        try {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                this.logger.log(`File deleted: ${relativePath}`);
                return true;
            }
        } catch (error) {
            this.logger.error(`Failed to delete file: ${error}`);
        }
        return false;
    }

    private generateUuid(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0;
            const v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }
}
