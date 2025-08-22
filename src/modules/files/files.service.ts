import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { File } from './entities/file.entity';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(File)
    private fileRepository: Repository<File>,
  ) {}

  async findAll({ page = 1, limit = 50, type, category }: {
    page?: number;
    limit?: number;
    type?: string;
    category?: string;
  }) {
    const queryBuilder = this.fileRepository.createQueryBuilder('file');

    if (type) {
      queryBuilder.andWhere('file.type = :type', { type });
    }

    if (category) {
      queryBuilder.andWhere('file.category = :category', { category });
    }

    const [items, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('file.created_at', 'DESC')
      .getManyAndCount();

    return { items, total, page, limit };
  }

  async findOne(id: number) {
    return this.fileRepository.findOne({ where: { id } });
  }

  async uploadFile(file: Express.Multer.File, body: any) {
    const fileEntity = this.fileRepository.create({
      filename: file.filename,
      original_name: file.originalname,
      path: file.path,
      size: file.size,
      type: file.mimetype,
      category: body.category || 'general',
      description: body.description,
      uploaded_by: body.uploadedBy,
      tags: body.tags ? JSON.parse(body.tags) : []
    });

    return this.fileRepository.save(fileEntity);
  }

  async update(id: number, updateData: any) {
    await this.fileRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: number) {
    const file = await this.findOne(id);
    if (file && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    return this.fileRepository.delete(id);
  }

  async getCategories() {
    const result = await this.fileRepository
      .createQueryBuilder('file')
      .select('file.category')
      .distinct()
      .getRawMany();

    return result.map(r => r.file_category);
  }

  async getFileTypes() {
    const result = await this.fileRepository
      .createQueryBuilder('file')
      .select('file.type')
      .distinct()
      .getRawMany();

    return result.map(r => r.file_type);
  }

  async bulkDelete(ids: number[]) {
    const files = await this.fileRepository.findByIds(ids);
    
    for (const file of files) {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    }

    return this.fileRepository.delete(ids);
  }

  async bulkMove(ids: number[], category: string) {
    return this.fileRepository.update(ids, { category });
  }

  async searchFiles(query: string) {
    return this.fileRepository
      .createQueryBuilder('file')
      .where('file.original_name LIKE :query', { query: `%${query}%` })
      .orWhere('file.description LIKE :query', { query: `%${query}%` })
      .orderBy('file.created_at', 'DESC')
      .getMany();
  }

  async getFileStats() {
    const totalFiles = await this.fileRepository.count();
    const totalSize = await this.fileRepository
      .createQueryBuilder('file')
      .select('SUM(file.size)', 'totalSize')
      .getRawOne();

    const categories = await this.getCategories();
    const categoryStats = await Promise.all(
      categories.map(async (category) => {
        const count = await this.fileRepository.count({ where: { category } });
        return { category, count };
      })
    );

    return {
      totalFiles,
      totalSize: parseInt(totalSize.totalSize) || 0,
      categories: categoryStats
    };
  }

  async downloadFile(id: number) {
    const file = await this.findOne(id);
    if (!file || !fs.existsSync(file.path)) {
      throw new Error('File not found');
    }

    return {
      path: file.path,
      filename: file.original_name,
      type: file.type
    };
  }

  async shareFile(id: number, users: number[]) {
    // This would typically involve creating file sharing records
    // For now, we'll just return success
    return { success: true, sharedWith: users.length };
  }
}
