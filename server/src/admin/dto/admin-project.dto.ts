import { IsString, IsOptional } from 'class-validator';

/** GET /admin/projects?section_id=&status=&search= — query filters */
export class AdminProjectQueryDto {
    @IsOptional()
    @IsString()
    section_id?: string;

    @IsOptional()
    @IsString()
    status?: string;

    @IsOptional()
    @IsString()
    search?: string;
}
