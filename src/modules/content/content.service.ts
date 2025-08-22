import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './entities/course.entity';

@Injectable()
export class ContentService {
  constructor(@InjectRepository(Course) private readonly courseRepo: Repository<Course>) {}

  async listCourses({ page = 1, limit = 50, subject, type, status }: { page?: number; limit?: number; subject?: string; type?: string; status?: string; }) {
    const qb = this.courseRepo.createQueryBuilder('c');
    if (subject) qb.andWhere('c.subject = :subject', { subject });
    if (type) qb.andWhere('c.type = :type', { type });
    if (status) qb.andWhere('c.status = :status', { status });
    qb.orderBy('c.id', 'DESC').skip((page - 1) * limit).take(limit);
    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit };
  }

  async createCourse(payload: Partial<Course>) {
    const entity = this.courseRepo.create(payload);
    return this.courseRepo.save(entity);
  }

  async updateCourse(id: number, payload: Partial<Course>) {
    await this.courseRepo.update(id, payload);
    return this.courseRepo.findOne({ where: { id } });
  }

  async deleteCourse(id: number) {
    await this.courseRepo.delete(id);
    return { success: true };
  }
}
