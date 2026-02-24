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
    @MinLength(6)
    password: string;

    @IsString()
    @IsOptional()
    tel_number?: string;
}
