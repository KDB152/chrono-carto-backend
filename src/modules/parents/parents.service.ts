// src/modules/parents/parents.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Parent } from './entities/parent.entity';

@Injectable()
export class ParentsService {
  async findByUserId(userId: number): Promise<Parent | null> {
    return this.parentsRepository.findOne({ where: { user: { id: userId } } });
  }
  constructor(
    @InjectRepository(Parent)
    private parentsRepository: Repository<Parent>,
  ) {}

  async createParent(userId: number, phone?: string): Promise<Parent> {
    const parent = this.parentsRepository.create({
      user_id: userId,
      phone_number: phone,
    });
    return this.parentsRepository.save(parent);
  }
}