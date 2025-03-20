import { Type } from "class-transformer";
import { IsString, Length, Min, MinLength } from "class-validator";

export class LoginDto {
    @Type()
    @IsString()
    @Length(3, 50)
    username: string;

    @Type()
    @IsString()
    @MinLength(5)
    password: string;
}