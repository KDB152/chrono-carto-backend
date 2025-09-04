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
exports.FilesController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const files_service_1 = require("./files.service");
const create_file_dto_1 = require("./dto/create-file.dto");
const update_file_dto_1 = require("./dto/update-file.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const user_entity_1 = require("../users/entities/user.entity");
const path = require("path");
const fs = require("fs");
let FilesController = class FilesController {
    constructor(filesService) {
        this.filesService = filesService;
    }
    async create(createFileDto, req) {
        if (req.user.role !== user_entity_1.UserRole.ADMIN) {
            throw new common_1.BadRequestException('Seuls les administrateurs peuvent uploader des fichiers');
        }
        return this.filesService.create(createFileDto, req.user.id);
    }
    async uploadFile(file, title, description, targetClass, req) {
        if (req.user.role !== user_entity_1.UserRole.ADMIN) {
            throw new common_1.BadRequestException('Seuls les administrateurs peuvent uploader des fichiers');
        }
        if (!file) {
            throw new common_1.BadRequestException('Aucun fichier fourni');
        }
        if (!title) {
            throw new common_1.BadRequestException('Le titre est requis');
        }
        if (!targetClass) {
            throw new common_1.BadRequestException('La classe cible est requise');
        }
        const uploadsDir = path.join(process.cwd(), 'uploads');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }
        const fileExtension = path.extname(file.originalname);
        const fileName = path.basename(file.originalname, fileExtension);
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        const storedName = `file-${timestamp}-${randomSuffix}-${fileName}${fileExtension}`;
        const filePath = path.join('uploads', storedName);
        const fullPath = path.join(process.cwd(), filePath);
        fs.writeFileSync(fullPath, file.buffer);
        console.log('✅ Fichier sauvegardé:', fullPath);
        const createFileDto = {
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
    async findAll(req, targetClass) {
        if (req.user.role === user_entity_1.UserRole.ADMIN) {
            return targetClass
                ? this.filesService.findByClass(targetClass)
                : this.filesService.findAll();
        }
        else if (req.user.role === user_entity_1.UserRole.STUDENT) {
            if (!targetClass) {
                throw new common_1.BadRequestException('La classe est requise pour les étudiants');
            }
            return this.filesService.getFilesByUserClass(targetClass);
        }
        throw new common_1.BadRequestException('Rôle non autorisé');
    }
    async getStats(req) {
        if (req.user.role !== user_entity_1.UserRole.ADMIN) {
            throw new common_1.BadRequestException('Seuls les administrateurs peuvent voir les statistiques');
        }
        return this.filesService.getFileStats();
    }
    async getAvailableClasses() {
        return this.filesService.getAvailableClasses();
    }
    async findOne(id, req) {
        const file = await this.filesService.findOne(+id);
        if (req.user.role === user_entity_1.UserRole.STUDENT) {
        }
        return file;
    }
    async download(id, res, req) {
        const file = await this.filesService.findOne(+id);
        if (!file) {
            throw new common_1.BadRequestException('Fichier non trouvé');
        }
        if (req.user.role === user_entity_1.UserRole.STUDENT) {
        }
        let filePath;
        const normalizedFilePath = file.filePath.replace(/\\/g, '/');
        if (normalizedFilePath.startsWith('uploads/')) {
            filePath = path.join(process.cwd(), normalizedFilePath);
        }
        else {
            filePath = path.join(process.cwd(), 'uploads', normalizedFilePath);
        }
        console.log('🔍 Recherche du fichier:', filePath);
        if (!fs.existsSync(filePath)) {
            console.log('❌ Fichier non trouvé:', filePath);
            throw new common_1.BadRequestException('Fichier non trouvé sur le serveur. Veuillez contacter l\'administrateur.');
        }
        await this.filesService.incrementDownloadCount(+id);
        res.setHeader('Content-Type', file.fileType || 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="${file.fileName}"`);
        const stats = fs.statSync(filePath);
        if (stats.size !== file.fileSize) {
            console.log(`⚠️ Incohérence de taille détectée pour le fichier ${file.id}:`);
            console.log(`   Base de données: ${file.fileSize} bytes`);
            console.log(`   Fichier physique: ${stats.size} bytes`);
            await this.filesService.update(+id, { fileSize: stats.size });
            console.log(`✅ Taille mise à jour en base de données`);
        }
        res.setHeader('Content-Length', stats.size);
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
    }
    async update(id, updateFileDto, req) {
        if (req.user.role !== user_entity_1.UserRole.ADMIN) {
            throw new common_1.BadRequestException('Seuls les administrateurs peuvent modifier les fichiers');
        }
        return this.filesService.update(+id, updateFileDto);
    }
    async remove(id, req) {
        if (req.user.role !== user_entity_1.UserRole.ADMIN) {
            throw new common_1.BadRequestException('Seuls les administrateurs peuvent supprimer les fichiers');
        }
        await this.filesService.remove(+id);
        return { message: 'Fichier supprimé avec succès' };
    }
};
exports.FilesController = FilesController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_file_dto_1.CreateFileDto, Object]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)('title')),
    __param(2, (0, common_1.Body)('description')),
    __param(3, (0, common_1.Body)('targetClass')),
    __param(4, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, Object]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "uploadFile", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('class')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('stats'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('classes'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "getAvailableClasses", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/download'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "download", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_file_dto_1.UpdateFileDto, Object]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "remove", null);
exports.FilesController = FilesController = __decorate([
    (0, common_1.Controller)('files'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [files_service_1.FilesService])
], FilesController);
//# sourceMappingURL=files.controller.js.map