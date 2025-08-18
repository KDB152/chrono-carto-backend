// src/modules/students/students.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from './entities/student.entity';

@Injectable()
export class StudentsService {
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
}
