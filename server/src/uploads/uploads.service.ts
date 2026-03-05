import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Uploads Service
 *
 * 📌 จัดการไฟล์อัปโหลด:
 * - saveFile(file, subfolder) → เก็บไฟล์ลง disk, return URL path
 * - deleteFile(filePath) → ลบไฟล์เก่า
 */
@Injectable()
export class UploadsService {
    private readonly logger = new Logger(UploadsService.name);
    private readonly uploadRoot: string;

    constructor() {
        this.uploadRoot = path.join(process.cwd(), 'uploads');
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
     * บันทึกไฟล์ลง disk
     * @returns URL path เช่น "/uploads/profiles/abc-123.jpg"
     */
    saveFile(
        file: Express.Multer.File,
        subfolder: 'profiles' | 'submissions' | 'attachments',
    ): { fileUrl: string; filename: string } {
        const ext = path.extname(file.originalname).toLowerCase();
        const uniqueName = `${this.generateUuid()}${ext}`;
        const destDir = path.join(this.uploadRoot, subfolder);
        this.ensureDir(destDir);
        const destPath = path.join(destDir, uniqueName);

        fs.writeFileSync(destPath, file.buffer);

        this.logger.log(`File saved: ${subfolder}/${uniqueName} (${file.size} bytes)`);

        return {
            fileUrl: `/uploads/${subfolder}/${uniqueName}`,
            filename: file.originalname,
        };
    }

    /**
     * ลบไฟล์จาก disk (เช่น เปลี่ยนรูป profile)
     */
    deleteFile(fileUrl: string): boolean {
        if (!fileUrl || !fileUrl.startsWith('/uploads/')) return false;

        const filePath = path.join(process.cwd(), fileUrl);
        try {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                this.logger.log(`File deleted: ${fileUrl}`);
                return true;
            }
        } catch (error) {
            this.logger.error(`Failed to delete file: ${error}`);
        }
        return false;
    }

    private generateUuid(): string {
        // Simple UUID v4 without external dependency
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0;
            const v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }
}
