// src/modules/users/users.service.ts
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserRole } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async createUser(data: {
    email: string;
    password: string;
    first_name?: string;
    last_name?: string;
    role?: UserRole;
    is_approved?: boolean;
    is_active?: boolean;
  }): Promise<User> {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = this.usersRepository.create({
      email: data.email,
      password_hash: hashedPassword,
      first_name: data.first_name,
      last_name: data.last_name,
      role: data.role ?? UserRole.STUDENT,
      is_active: data.is_active ?? true,
      is_approved: data.is_approved ?? false,
    });

    return this.usersRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findById(id: number): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async update(id: number, data: Partial<User>): Promise<User> {
    await this.usersRepository.update(id, data);
    return this.findById(id);
  }

  async remove(id: number): Promise<{ success: boolean }> {
    await this.usersRepository.delete(id);
    return { success: true };
  }
}