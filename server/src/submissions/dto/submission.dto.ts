import { IsString, IsOptional } from 'class-validator';

/** PATCH /submissions/:id/submit — ส่งงาน */
export class SubmitDto {
    @IsOptional()
    @IsString()
    file?: string;
}

/** PATCH /submissions/:id/approve or reject — อนุมัติ/ปฏิเสธ */
export class FeedbackDto {
    @IsOptional()
    @IsString()
    feedback?: string;
}

/** PATCH /submissions/:id/reject — ปฏิเสธ (feedback required) */
export class RejectDto {
    @IsString()
    feedback: string;
}
