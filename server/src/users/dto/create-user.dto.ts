import { IsNotEmpty, IsOptional, IsString, IsEnum, MinLength, Matches } from 'class-validator';

enum Role {
    ADMIN = 'ADMIN',
    ADVISOR = 'ADVISOR',
    STUDENT = 'STUDENT',
}

export class CreateUserDto {
    @IsNotEmpty()
    @IsString()
    firstname: string;

    @IsNotEmpty()
    @IsString()
    lastname: string;

    @IsNotEmpty()
    @IsString()
    email: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(8, { message: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร' })
    @Matches(/\d/, { message: 'รหัสผ่านต้องมีตัวเลขอย่างน้อย 1 ตัว' })
    password: string;

    @IsOptional()
    @IsString()
    tel_number?: string;

    @IsOptional()
    @IsString()
    titles?: string;

    @IsOptional()
    @IsString()
    profilePicture?: string;

    @IsNotEmpty()
    @IsEnum(Role)
    role: Role;

    @IsOptional()
    @IsString()
    expertiseAreas?: string;
}
