// src/modules/students/entities/student.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('students')
export class Student {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, (user) => user.student)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id', unique: true })
  user_id: number;

  @Column({ nullable: true })
  class_level: string;

  @Column({ nullable: true })
  birth_date: Date;

  @Column({ nullable: true })
  phone_number: string;

  @Column({ nullable: true })
  address: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0.00 })
  progress_percentage: number;

  @Column({ default: 0 })
  total_quiz_attempts: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0.00 })
  average_score: number;

  @Column({ nullable: true })
  last_activity: Date;

  @Column({ nullable: true })
  parent_id: number;
}