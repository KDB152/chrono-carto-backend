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
exports.RelationsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const parent_student_entity_1 = require("./entities/parent-student.entity");
let RelationsService = class RelationsService {
    constructor(parentStudentRepository) {
        this.parentStudentRepository = parentStudentRepository;
    }
    async createParentStudentRelation(parentId, studentId) {
        const existingRelation = await this.parentStudentRepository.findOne({
            where: { parent_id: parentId, student_id: studentId },
        });
        if (existingRelation) {
            return existingRelation;
        }
        const relation = this.parentStudentRepository.create({
            parent_id: parentId,
            student_id: studentId,
        });
        return this.parentStudentRepository.save(relation);
    }
    async getStudentsByParentId(parentId) {
        return this.parentStudentRepository.find({
            where: { parent_id: parentId },
            relations: ['student', 'student.user'],
        });
    }
    async getParentsByStudentId(studentId) {
        return this.parentStudentRepository.find({
            where: { student_id: studentId },
            relations: ['parent', 'parent.user'],
        });
    }
    async deleteParentStudentRelation(parentId, studentId) {
        await this.parentStudentRepository.delete({
            parent_id: parentId,
            student_id: studentId,
        });
    }
};
exports.RelationsService = RelationsService;
exports.RelationsService = RelationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(parent_student_entity_1.ParentStudent)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], RelationsService);
//# sourceMappingURL=relations.service.js.map