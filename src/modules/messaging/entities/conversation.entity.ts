import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('conversations')
export class Conversation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  participant1_id: number;

  @Column()
  participant2_id: number;

  @Column({ nullable: true })
  title: string;

  @Column({ default: 'direct' })
  type: string;

  @Column({ nullable: true })
  last_message_id: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
