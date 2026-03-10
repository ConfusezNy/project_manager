import { IsOptional, IsString, IsEnum, MinLength, Matches } from 'class-validator';

enum Role {
    ADMIN = 'ADMIN',
    ADVISOR = 'ADVISOR',
    STUDENT = 'STUDENT',
}

export class UpdateUserDto {
    @IsOptional()
    @IsString()
    firstname?: string;

    @IsOptional()
    @IsString()
    lastname?: string;

    @IsOptional()
    @IsString()
    email?: string;

    @IsOptional()
    @IsString()
    tel_number?: string;

    @IsOptional()
    @IsString()
    titles?: string;

    @IsOptional()
    @IsString()
    profilePicture?: string;

    @IsOptional()
    @IsEnum(Role)
    role?: Role;

    @IsOptional()
    @IsString()
    @MinLength(8, { message: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร' })
    @Matches(/\d/, { message: 'รหัสผ่านต้องมีตัวเลขอย่างน้อย 1 ตัว' })
    newPassword?: string;

    @IsOptional()
    @IsString()
    expertiseAreas?: string;
}
