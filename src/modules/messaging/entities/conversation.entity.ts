import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Message } from './message.entity';

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

  @ManyToOne(() => User)
  @JoinColumn({ name: 'participant1_id' })
  participant1: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'participant2_id' })
  participant2: User;

  @OneToMany(() => Message, message => message.conversation)
  messages: Message[];

  @ManyToOne(() => Message)
  @JoinColumn({ name: 'last_message_id' })
  lastMessage: Message;
}
