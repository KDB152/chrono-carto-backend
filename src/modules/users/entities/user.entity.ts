// src/modules/users/entities/user.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum UserRole {
  STUDENT = 'student',
  PARENT = 'parent',
  TEACHER = 'teacher',
  ADMIN = 'admin',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password_hash: string;

  @Column({ nullable: true })
  first_name?: string;

  @Column({ nullable: true })
  last_name?: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.STUDENT,
  })
  role: UserRole;

  @Column({ default: false })
  is_active: boolean;

  @Column({ default: false })
  email_verified: boolean;

  @Column({ nullable: true })
  verification_token?: string;

  @Column({ nullable: true, type: 'timestamp' })
  verification_token_expiry?: Date;

  @Column({ nullable: true })
  verification_code?: string;

  @Column({ nullable: true, type: 'timestamp' })
  verification_code_expiry?: Date;

  @Column({ nullable: true, type: 'timestamp' })
  email_verified_at?: Date;

  @Column({ nullable: true })
  password_reset_token?: string;

  @Column({ nullable: true, type: 'timestamp' })
  password_reset_token_expiry?: Date;

  @Column({ nullable: true })
  password_reset_code?: string;

  @Column({ nullable: true, type: 'timestamp' })
  password_reset_code_expiry?: Date;

  @Column({ nullable: true })
  reset_token?: string;

  @Column({ nullable: true, type: 'timestamp' })
  reset_token_expires?: Date;

  @Column({ nullable: true, type: 'timestamp' })
  last_login?: Date;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
  student: any;
}
