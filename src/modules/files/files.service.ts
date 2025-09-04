import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { File } from './entities/file.entity';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(File)
    private filesRepository: Repository<File>,
  ) {}

  async create(createFileDto: CreateFileDto, uploadedBy: number): Promise<File> {
    const file = this.filesRepository.create({
      ...createFileDto,
      uploadedBy,
    });

    return this.filesRepository.save(file);
  }

  async findAll(): Promise<File[]> {
    return this.filesRepository.find({
      where: { isActive: true },
      relations: ['uploader'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByClass(targetClass: string): Promise<File[]> {
    return this.filesRepository.find({
      where: { 
        targetClass,
        isActive: true 
      },
      relations: ['uploader'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<File> {
    const file = await this.filesRepository.findOne({
      where: { id, isActive: true },
      relations: ['uploader'],
    });

    if (!file) {
      throw new NotFoundException(`Fichier avec l'ID ${id} non trouvé`);
    }

    return file;
  }

  async update(id: number, updateFileDto: UpdateFileDto): Promise<File> {
    const file = await this.findOne(id);
    
    Object.assign(file, updateFileDto);
    return this.filesRepository.save(file);
  }

  async remove(id: number): Promise<void> {
    const file = await this.findOne(id);
    file.isActive = false;
    await this.filesRepository.save(file);
  }

  async incrementDownloadCount(id: number): Promise<void> {
    await this.filesRepository.increment({ id }, 'downloadCount', 1);
  }

  async getFilesByUserClass(userClass: string): Promise<File[]> {
    return this.filesRepository.find({
      where: { 
        targetClass: userClass,
        isActive: true 
      },
      relations: ['uploader'],
      order: { createdAt: 'DESC' },
    });
  }

  async getAvailableClasses(): Promise<string[]> {
    const result = await this.filesRepository
      .createQueryBuilder('file')
      .select('DISTINCT file.targetClass', 'targetClass')
      .where('file.isActive = :isActive', { isActive: true })
      .getRawMany();

    return result.map(row => row.targetClass);
  }

  async getFileStats(): Promise<{
    totalFiles: number;
    totalDownloads: number;
    filesByClass: { [key: string]: number };
  }> {
    const totalFiles = await this.filesRepository.count({
      where: { isActive: true }
    });

    const totalDownloads = await this.filesRepository
      .createQueryBuilder('file')
      .select('SUM(file.downloadCount)', 'total')
      .where('file.isActive = :isActive', { isActive: true })
      .getRawOne();

    const filesByClass = await this.filesRepository
      .createQueryBuilder('file')
      .select('file.targetClass', 'class')
      .addSelect('COUNT(*)', 'count')
      .where('file.isActive = :isActive', { isActive: true })
      .groupBy('file.targetClass')
      .getRawMany();

    const classStats = {};
    filesByClass.forEach(item => {
      classStats[item.class] = parseInt(item.count);
    });

    return {
      totalFiles,
      totalDownloads: parseInt(totalDownloads.total) || 0,
      filesByClass: classStats,
    };
  }
}