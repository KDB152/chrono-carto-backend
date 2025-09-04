import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Res,
  Query,
  BadRequestException,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { FilesService } from './files.service';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UserRole } from '../users/entities/user.entity';
import { File } from './entities/file.entity';
import * as path from 'path';
import * as fs from 'fs';

@Controller('files')
@UseGuards(JwtAuthGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post()
  async create(@Body() createFileDto: CreateFileDto, @Request() req) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new BadRequestException('Seuls les administrateurs peuvent uploader des fichiers');
    }

    return this.filesService.create(createFileDto, req.user.id);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('title') title: string,
    @Body('description') description: string,
    @Body('targetClass') targetClass: string,
    @Request() req
  ) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new BadRequestException('Seuls les administrateurs peuvent uploader des fichiers');
    }

    if (!file) {
      throw new BadRequestException('Aucun fichier fourni');
    }

    if (!title) {
      throw new BadRequestException('Le titre est requis');
    }

    if (!targetClass) {
      throw new BadRequestException('La classe cible est requise');
    }

    // Créer le dossier uploads s'il n'existe pas
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Générer un nom de fichier unique pour éviter les conflits
    const fileExtension = path.extname(file.originalname);
    const fileName = path.basename(file.originalname, fileExtension);
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const storedName = `file-${timestamp}-${randomSuffix}-${fileName}${fileExtension}`;
    const filePath = path.join('uploads', storedName);

    // Sauvegarder le fichier
    const fullPath = path.join(process.cwd(), filePath);
    fs.writeFileSync(fullPath, file.buffer);

    console.log('✅ Fichier sauvegardé:', fullPath);

    // Créer l'entrée dans la base de données
    const createFileDto: CreateFileDto = {
      title,
      description: description || '',
      fileName: file.originalname,
      storedName,
      filePath,
      fileType: file.mimetype,
      fileSize: file.size,
      targetClass,
      isPublic: true
    };

    const createdFile = await this.filesService.create(createFileDto, req.user.id);

    return {
      success: true,
      file: createdFile,
      filePath
    };
  }

  @Get()
  async findAll(@Request() req, @Query('class') targetClass?: string) {
    if (req.user.role === UserRole.ADMIN) {
      // Les admins voient tous les fichiers
      return targetClass 
        ? this.filesService.findByClass(targetClass)
        : this.filesService.findAll();
    } else if (req.user.role === UserRole.STUDENT) {
      // Les étudiants voient seulement les fichiers de leur classe
      if (!targetClass) {
        throw new BadRequestException('La classe est requise pour les étudiants');
      }
      return this.filesService.getFilesByUserClass(targetClass);
    }
    
    throw new BadRequestException('Rôle non autorisé');
  }

  @Get('stats')
  async getStats(@Request() req) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new BadRequestException('Seuls les administrateurs peuvent voir les statistiques');
    }

    return this.filesService.getFileStats();
  }

  @Get('classes')
  async getAvailableClasses() {
    return this.filesService.getAvailableClasses();
  }


  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    const file = await this.filesService.findOne(+id);
    
    // Vérifier que l'utilisateur a accès au fichier
    if (req.user.role === UserRole.STUDENT) {
      // Pour les étudiants, vérifier qu'ils appartiennent à la classe cible
      // Cette vérification devrait être faite avec les données de l'étudiant
      // Pour l'instant, on autorise l'accès
    }

    return file;
  }

  @Get(':id/download')
  async download(@Param('id') id: string, @Res() res: Response, @Request() req) {
    const file = await this.filesService.findOne(+id);
    
    if (!file) {
      throw new BadRequestException('Fichier non trouvé');
    }
    
    // Vérifier que l'utilisateur a accès au fichier
    if (req.user.role === UserRole.STUDENT) {
      // Pour les étudiants, vérifier qu'ils appartiennent à la classe cible
      // Cette vérification devrait être faite avec les données de l'étudiant
      // Pour l'instant, on autorise l'accès
    }

    // Construire le chemin du fichier
    let filePath: string;
    
    // Normaliser les séparateurs de chemins (Windows \ vers Unix /)
    const normalizedFilePath = file.filePath.replace(/\\/g, '/');
    
    // Si filePath contient déjà "uploads/", l'utiliser directement
    if (normalizedFilePath.startsWith('uploads/')) {
      filePath = path.join(process.cwd(), normalizedFilePath);
    } else {
      filePath = path.join(process.cwd(), 'uploads', normalizedFilePath);
    }
    
    console.log('🔍 Recherche du fichier:', filePath);
    
    if (!fs.existsSync(filePath)) {
      console.log('❌ Fichier non trouvé:', filePath);
      throw new BadRequestException('Fichier non trouvé sur le serveur. Veuillez contacter l\'administrateur.');
    }

    // Incrémenter le compteur de téléchargements
    await this.filesService.incrementDownloadCount(+id);

    // Définir les headers pour le téléchargement
    res.setHeader('Content-Type', file.fileType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${file.fileName}"`);
    
    // Obtenir la taille réelle du fichier et vérifier l'intégrité
    const stats = fs.statSync(filePath);
    
    // Vérifier que la taille correspond à celle en base de données
    if (stats.size !== file.fileSize) {
      console.log(`⚠️ Incohérence de taille détectée pour le fichier ${file.id}:`);
      console.log(`   Base de données: ${file.fileSize} bytes`);
      console.log(`   Fichier physique: ${stats.size} bytes`);
      
      // Mettre à jour la taille en base de données
      await this.filesService.update(+id, { fileSize: stats.size });
      console.log(`✅ Taille mise à jour en base de données`);
    }
    
    res.setHeader('Content-Length', stats.size);

    // Envoyer le fichier
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateFileDto: UpdateFileDto, @Request() req) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new BadRequestException('Seuls les administrateurs peuvent modifier les fichiers');
    }

    return this.filesService.update(+id, updateFileDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new BadRequestException('Seuls les administrateurs peuvent supprimer les fichiers');
    }

    await this.filesService.remove(+id);
    return { message: 'Fichier supprimé avec succès' };
  }
}