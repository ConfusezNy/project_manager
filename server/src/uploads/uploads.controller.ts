import {
    Controller,
    Post,
    UseGuards,
    UseInterceptors,
    UploadedFile,
    BadRequestException,
    ParseFilePipe,
    MaxFileSizeValidator,
    FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { UploadsService } from './uploads.service';

/**
 * Uploads Controller
 *
 * 📌 3 endpoints สำหรับ upload ไฟล์:
 * - POST /uploads/profile      (max 2MB, images only)
 * - POST /uploads/submission    (max 20MB, docs + images)
 * - POST /uploads/attachment    (max 20MB, common types)
 *
 * ทุก endpoint ใช้ JwtAuthGuard + Multer memoryStorage
 */
@Controller('uploads')
@UseGuards(JwtAuthGuard)
export class UploadsController {
    constructor(private readonly uploadsService: UploadsService) { }

    // =====================================================
    // POST /uploads/profile — อัปโหลดรูปโปรไฟล์
    // Max: 2MB, Types: image/*
    // =====================================================
    @Post('profile')
    @UseInterceptors(FileInterceptor('file', { storage: undefined }))
    uploadProfile(
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 2 * 1024 * 1024 }), // 2MB
                    new FileTypeValidator({ fileType: /^image\/(jpeg|png|gif|webp)$/ }),
                ],
                fileIsRequired: true,
            }),
        )
        file: Express.Multer.File,
    ) {
        return this.uploadsService.saveFile(file, 'profiles');
    }

    // =====================================================
    // POST /uploads/submission — อัปโหลดไฟล์ส่งงาน (Events)
    // Max: 20MB, Types: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, images, ZIP
    // =====================================================
    @Post('submission')
    @UseInterceptors(FileInterceptor('file', { storage: undefined }))
    uploadSubmission(
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 20 * 1024 * 1024 }), // 20MB
                ],
                fileIsRequired: true,
            }),
        )
        file: Express.Multer.File,
    ) {
        // Validate file type manually for broader support
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'application/zip',
            'application/x-rar-compressed',
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
        ];
        if (!allowedTypes.includes(file.mimetype)) {
            throw new BadRequestException(
                `ไม่รองรับไฟล์ประเภท ${file.mimetype} — รองรับ: PDF, Word, Excel, PowerPoint, รูปภาพ, ZIP`,
            );
        }
        return this.uploadsService.saveFile(file, 'submissions');
    }

    // =====================================================
    // POST /uploads/attachment — อัปโหลดไฟล์แนบ (Tasks)
    // Max: 20MB, Types: เกือบทุกประเภท
    // =====================================================
    @Post('attachment')
    @UseInterceptors(FileInterceptor('file', { storage: undefined }))
    uploadAttachment(
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 20 * 1024 * 1024 }), // 20MB
                ],
                fileIsRequired: true,
            }),
        )
        file: Express.Multer.File,
    ) {
        // ✅ Validate MIME type — ห้ามอัปโหลดไฟล์อันตราย
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'application/zip',
            'application/x-rar-compressed',
            'application/x-7z-compressed',
            'text/plain',
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
        ];
        if (!allowedTypes.includes(file.mimetype)) {
            throw new BadRequestException(
                `ไม่รองรับไฟล์ประเภท ${file.mimetype} — รองรับ: PDF, Word, Excel, PowerPoint, รูปภาพ, ZIP, TXT`,
            );
        }
        return this.uploadsService.saveFile(file, 'attachments');
    }
}
