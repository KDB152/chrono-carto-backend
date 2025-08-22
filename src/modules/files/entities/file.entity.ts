import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('files')
export class File {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  filename: string;

  @Column()
  original_name: string;

  @Column()
  path: string;

  @Column('bigint')
  size: number;

  @Column()
  type: string;

  @Column({ default: 'general' })
  category: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  uploaded_by: number;

  @Column('simple-array', { nullable: true })
  tags: string[];

  @Column({ default: 0 })
  download_count: number;

  @Column({ default: true })
  is_public: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
