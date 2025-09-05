"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const file_entity_1 = require("./entities/file.entity");
let FilesService = class FilesService {
    constructor(filesRepository) {
        this.filesRepository = filesRepository;
    }
    async create(createFileDto, uploadedBy) {
        const normalizedTargetClasses = Array.isArray(createFileDto.targetClass)
            ? createFileDto.targetClass
            : [createFileDto.targetClass];
        const file = this.filesRepository.create({
            ...createFileDto,
            targetClass: JSON.stringify(normalizedTargetClasses[0]),
            targetClasses: normalizedTargetClasses,
            uploadedBy,
        });
        return this.filesRepository.save(file);
    }
    async findAll() {
        return this.filesRepository.find({
            where: { isActive: true },
            relations: ['uploader'],
            order: { createdAt: 'DESC' },
        });
    }
    async findByClass(targetClass) {
        const allFiles = await this.filesRepository.find({
            where: { isActive: true },
            relations: ['uploader'],
            order: { createdAt: 'DESC' },
        });
        return allFiles.filter(file => {
            if (file.targetClasses) {
                try {
                    let targetClasses = file.targetClasses;
                    if (typeof targetClasses === 'string') {
                        targetClasses = JSON.parse(targetClasses);
                    }
                    if (Array.isArray(targetClasses) && targetClasses.length > 0 && Array.isArray(targetClasses[0])) {
                        targetClasses = targetClasses[0];
                    }
                    if (Array.isArray(targetClasses) && targetClasses.length > 0 && typeof targetClasses[0] === 'string' && targetClasses[0].startsWith('[')) {
                        const innerParsed = JSON.parse(targetClasses[0]);
                        if (Array.isArray(innerParsed)) {
                            targetClasses = innerParsed;
                        }
                    }
                    if (Array.isArray(targetClasses)) {
                        return targetClasses.includes(targetClass);
                    }
                }
                catch (error) {
                    console.warn(`Erreur parsing targetClasses pour fichier ${file.id}:`, error);
                }
            }
            if (file.targetClass) {
                try {
                    const parsed = JSON.parse(file.targetClass);
                    if (Array.isArray(parsed)) {
                        return parsed.includes(targetClass);
                    }
                }
                catch (e) {
                    return file.targetClass === targetClass;
                }
                return file.targetClass === targetClass;
            }
            return false;
        });
    }
    async findOne(id) {
        const file = await this.filesRepository.findOne({
            where: { id, isActive: true },
            relations: ['uploader'],
        });
        if (!file) {
            throw new common_1.NotFoundException(`Fichier avec l'ID ${id} non trouvé`);
        }
        return file;
    }
    async update(id, updateFileDto) {
        const file = await this.findOne(id);
        if (updateFileDto.targetClasses && Array.isArray(updateFileDto.targetClasses)) {
            const normalizedTargetClasses = updateFileDto.targetClasses.filter(cls => typeof cls === 'string');
            file.targetClass = JSON.stringify(normalizedTargetClasses[0] || '');
            file.targetClasses = normalizedTargetClasses;
            delete updateFileDto.targetClass;
            delete updateFileDto.targetClasses;
        }
        else if (updateFileDto.targetClass) {
            file.targetClass = JSON.stringify(updateFileDto.targetClass);
            file.targetClasses = [updateFileDto.targetClass];
            delete updateFileDto.targetClass;
        }
        Object.assign(file, updateFileDto);
        console.log(`📝 Mise à jour du fichier ID ${id}:`, {
            title: file.title,
            targetClass: file.targetClass,
            targetClasses: file.targetClasses
        });
        return this.filesRepository.save(file);
    }
    async remove(id) {
        const file = await this.findOne(id);
        try {
            if (file.filePath && require('fs').existsSync(file.filePath)) {
                require('fs').unlinkSync(file.filePath);
                console.log(`🗑️ Fichier physique supprimé: ${file.filePath}`);
            }
        }
        catch (error) {
            console.warn(`⚠️ Impossible de supprimer le fichier physique: ${error.message}`);
        }
        await this.filesRepository.remove(file);
        console.log(`🗑️ Fichier supprimé de la base de données: ID ${id}`);
    }
    async incrementDownloadCount(id) {
        await this.filesRepository.increment({ id }, 'downloadCount', 1);
    }
    async getFilesByUserClass(userClass) {
        const allFiles = await this.filesRepository.find({
            where: { isActive: true },
            relations: ['uploader'],
            order: { createdAt: 'DESC' },
        });
        return allFiles.filter(file => {
            if (file.targetClasses) {
                try {
                    let targetClasses = file.targetClasses;
                    if (typeof targetClasses === 'string') {
                        targetClasses = JSON.parse(targetClasses);
                    }
                    if (Array.isArray(targetClasses) && targetClasses.length > 0 && Array.isArray(targetClasses[0])) {
                        targetClasses = targetClasses[0];
                    }
                    if (Array.isArray(targetClasses) && targetClasses.length > 0 && typeof targetClasses[0] === 'string' && targetClasses[0].startsWith('[')) {
                        const innerParsed = JSON.parse(targetClasses[0]);
                        if (Array.isArray(innerParsed)) {
                            targetClasses = innerParsed;
                        }
                    }
                    if (Array.isArray(targetClasses)) {
                        return targetClasses.includes(userClass);
                    }
                }
                catch (error) {
                    console.warn(`Erreur parsing targetClasses pour fichier ${file.id}:`, error);
                }
            }
            if (file.targetClass) {
                try {
                    const parsed = JSON.parse(file.targetClass);
                    if (Array.isArray(parsed)) {
                        return parsed.includes(userClass);
                    }
                }
                catch (e) {
                    return file.targetClass === userClass;
                }
                return file.targetClass === userClass;
            }
            return false;
        });
    }
    async getAvailableClasses() {
        const result = await this.filesRepository
            .createQueryBuilder('file')
            .select('DISTINCT file.targetClass', 'targetClass')
            .where('file.isActive = :isActive', { isActive: true })
            .getRawMany();
        return result.map(row => row.targetClass);
    }
    async getFileStats() {
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
};
exports.FilesService = FilesService;
exports.FilesService = FilesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(file_entity_1.File)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], FilesService);
//# sourceMappingURL=files.service.js.map