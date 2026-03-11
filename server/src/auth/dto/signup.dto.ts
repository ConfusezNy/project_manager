import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class SignupDto {
    @IsString()
    @IsOptional()
    titles?: string;

    @IsString()
    firstname: string;

    @IsString()
    lastname: string;

    @IsEmail()
    email: string;

    @IsString()
    @MinLength(9)
    password: string;

    @IsString()
    @IsOptional()
    tel_number?: string;

    @IsString()
    @IsOptional()
    expertiseAreas?: string; // สำหรับอาจารย์ — ความเชี่ยวชาญ
}
