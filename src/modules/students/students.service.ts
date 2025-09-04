// src/modules/students/students.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from './entities/student.entity';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@Injectable()
export class StudentsService {
  async findByUserId(userId: number): Promise<Student | null> {
    return this.studentsRepository.findOne({ where: { user_id: userId } });
  }
  constructor(
    @InjectRepository(Student)
    private studentsRepository: Repository<Student>,
  ) {}

  async createStudent(userId: number, phone?: string): Promise<Student> {
    // Vérifier si l'étudiant existe déjà pour ce user
    let student = await this.studentsRepository.findOne({
      where: { user_id: userId },
    });

    if (student) {
      // Mettre à jour l'étudiant existant si besoin
      student.phone_number = phone ?? student.phone_number;
    } else {
      // Créer un nouvel étudiant
      student = this.studentsRepository.create({
        user_id: userId,
        phone_number: phone,
      });
    }

    return this.studentsRepository.save(student);
  }

  async findAll({ page = 1, limit = 50 }: { page?: number; limit?: number }) {
    const [items, total] = await this.studentsRepository.findAndCount({
      relations: ['user'],
      skip: (page - 1) * limit,
      take: limit,
      order: { id: 'DESC' },
    });

    console.log(`Found ${items.length} students with relations`);

    // Transform data to match frontend expectations
    const transformedItems = items.map(student => {
      console.log(`Processing student ${student.id} with user:`, student.user);
      return {
        id: student.id,
        firstName: student.user?.firstName || '',
        lastName: student.user?.lastName || '',
        email: student.user?.email || '',
        phoneNumber: student.phone_number || '',
        classLevel: student.class_level || '',
        birthDate: student.birth_date ? student.birth_date.toISOString() : '',
        progressPercentage: student.progress_percentage || 0,
        averageScore: student.average_score || 0,
        role: student.user?.role || 'student',
        isActive: student.user?.is_active || false,
        isApproved: student.user?.is_approved || false,
        createdAt: student.user?.created_at ? new Date(student.user.created_at).toISOString() : new Date().toISOString(),
        notes: '',
      };
    });

    console.log(`Transformed ${transformedItems.length} students`);

    return { items: transformedItems, total, page, limit };
  }

  async findOne(id: number) {
    return this.studentsRepository.findOne({ where: { id } });
  }

  async create(dto: CreateStudentDto): Promise<Student> {
    // Check if student already exists for this user
    const existingStudent = await this.studentsRepository.findOne({
      where: { user_id: dto.user_id },
    });

    if (existingStudent) {
      // Update existing student with new data
      existingStudent.class_level = dto.class_level ?? existingStudent.class_level;
      existingStudent.birth_date = dto.birth_date ? new Date(dto.birth_date) : existingStudent.birth_date;
      existingStudent.phone_number = dto.phone_number ?? existingStudent.phone_number;
      existingStudent.address = dto.address ?? existingStudent.address;
      existingStudent.parent_id = dto.parent_id ?? existingStudent.parent_id;
      return this.studentsRepository.save(existingStudent);
    }

    // Create new student
    const entity = this.studentsRepository.create({
      user_id: dto.user_id,
      class_level: dto.class_level,
      birth_date: dto.birth_date ? new Date(dto.birth_date) : undefined,
      phone_number: dto.phone_number,
      address: dto.address,
      parent_id: dto.parent_id,
    });
    return this.studentsRepository.save(entity);
  }

  async update(id: number, dto: UpdateStudentDto) {
    const payload: any = { ...dto };
    if (dto.birth_date) payload.birth_date = new Date(dto.birth_date as any);
    if (dto.last_activity) payload.last_activity = new Date(dto.last_activity as any);
    await this.studentsRepository.update(id, payload);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.studentsRepository.delete(id);
    return { success: true };
  }
}
