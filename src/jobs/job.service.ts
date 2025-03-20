import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { InjectDataSource } from "@nestjs/typeorm";
import { addHours } from "date-fns";
import { LoginAttemptsEntity } from "src/database/entities/LoginAttempts.entity";
import { DataSource, LessThanOrEqual, Repository } from "typeorm";

@Injectable()
export class JobService {
    private loginAttemptsRepo: Repository<LoginAttemptsEntity>;

    constructor(
        @InjectDataSource() private dataSource: DataSource
    ) {
        this.loginAttemptsRepo = this.dataSource.getRepository(LoginAttemptsEntity);
    }

    @Cron(CronExpression.EVERY_10_MINUTES)
    async clearLoginAttempts() {
        await this.loginAttemptsRepo.delete({
            createdAt: LessThanOrEqual(addHours(new Date(), -1)),
        });
    }
}