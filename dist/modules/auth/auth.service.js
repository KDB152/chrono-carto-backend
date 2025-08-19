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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const users_service_1 = require("../users/users.service");
const students_service_1 = require("../students/students.service");
const parents_service_1 = require("../parents/parents.service");
const user_entity_1 = require("../users/entities/user.entity");
const email_verification_service_1 = require("./email-verification.service");
const bcrypt = require("bcrypt");
const jwt_1 = require("@nestjs/jwt");
let AuthService = class AuthService {
    constructor(usersService, studentsService, parentsService, emailVerificationService, userRepository, jwtService) {
        this.usersService = usersService;
        this.studentsService = studentsService;
        this.parentsService = parentsService;
        this.emailVerificationService = emailVerificationService;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }
    async register(registerDto) {
        const { firstName, lastName, email, password, phone, userType } = registerDto;
        let role;
        switch (userType) {
            case 'student':
                role = user_entity_1.UserRole.STUDENT;
                break;
            case 'parent':
                role = user_entity_1.UserRole.PARENT;
                break;
            case 'teacher':
                role = user_entity_1.UserRole.TEACHER;
                break;
            case 'admin':
                role = user_entity_1.UserRole.ADMIN;
                break;
            default:
                role = user_entity_1.UserRole.STUDENT;
        }
        const user = await this.usersService.createUser({
            email,
            password,
            first_name: firstName,
            last_name: lastName,
            role,
        });
        if (role === user_entity_1.UserRole.STUDENT) {
            await this.studentsService.createStudent(user.id, phone);
        }
        else if (role === user_entity_1.UserRole.PARENT) {
            await this.parentsService.createParent(user.id, phone);
        }
        try {
            await this.emailVerificationService.sendVerificationLink(email);
        }
        catch (error) {
            console.error('Erreur lors de l\'envoi du lien de vérification:', error);
        }
        return {
            message: 'Inscription réussie. Un lien de vérification a été envoyé à votre adresse email.',
            userId: user.id
        };
    }
    async login(loginDto) {
        const { email, password } = loginDto;
        const user = await this.userRepository.findOne({
            where: { email },
            relations: ['student', 'parent']
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Email ou mot de passe incorrect');
        }
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Email ou mot de passe incorrect');
        }
        if (!user.email_verified) {
            throw new common_1.UnauthorizedException('Veuillez vérifier votre email avant de vous connecter');
        }
        let profileData = null;
        switch (user.role) {
            case user_entity_1.UserRole.STUDENT:
                if (user.student) {
                    profileData = {
                        studentId: user.student.id,
                        phone: user.student.phone,
                        classLevel: user.student.class_level,
                        enrollmentDate: user.student.enrollment_date,
                        currentCourses: await this.getStudentCourses(user.student.id),
                        grades: await this.getStudentGrades(user.student.id),
                        attendance: await this.getStudentAttendance(user.student.id)
                    };
                }
                break;
            case user_entity_1.UserRole.PARENT:
                if (user.parent) {
                    profileData = {
                        parentId: user.parent.id,
                        phone: user.parent.phone,
                        children: await this.getParentChildren(user.parent.id),
                        notifications: await this.getParentNotifications(user.parent.id)
                    };
                }
                break;
            case user_entity_1.UserRole.ADMIN:
                profileData = {
                    adminLevel: 'super_admin',
                    permissions: ['all'],
                    systemStats: await this.getAdminStats(),
                    lastLogin: user.last_login
                };
                break;
            case user_entity_1.UserRole.TEACHER:
                profileData = {
                    teacherId: user.id,
                    subjects: await this.getTeacherSubjects(user.id),
                    classes: await this.getTeacherClasses(user.id)
                };
                break;
        }
        user.last_login = new Date();
        await this.userRepository.save(user);
        const payload = { email: user.email, sub: user.id, role: user.role };
        const accessToken = this.jwtService.sign(payload);
        return {
            accessToken,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                firstName: user.first_name,
                lastName: user.last_name,
                profileData
            },
        };
    }
    async getStudentCourses(studentId) {
        return [
            { id: 1, title: 'Histoire de France', progress: 75, nextLesson: 'La Révolution' },
            { id: 2, title: 'Géographie Europe', progress: 60, nextLesson: 'Les climats' },
            { id: 3, title: 'EMC - Citoyenneté', progress: 85, nextLesson: 'La démocratie' }
        ];
    }
    async getStudentGrades(studentId) {
        return [
            { subject: 'Histoire', grade: 16, date: '2025-01-10', quiz: 'La Révolution française' },
            { subject: 'Géographie', grade: 14, date: '2025-01-08', quiz: 'Les climats européens' },
            { subject: 'EMC', grade: 18, date: '2025-01-05', quiz: 'La Constitution' }
        ];
    }
    async getStudentAttendance(studentId) {
        return {
            totalDays: 120,
            presentDays: 115,
            absences: 5,
            attendanceRate: 95.8
        };
    }
    async getParentChildren(parentId) {
        return [
            {
                id: 1,
                firstName: 'Lucas',
                lastName: 'Dupont',
                class: 'Terminale S',
                averageGrade: 15.2,
                lastActivity: '2025-01-15T14:30:00Z'
            },
            {
                id: 2,
                firstName: 'Emma',
                lastName: 'Dupont',
                class: 'Première ES',
                averageGrade: 16.8,
                lastActivity: '2025-01-15T16:45:00Z'
            }
        ];
    }
    async getParentNotifications(parentId) {
        return [
            { type: 'grade', message: 'Nouvelle note en Histoire pour Lucas', date: '2025-01-15' },
            { type: 'absence', message: 'Emma absente aujourd\'hui', date: '2025-01-14' }
        ];
    }
    async getAdminStats() {
        const totalUsers = await this.userRepository.count();
        const totalStudents = await this.userRepository.count({ where: { role: user_entity_1.UserRole.STUDENT } });
        const totalParents = await this.userRepository.count({ where: { role: user_entity_1.UserRole.PARENT } });
        const totalTeachers = await this.userRepository.count({ where: { role: user_entity_1.UserRole.TEACHER } });
        return {
            totalUsers,
            totalStudents,
            totalParents,
            totalTeachers,
            newUsersThisWeek: await this.getNewUsersThisWeek(),
            systemUptime: 99.8,
            activeUsers: await this.getActiveUsersCount()
        };
    }
    async getTeacherSubjects(teacherId) {
        return ['Histoire', 'Géographie', 'EMC'];
    }
    async getTeacherClasses(teacherId) {
        return [
            { name: 'Terminale S1', students: 28 },
            { name: 'Terminale ES2', students: 25 },
            { name: 'Première L1', students: 22 }
        ];
    }
    async getNewUsersThisWeek() {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        return await this.userRepository.count({
            where: {
                created_at: {
                    $gte: oneWeekAgo
                }
            }
        });
    }
    async getActiveUsersCount() {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        return await this.userRepository.count({
            where: {
                last_login: {
                    $gte: oneWeekAgo
                }
            }
        });
    }
    async findUserByEmail(email) {
        return await this.userRepository.findOne({
            where: { email: email.toLowerCase() },
            relations: ['student', 'parent']
        });
    }
    async sendResetPasswordEmail(email) {
        const user = await this.findUserByEmail(email);
        if (!user) {
            throw new common_1.NotFoundException('Utilisateur non trouvé');
        }
        await this.emailVerificationService.sendPasswordResetLink(email);
    }
    async resetPassword(token, newPassword) {
        const user = await this.userRepository.findOne({
            where: { password_reset_token: token }
        });
        if (!user) {
            throw new common_1.HttpException('Token de réinitialisation invalide', common_1.HttpStatus.BAD_REQUEST);
        }
        if (!user.password_reset_token_expiry || new Date() > user.password_reset_token_expiry) {
            throw new common_1.HttpException('Token de réinitialisation expiré', common_1.HttpStatus.BAD_REQUEST);
        }
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
        user.password_hash = hashedPassword;
        user.password_reset_token = null;
        user.password_reset_token_expiry = null;
        user.password_reset_code = null;
        user.password_reset_code_expiry = null;
        await this.userRepository.save(user);
        return { message: 'Mot de passe réinitialisé avec succès' };
    }
    async verifyEmailToken(token) {
        try {
            const { email } = await this.emailVerificationService.verifyToken(token);
            const user = await this.usersService.findByEmail(email);
            if (!user) {
                throw new common_1.HttpException('Utilisateur non trouvé', common_1.HttpStatus.NOT_FOUND);
            }
            user.email_verified = true;
            await this.userRepository.save(user);
            return true;
        }
        catch (error) {
            console.error('Erreur vérification email:', error);
            throw error;
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(4, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        students_service_1.StudentsService,
        parents_service_1.ParentsService,
        email_verification_service_1.EmailVerificationService,
        typeorm_2.Repository,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map