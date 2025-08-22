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
exports.ParentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const parent_entity_1 = require("./entities/parent.entity");
let ParentsService = class ParentsService {
    async findByUserId(userId) {
        return this.parentsRepository.findOne({ where: { user_id: userId } });
    }
    constructor(parentsRepository) {
        this.parentsRepository = parentsRepository;
    }
    async createParent(userId, phone) {
        const parent = this.parentsRepository.create({
            user_id: userId,
            phone_number: phone,
        });
        return this.parentsRepository.save(parent);
    }
    async findAll({ page = 1, limit = 50 }) {
        const [items, total] = await this.parentsRepository.findAndCount({
            relations: ['user'],
            skip: (page - 1) * limit,
            take: limit,
            order: { id: 'DESC' },
        });
        console.log(`Found ${items.length} parents with relations`);
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
    async findOne(id) {
        return this.parentsRepository.findOne({ where: { id } });
    }
    async create(dto) {
        const existingParent = await this.parentsRepository.findOne({
            where: { user_id: dto.user_id },
        });
        if (existingParent) {
            existingParent.phone_number = dto.phone_number ?? existingParent.phone_number;
            existingParent.address = dto.address ?? existingParent.address;
            existingParent.occupation = dto.occupation ?? existingParent.occupation;
            return this.parentsRepository.save(existingParent);
        }
        const entity = this.parentsRepository.create({
            user_id: dto.user_id,
            phone_number: dto.phone_number,
            address: dto.address,
            occupation: dto.occupation,
        });
        return this.parentsRepository.save(entity);
    }
    async update(id, dto) {
        await this.parentsRepository.update(id, dto);
        return this.findOne(id);
    }
    async remove(id) {
        await this.parentsRepository.delete(id);
        return { success: true };
    }
};
exports.ParentsService = ParentsService;
exports.ParentsService = ParentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(parent_entity_1.Parent)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ParentsService);
//# sourceMappingURL=parents.service.js.map