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
const fs = require("fs");
let FilesService = class FilesService {
    constructor(fileRepository) {
        this.fileRepository = fileRepository;
    }
    async findAll({ page = 1, limit = 50, type, category }) {
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
    async findOne(id) {
        return this.fileRepository.findOne({ where: { id } });
    }
    async uploadFile(file, body) {
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
    async update(id, updateData) {
        await this.fileRepository.update(id, updateData);
        return this.findOne(id);
    }
    async remove(id) {
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
    async bulkDelete(ids) {
        const files = await this.fileRepository.findByIds(ids);
        for (const file of files) {
            if (fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
            }
        }
        return this.fileRepository.delete(ids);
    }
    async bulkMove(ids, category) {
        return this.fileRepository.update(ids, { category });
    }
    async searchFiles(query) {
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
        const categoryStats = await Promise.all(categories.map(async (category) => {
            const count = await this.fileRepository.count({ where: { category } });
            return { category, count };
        }));
        return {
            totalFiles,
            totalSize: parseInt(totalSize.totalSize) || 0,
            categories: categoryStats
        };
    }
    async downloadFile(id) {
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
    async shareFile(id, users) {
        return { success: true, sharedWith: users.length };
    }
};
exports.FilesService = FilesService;
exports.FilesService = FilesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(file_entity_1.File)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], FilesService);
//# sourceMappingURL=files.service.js.map