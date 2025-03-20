import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('login_attempts')
export class LoginAttemptsEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    ip: string;

    @Column()
    userId: string;

    @CreateDateColumn({type: 'timestamptz'})
    createdAt: Date;
}