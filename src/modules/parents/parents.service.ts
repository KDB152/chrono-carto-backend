// src/modules/parents/parents.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Parent } from './entities/parent.entity';
import { CreateParentDto } from './dto/create-parent.dto';
import { UpdateParentDto } from './dto/update-parent.dto';

@Injectable()
export class ParentsService {
  async findByUserId(userId: number): Promise<Parent | null> {
    return this.parentsRepository.findOne({ where: { user_id: userId } });
  }

  async findByUserIdWithUser(userId: number) {
    const parent = await this.parentsRepository.findOne({ 
      where: { user_id: userId },
      relations: ['user']
    });

    if (!parent) {
      return null;
    }

    // Transform data to match frontend expectations
    return {
      id: parent.id,
      firstName: parent.user?.first_name || '',
      lastName: parent.user?.last_name || '',
      email: parent.user?.email || '',
      phone: parent.phone_number || '',
      address: parent.address || '',
      occupation: parent.occupation || '',
      role: parent.user?.role || 'parent',
      isActive: parent.user?.is_active || false,
      isApproved: parent.user?.is_approved || false,
      createdAt: parent.user?.created_at ? new Date(parent.user.created_at).toISOString() : new Date().toISOString(),
    };
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

  async findAll({ page = 1, limit = 50 }: { page?: number; limit?: number }) {
    const [items, total] = await this.parentsRepository.findAndCount({
      relations: ['user'],
      skip: (page - 1) * limit,
      take: limit,
      order: { id: 'DESC' },
    });

    console.log(`Found ${items.length} parents with relations`);

    // Transform data to match frontend expectations
    const transformedItems = items.map(parent => {
      console.log(`Processing parent ${parent.id} with user:`, parent.user);
      return {
        id: parent.id,
        firstName: parent.user?.first_name || '',
        lastName: parent.user?.last_name || '',
        email: parent.user?.email || '',
        phoneNumber: parent.phone_number || '',
        address: parent.address || '',
        occupation: parent.occupation || '',
        role: parent.user?.role || 'parent',
        isActive: parent.user?.is_active || false,
        isApproved: parent.user?.is_approved || false,
        createdAt: parent.user?.created_at ? new Date(parent.user.created_at).toISOString() : new Date().toISOString(),
        notes: '',
      };
    });

    console.log(`Transformed ${transformedItems.length} parents`);

    return { items: transformedItems, total, page, limit };
  }

  async findOne(id: number) {
    return this.parentsRepository.findOne({ where: { id } });
  }

  async create(dto: CreateParentDto) {
    // Check if parent already exists for this user
    const existingParent = await this.parentsRepository.findOne({
      where: { user_id: dto.user_id },
    });

    if (existingParent) {
      // Update existing parent with new data
      existingParent.phone_number = dto.phone_number ?? existingParent.phone_number;
      existingParent.address = dto.address ?? existingParent.address;
      existingParent.occupation = dto.occupation ?? existingParent.occupation;
      return this.parentsRepository.save(existingParent);
    }

    // Create new parent
    const entity = this.parentsRepository.create({
      user_id: dto.user_id,
      phone_number: dto.phone_number,
      address: dto.address,
      occupation: dto.occupation,
    });
    return this.parentsRepository.save(entity);
  }

  async update(id: number, dto: UpdateParentDto) {
    await this.parentsRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.parentsRepository.delete(id);
    return { success: true };
  }
}