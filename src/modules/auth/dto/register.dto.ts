import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsAlphanumeric, IsEmail, IsOptional, IsString, Length, Matches, Min, MinLength } from "class-validator";

export class RegisterDto {
    @Type()
    @IsString()
    @IsEmail()
    @IsOptional()
    @ApiProperty({ default: 'abvykrm2004@gmail.com' })
    email: string;

    @Type()
    @IsString()
    @IsOptional()
    @Length(6, 30)
    @ApiProperty({ default: '+994123456789' })
    @Matches(/^\+[\d]+$/, { message: 'Phone number must start with + and contain only digits' })
    phone: string;

    @Type()
    @IsString()
    @MinLength(5)
    @ApiProperty({ default: '123456' })
    password: string;

    @Type()
    @IsString()
    @Length(3, 20)
    @IsAlphanumeric()
    @ApiProperty({ default: 'Ekrem' })
    username: string;

    @Type()
    @IsString()
    @IsOptional()
    @Length(3, 50)
    @ApiProperty({ nullable: true, default: 'Ekrem Abiyev' })
    fullName: string;
}