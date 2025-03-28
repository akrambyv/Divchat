import { BadRequestException, ConflictException, HttpException, HttpStatus, Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { UserEntity } from "src/database/entities/User.entity";
import { DataSource, FindOptionsWhere, In, Repository } from "typeorm";
import { RegisterDto } from "./dto/register.dto";
import { JwtService } from "@nestjs/jwt";
import { LoginDto } from "./dto/login.dto";
import { compare } from "bcrypt";
import { ClsService } from "nestjs-cls";
import { LoginAttemptsEntity } from "src/database/entities/LoginAttempts.entity";
import config from "src/config";

@Injectable()
export class AuthService {
    private userRepo: Repository<UserEntity>;
    private loginAttemptsRepo: Repository<LoginAttemptsEntity>;

    constructor(
        private cls: ClsService,
        private jwt: JwtService,
        @InjectDataSource() private dataSource: DataSource
    ) {
        this.userRepo = this.dataSource.getRepository(UserEntity);
    }

    async login(params: LoginDto) {
        // let result = this.cls.get('ip');
        let identifier = params.username.toLowerCase();
        let where: FindOptionsWhere<UserEntity>[] = [
            {
                username: identifier
            },
            {
                email: identifier
            },
            {
                phone: identifier
            },
        ];

        let user = await this.userRepo.findOne({ where });

        if (!user) throw new UnauthorizedException('User not found');
        await this.checkLoginAttempt(user);

        let checkPassword = compare(params.password, user.password);

        if (!checkPassword) {
            await this.addLoginAttempt(user);
            throw new UnauthorizedException('Invalid password');
        }

        await this.clearLoginAttempts(user);

        return {
            user,
            token: this.generateToken(user.id),
        };
    }

    async register(params: RegisterDto) {
        if (!params.phone && !params.email)
            throw new BadRequestException('Either phone or email must be provided');

        let username = params.username.toLowerCase();
        const email = params.email?.toLocaleLowerCase();
        const phone = params.phone;

        let where: FindOptionsWhere<UserEntity>[] = [
            { username },
        ];

        if (email) { where.push({ email }); }
        if (phone) { where.push({ phone }); }

        let userExists = await this.userRepo.findOne({
            where
        });

        if (userExists) {
            if (userExists.username === username) {
                throw new ConflictException({
                    message: 'Username already exists',
                    suggestions: await this.usernameSuggestions(username)
                });
            } else if (userExists.email === email) {
                throw new ConflictException({ message: 'Email already exists' });
            } else {
                throw new ConflictException({ message: 'Phone number already exists' });
            }
        }

        let user = await this.userRepo.save(this.userRepo.create({
            username,
            password: params.password,
            email,
            phone,
            profile: {
                fullName: params.fullName,
            },
        }));

        let token = this.generateToken(user.id);
        return { user, token };
    }

    async addLoginAttempt(user: UserEntity) {
        let ip = this.cls.get('ip');

        let attempt = this.loginAttemptsRepo.create({
            ip,
            userId: user.id.toString(),
        })

        await attempt.save();
        return true;
    }

    async checkLoginAttempt(user: UserEntity) {
        let ip = this.cls.get('ip');
        let attempts = await this.loginAttemptsRepo.count({
            where: {
                ip,
                userId: user.id.toString(),
            },
        });

        if (attempts >= config.loginAttempts) { }
        throw new HttpException('Too many login attempts', HttpStatus.TOO_MANY_REQUESTS);
    }

    async clearLoginAttempts(user: UserEntity) {
        let ip = this.cls.get('ip');
        await this.loginAttemptsRepo.delete({
            ip,
            userId: user.id.toString(),
        });
    }

    async usernameSuggestions(username: string) {
        let usernames = Array.from({ length: 5 }).map(item => `${username}${Math.floor(Math.random() * 8999) + 1000}`);
        let dbUsernames = await this.userRepo.find({
            where: {
                username: In(usernames),
            },
            select: {
                id: true,
                username: true,
            }
        });

        let existsUsernames = dbUsernames.map(user => user.username);

        usernames = usernames.filter(username => !existsUsernames.includes(username));

        return usernames.slice(0, 2);
    }

    async generateToken(userId: number) {
        return this.jwt.sign({ userId });
    }
}