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
    // Normaliser targetClass pour s'assurer que c'est un array
    const normalizedTargetClasses = Array.isArray(createFileDto.targetClass) 
      ? createFileDto.targetClass 
      : [createFileDto.targetClass];

    const file = this.filesRepository.create({
      ...createFileDto,
      targetClass: JSON.stringify(normalizedTargetClasses[0]), // Première classe comme JSON string
      targetClasses: normalizedTargetClasses, // Toutes les classes comme array JSON
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
    // Récupérer tous les fichiers actifs et filtrer côté application
    const allFiles = await this.filesRepository.find({
      where: { isActive: true },
      relations: ['uploader'],
      order: { createdAt: 'DESC' },
    });

    // Filtrer les fichiers qui contiennent la classe cible
    return allFiles.filter(file => {
      // Nouveau format avec targetClasses (array JSON)
      if (file.targetClasses) {
        try {
          let targetClasses = file.targetClasses;
          
          // Si c'est une chaîne JSON, la parser
          if (typeof targetClasses === 'string') {
            targetClasses = JSON.parse(targetClasses);
          }
          
          // Si c'est un tableau de tableaux, prendre le premier tableau
          if (Array.isArray(targetClasses) && targetClasses.length > 0 && Array.isArray(targetClasses[0])) {
            targetClasses = targetClasses[0];
          }
          
          // Si c'est un tableau de chaînes JSON, les parser
          if (Array.isArray(targetClasses) && targetClasses.length > 0 && typeof targetClasses[0] === 'string' && targetClasses[0].startsWith('[')) {
            const innerParsed = JSON.parse(targetClasses[0]);
            if (Array.isArray(innerParsed)) {
              targetClasses = innerParsed;
            }
          }
          
          if (Array.isArray(targetClasses)) {
            return targetClasses.includes(targetClass);
          }
        } catch (error) {
          console.warn(`Erreur parsing targetClasses pour fichier ${file.id}:`, error);
        }
      }
      
      // Rétrocompatibilité avec l'ancien format targetClass (string)
      if (file.targetClass) {
        try {
          // Si c'est une chaîne JSON, la parser
          const parsed = JSON.parse(file.targetClass);
          if (Array.isArray(parsed)) {
            return parsed.includes(targetClass);
          }
        } catch (e) {
          // Si ce n'est pas du JSON, comparaison directe
          return file.targetClass === targetClass;
        }
        return file.targetClass === targetClass;
      }
      
      return false;
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
    
    // Gérer les classes cibles de manière spéciale
    if (updateFileDto.targetClasses && Array.isArray(updateFileDto.targetClasses)) {
      // Normaliser les classes cibles
      const normalizedTargetClasses = updateFileDto.targetClasses.filter(cls => typeof cls === 'string');
      
      // Mettre à jour les deux colonnes pour la rétrocompatibilité
      file.targetClass = JSON.stringify(normalizedTargetClasses[0] || '');
      file.targetClasses = normalizedTargetClasses;
      
      // Supprimer ces propriétés du DTO pour éviter la duplication
      delete updateFileDto.targetClass;
      delete updateFileDto.targetClasses;
    } else if (updateFileDto.targetClass) {
      // Si seulement targetClass est fourni, l'utiliser
      file.targetClass = JSON.stringify(updateFileDto.targetClass);
      file.targetClasses = [updateFileDto.targetClass];
      delete updateFileDto.targetClass;
    }
    
    // Appliquer les autres modifications
    Object.assign(file, updateFileDto);
    
    console.log(`📝 Mise à jour du fichier ID ${id}:`, {
      title: file.title,
      targetClass: file.targetClass,
      targetClasses: file.targetClasses
    });
    
    return this.filesRepository.save(file);
  }

  async remove(id: number): Promise<void> {
    const file = await this.findOne(id);
    
    // Supprimer le fichier physique du serveur
    try {
      if (file.filePath && require('fs').existsSync(file.filePath)) {
        require('fs').unlinkSync(file.filePath);
        console.log(`🗑️ Fichier physique supprimé: ${file.filePath}`);
      }
    } catch (error) {
      console.warn(`⚠️ Impossible de supprimer le fichier physique: ${error.message}`);
    }
    
    // Supprimer l'enregistrement de la base de données
    await this.filesRepository.remove(file);
    console.log(`🗑️ Fichier supprimé de la base de données: ID ${id}`);
  }

  async incrementDownloadCount(id: number): Promise<void> {
    await this.filesRepository.increment({ id }, 'downloadCount', 1);
  }

  async getFilesByUserClass(userClass: string): Promise<File[]> {
    // Récupérer tous les fichiers actifs et filtrer côté application
    const allFiles = await this.filesRepository.find({
      where: { isActive: true },
      relations: ['uploader'],
      order: { createdAt: 'DESC' },
    });

    // Filtrer les fichiers qui contiennent la classe de l'utilisateur
    return allFiles.filter(file => {
      // Nouveau format avec targetClasses (array JSON)
      if (file.targetClasses) {
        try {
          let targetClasses = file.targetClasses;
          
          // Si c'est une chaîne JSON, la parser
          if (typeof targetClasses === 'string') {
            targetClasses = JSON.parse(targetClasses);
          }
          
          // Si c'est un tableau de tableaux, prendre le premier tableau
          if (Array.isArray(targetClasses) && targetClasses.length > 0 && Array.isArray(targetClasses[0])) {
            targetClasses = targetClasses[0];
          }
          
          // Si c'est un tableau de chaînes JSON, les parser
          if (Array.isArray(targetClasses) && targetClasses.length > 0 && typeof targetClasses[0] === 'string' && targetClasses[0].startsWith('[')) {
            const innerParsed = JSON.parse(targetClasses[0]);
            if (Array.isArray(innerParsed)) {
              targetClasses = innerParsed;
            }
          }
          
          if (Array.isArray(targetClasses)) {
            return targetClasses.includes(userClass);
          }
        } catch (error) {
          console.warn(`Erreur parsing targetClasses pour fichier ${file.id}:`, error);
        }
      }
      
      // Rétrocompatibilité avec l'ancien format targetClass (string)
      if (file.targetClass) {
        try {
          // Si c'est une chaîne JSON, la parser
          const parsed = JSON.parse(file.targetClass);
          if (Array.isArray(parsed)) {
            return parsed.includes(userClass);
          }
        } catch (e) {
          // Si ce n'est pas du JSON, comparaison directe
          return file.targetClass === userClass;
        }
        return file.targetClass === userClass;
      }
      
      return false;
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