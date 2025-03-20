import { Body, Controller, Post, Res } from "@nestjs/common";
import { RegisterDto } from "./dto/register.dto";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { Response } from "express";

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('login')
    async login(@Body() body: LoginDto, @Res() res: Response) {
        let result = await this.authService.login(body);
        res.cookie('authorization', `Bearer ${result.token}`);

        res.json(result);
    }

    @Post('register')
    register(@Body() body: RegisterDto) {
        return this.authService.register(body);
    }
}