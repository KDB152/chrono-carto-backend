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
exports.StudentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const student_entity_1 = require("./entities/student.entity");
let StudentsService = class StudentsService {
    async findByUserId(userId) {
        return this.studentsRepository.findOne({ where: { user_id: userId } });
    }
    constructor(studentsRepository) {
        this.studentsRepository = studentsRepository;
    }
    async createStudent(userId, phone) {
        let student = await this.studentsRepository.findOne({
            where: { user_id: userId },
        });
        if (student) {
            student.phone_number = phone ?? student.phone_number;
        }
        else {
            student = this.studentsRepository.create({
                user_id: userId,
                phone_number: phone,
            });
        }
        return this.studentsRepository.save(student);
    }
    async findAll({ page = 1, limit = 50 }) {
        const [items, total] = await this.studentsRepository.findAndCount({
            relations: ['user'],
            skip: (page - 1) * limit,
            take: limit,
            order: { id: 'DESC' },
        });
        console.log(`Found ${items.length} students with relations`);
        const transformedItems = items.map(student => {
            console.log(`Processing student ${student.id} with user:`, student.user);
            return {
                id: student.id,
                firstName: student.user?.firstName || '',
                lastName: student.user?.lastName || '',
                email: student.user?.email || '',
                phoneNumber: student.phone_number || '',
                classLevel: student.class_level || '',
                birthDate: student.birth_date ? student.birth_date.toISOString() : '',
                progressPercentage: student.progress_percentage || 0,
                averageScore: student.average_score || 0,
                role: student.user?.role || 'student',
                isActive: student.user?.is_active || false,
                isApproved: student.user?.is_approved || false,
                createdAt: student.user?.created_at ? new Date(student.user.created_at).toISOString() : new Date().toISOString(),
                notes: '',
            };
        });
        console.log(`Transformed ${transformedItems.length} students`);
        return { items: transformedItems, total, page, limit };
    }
    async findOne(id) {
        return this.studentsRepository.findOne({ where: { id } });
    }
    async create(dto) {
        const existingStudent = await this.studentsRepository.findOne({
            where: { user_id: dto.user_id },
        });
        if (existingStudent) {
            existingStudent.class_level = dto.class_level ?? existingStudent.class_level;
            existingStudent.birth_date = dto.birth_date ? new Date(dto.birth_date) : existingStudent.birth_date;
            existingStudent.phone_number = dto.phone_number ?? existingStudent.phone_number;
            existingStudent.address = dto.address ?? existingStudent.address;
            existingStudent.parent_id = dto.parent_id ?? existingStudent.parent_id;
            return this.studentsRepository.save(existingStudent);
        }
        const entity = this.studentsRepository.create({
            user_id: dto.user_id,
            class_level: dto.class_level,
            birth_date: dto.birth_date ? new Date(dto.birth_date) : undefined,
            phone_number: dto.phone_number,
            address: dto.address,
            parent_id: dto.parent_id,
        });
        return this.studentsRepository.save(entity);
    }
    async update(id, dto) {
        const payload = { ...dto };
        if (dto.birth_date)
            payload.birth_date = new Date(dto.birth_date);
        if (dto.last_activity)
            payload.last_activity = new Date(dto.last_activity);
        await this.studentsRepository.update(id, payload);
        return this.findOne(id);
    }
    async remove(id) {
        await this.studentsRepository.delete(id);
        return { success: true };
    }
};
exports.StudentsService = StudentsService;
exports.StudentsService = StudentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(student_entity_1.Student)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], StudentsService);
//# sourceMappingURL=students.service.js.map