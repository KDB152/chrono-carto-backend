import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  conversation_id: number;

  @Column()
  sender_id: number;

  @Column({ type: 'text' })
  content: string;

  @Column({ default: 'text' })
  message_type: string;

  @Column({ default: false })
  is_read: boolean;

  @Column({ nullable: true })
  file_path: string;

  @CreateDateColumn()
  created_at: Date;
}
