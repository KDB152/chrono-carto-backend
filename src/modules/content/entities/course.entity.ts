import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export type CourseStatus = 'Publié' | 'Brouillon';

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  name: string; // original file name

  @Column({ length: 255, nullable: true })
  title?: string;

  @Column({ length: 50 })
  type: string; // PDF, Vidéo, Texte

  @Column({ length: 100 })
  subject: string; // Histoire, Géographie, EMC

  @Column({ length: 50 })
  level: string; // Seconde, Première, Terminale

  @Column({ length: 50 })
  size: string; // formatted size

  @CreateDateColumn({ name: 'upload_date' })
  upload_date: Date;

  @Column({ type: 'int', default: 0 })
  views: number;

  @Column({ type: 'varchar', length: 20, default: 'Publié' })
  status: CourseStatus;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'simple-array', nullable: true })
  tags?: string[];

  @Column({ name: 'file_name', length: 255, nullable: true })
  file_name?: string;

  @Column({ name: 'file_url', length: 500, nullable: true })
  file_url?: string;
}
