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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("../users/users.service");
const students_service_1 = require("../students/students.service");
const parents_service_1 = require("../parents/parents.service");
const user_entity_1 = require("../users/entities/user.entity");
let AdminService = class AdminService {
    constructor(usersService, studentsService, parentsService) {
        this.usersService = usersService;
        this.studentsService = studentsService;
        this.parentsService = parentsService;
    }
    async listStudents({ page = 1, limit = 50 }) {
        await this.createMissingProfiles();
        return this.studentsService.findAll({ page, limit });
    }
    async listParents({ page = 1, limit = 50 }) {
        await this.createMissingProfiles();
        return this.parentsService.findAll({ page, limit });
    }
    async createMissingProfiles() {
        console.log('Creating missing profiles for existing users...');
        const allUsers = await this.usersService.findAll();
        console.log(`Found ${allUsers.length} total users`);
        for (const user of allUsers) {
            try {
                if (user.role === user_entity_1.UserRole.STUDENT) {
                    const existingStudent = await this.studentsService.findByUserId(user.id);
                    if (!existingStudent) {
                        console.log(`Creating student profile for user ${user.id} (${user.email})`);
                        await this.studentsService.create({
                            user_id: user.id,
                            class_level: 'Non spécifié',
                            phone_number: user.phone || '',
                        });
                    }
                }
                else if (user.role === user_entity_1.UserRole.PARENT) {
                    const existingParent = await this.parentsService.findByUserId(user.id);
                    if (!existingParent) {
                        console.log(`Creating parent profile for user ${user.id} (${user.email})`);
                        await this.parentsService.create({
                            user_id: user.id,
                            phone_number: user.phone || '',
                            address: 'Non spécifié',
                            occupation: 'Non spécifié',
                        });
                    }
                }
            }
            catch (error) {
                console.log(`Error creating profile for user ${user.id}:`, error.message);
            }
        }
        console.log('Missing profiles creation completed!');
    }
    async createStudentWithUser(payload) {
        const existingUser = await this.usersService.findByEmail(payload.email);
        if (existingUser) {
            throw new Error(`Un utilisateur avec l'email ${payload.email} existe déjà`);
        }
        const user = await this.usersService.createUser({
            email: payload.email,
            password: payload.password || 'changeme',
            first_name: payload.firstName,
            last_name: payload.lastName,
            role: user_entity_1.UserRole.STUDENT,
            is_approved: true,
        });
        const student = await this.studentsService.create({
            user_id: user.id,
            class_level: payload.class || payload.level,
            phone_number: payload.phone,
            address: payload.address,
            parent_id: payload.parent_id,
        });
        await this.studentsService.update(student.id, {
            average_score: payload.averageScore ?? undefined,
            total_quiz_attempts: payload.completedCourses ?? undefined,
            progress_percentage: payload.totalCourses ? Math.min(100, Math.round((payload.completedCourses || 0) / payload.totalCourses * 100)) : undefined,
        });
        return { user, student };
    }
    async updateStudentWithUser(studentId, payload) {
        const student = await this.studentsService.findOne(studentId);
        if (!student)
            return null;
        if (payload.firstName || payload.lastName || payload.email || payload.phone !== undefined) {
            await this.usersService.update(student.user_id, {
                first_name: payload.firstName,
                last_name: payload.lastName,
                email: payload.email,
                phone: payload.phone,
            });
        }
        return this.studentsService.update(studentId, {
            class_level: payload.class || payload.level,
            phone_number: payload.phone,
            address: payload.address,
            average_score: payload.averageScore,
            total_quiz_attempts: payload.completedCourses,
            progress_percentage: payload.totalCourses ? Math.min(100, Math.round((payload.completedCourses || 0) / payload.totalCourses * 100)) : undefined,
            parent_id: payload.parent_id,
        });
    }
    async deleteStudent(studentId) {
        const student = await this.studentsService.findOne(studentId);
        if (!student) {
            throw new Error('Étudiant non trouvé');
        }
        await this.studentsService.remove(studentId);
        await this.usersService.remove(student.user_id);
        return { success: true };
    }
    async createParentWithUser(payload) {
        const existingUser = await this.usersService.findByEmail(payload.email);
        if (existingUser) {
            throw new Error(`Un utilisateur avec l'email ${payload.email} existe déjà`);
        }
        const user = await this.usersService.createUser({
            email: payload.email,
            password: payload.password || 'changeme',
            first_name: payload.firstName,
            last_name: payload.lastName,
            role: user_entity_1.UserRole.PARENT,
            is_approved: true,
        });
        const parent = await this.parentsService.create({
            user_id: user.id,
            phone_number: payload.phone,
            address: payload.address,
            occupation: payload.occupation,
        });
        if (payload.studentIds && Array.isArray(payload.studentIds)) {
            for (const sid of payload.studentIds) {
                const studentId = parseInt(sid);
                if (!isNaN(studentId)) {
                    await this.studentsService.update(studentId, { parent_id: parent.id });
                }
            }
        }
        return { user, parent };
    }
    async updateParentWithUser(parentId, payload) {
        const parent = await this.parentsService.findOne(parentId);
        if (!parent)
            return null;
        if (payload.firstName || payload.lastName || payload.email || payload.phone !== undefined) {
            await this.usersService.update(parent.user_id, {
                first_name: payload.firstName,
                last_name: payload.lastName,
                email: payload.email,
                phone: payload.phone,
            });
        }
        const updated = await this.parentsService.update(parentId, {
            phone_number: payload.phone,
            address: payload.address,
            occupation: payload.occupation,
        });
        if (payload.studentIds && Array.isArray(payload.studentIds)) {
            for (const sid of payload.studentIds) {
                const studentId = parseInt(sid);
                if (!isNaN(studentId)) {
                    await this.studentsService.update(studentId, { parent_id: parent.id });
                }
            }
        }
        return updated;
    }
    async deleteParent(parentId) {
        const parent = await this.parentsService.findOne(parentId);
        if (!parent) {
            throw new Error('Parent non trouvé');
        }
        await this.parentsService.remove(parentId);
        await this.usersService.remove(parent.user_id);
        return { success: true };
    }
    async setUserApproval(studentOrParentId, approve) {
        const student = await this.studentsService.findOne(studentOrParentId);
        if (student) {
            return this.usersService.update(student.user_id, { is_approved: approve, is_active: approve });
        }
        const parent = await this.parentsService.findOne(studentOrParentId);
        if (parent) {
            return this.usersService.update(parent.user_id, { is_approved: approve, is_active: approve });
        }
        throw new Error('Utilisateur non trouvé');
    }
    async cleanTestUsers() {
        console.log('Cleaning test users from database...');
        const testEmails = [
            'lucas.dubois@student.fr',
            'emma.martin@student.fr',
            'thomas.bernard@student.fr',
            'sophie.leroy@student.fr',
            'marie.dubois@parent.fr',
            'jean.martin@parent.fr',
            'pierre.bernard@parent.fr'
        ];
        let deletedCount = 0;
        for (const email of testEmails) {
            try {
                const user = await this.usersService.findByEmail(email);
                if (user) {
                    console.log(`Deleting test user: ${email}`);
                    if (user.role === user_entity_1.UserRole.STUDENT) {
                        const student = await this.studentsService.findByUserId(user.id);
                        if (student) {
                            await this.studentsService.remove(student.id);
                        }
                    }
                    else if (user.role === user_entity_1.UserRole.PARENT) {
                        const parent = await this.parentsService.findByUserId(user.id);
                        if (parent) {
                            await this.parentsService.remove(parent.id);
                        }
                    }
                    await this.usersService.remove(user.id);
                    deletedCount++;
                }
            }
            catch (error) {
                console.log(`Error deleting test user ${email}:`, error.message);
            }
        }
        console.log(`Cleaned ${deletedCount} test users from database.`);
        return { deletedCount };
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        students_service_1.StudentsService,
        parents_service_1.ParentsService])
], AdminService);
//# sourceMappingURL=admin.service.js.map