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
const relations_service_1 = require("../relations/relations.service");
const user_entity_1 = require("../users/entities/user.entity");
const email_verification_service_1 = require("./email-verification.service");
const bcrypt = require("bcrypt");
const jwt_1 = require("@nestjs/jwt");
const uuid_1 = require("uuid");
let AuthService = class AuthService {
    findUserByEmail(email) {
        throw new Error('Method not implemented.');
    }
    constructor(usersService, studentsService, parentsService, relationsService, emailVerificationService, userRepository, jwtService) {
        this.usersService = usersService;
        this.studentsService = studentsService;
        this.parentsService = parentsService;
        this.relationsService = relationsService;
        this.emailVerificationService = emailVerificationService;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }
    async register(registerDto) {
        const { first_name, last_name, email, password, phone, userType } = registerDto;
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
        try {
            const user = await this.usersService.createUser({
                email,
                password,
                firstName: first_name,
                lastName: last_name,
                phone: phone,
                role,
            });
            await this.usersService.update(user.id, { is_approved: false, is_active: false });
            if (role === user_entity_1.UserRole.STUDENT) {
                try {
                    const student = await this.studentsService.create({
                        user_id: user.id,
                        phone_number: phone,
                        birth_date: registerDto.studentBirthDate ? new Date(registerDto.studentBirthDate) : undefined,
                        class_level: registerDto.studentClass,
                        parent_id: null,
                    });
                    if (registerDto.parentFirstName && registerDto.parentLastName && registerDto.parentEmail) {
                        try {
                            const existingParentUser = await this.usersService.findByEmail(registerDto.parentEmail);
                            if (!existingParentUser) {
                                const parentUser = await this.usersService.createUser({
                                    email: registerDto.parentEmail,
                                    password: registerDto.parentPassword || this.generateTemporaryPassword(),
                                    firstName: registerDto.parentFirstName,
                                    lastName: registerDto.parentLastName,
                                    phone: registerDto.parentPhone,
                                    role: user_entity_1.UserRole.PARENT,
                                    is_approved: false,
                                    is_active: true,
                                });
                                const parent = await this.parentsService.create({
                                    user_id: parentUser.id,
                                    phone_number: registerDto.parentPhone,
                                });
                                await this.studentsService.update(student.id, { parent_id: parent.id });
                                await this.relationsService.createParentStudentRelation(parent.id, student.id);
                                console.log(`Compte parent créé automatiquement pour l'étudiant ${user.email}`);
                            }
                            else {
                                const existingParent = await this.parentsService.findByUserId(existingParentUser.id);
                                if (existingParent) {
                                    await this.studentsService.update(student.id, { parent_id: existingParent.id });
                                    await this.relationsService.createParentStudentRelation(existingParent.id, student.id);
                                    console.log(`Relation créée entre l'étudiant ${user.email} et le parent existant ${registerDto.parentEmail}`);
                                }
                            }
                        }
                        catch (parentCreationError) {
                            console.error('Erreur lors de la création automatique du compte parent:', parentCreationError);
                        }
                    }
                }
                catch (studentError) {
                    console.error('Erreur lors de la création de l\'étudiant:', studentError);
                }
            }
            else if (role === user_entity_1.UserRole.PARENT) {
                try {
                    const parent = await this.parentsService.create({
                        user_id: user.id,
                        phone_number: phone,
                    });
                    if (registerDto.childFirstName && registerDto.childLastName && registerDto.childPassword && registerDto.childEmail) {
                        try {
                            const childUser = await this.usersService.createUser({
                                email: registerDto.childEmail,
                                password: registerDto.childPassword,
                                firstName: registerDto.childFirstName,
                                lastName: registerDto.childLastName,
                                phone: registerDto.childPhone,
                                role: user_entity_1.UserRole.STUDENT,
                                is_approved: false,
                                is_active: true,
                            });
                            const student = await this.studentsService.create({
                                user_id: childUser.id,
                                phone_number: registerDto.childPhone || '',
                                birth_date: registerDto.childBirthDate ? new Date(registerDto.childBirthDate) : undefined,
                                class_level: registerDto.childClass,
                                parent_id: parent.id,
                            });
                            await this.relationsService.createParentStudentRelation(parent.id, student.id);
                            console.log(`Compte enfant créé automatiquement pour le parent ${user.email}`);
                        }
                        catch (childCreationError) {
                            console.error('Erreur lors de la création automatique du compte enfant:', childCreationError);
                        }
                    }
                }
                catch (parentError) {
                    console.error('Erreur lors de la création du parent:', parentError);
                }
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
        catch (error) {
            console.error('Erreur lors de l\'inscription:', error);
            throw error;
        }
    }
    async login(loginDto) {
        const { email, password } = loginDto;
        const user = await this.userRepository.findOne({ where: { email } });
        if (!user) {
            throw new common_1.UnauthorizedException('Email ou mot de passe incorrect');
        }
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Email ou mot de passe incorrect');
        }
        if (user.role !== user_entity_1.UserRole.ADMIN) {
            if (!user.email_verified) {
                throw new common_1.UnauthorizedException('EMAIL_NOT_VERIFIED');
            }
            if (!user.is_approved) {
                throw new common_1.UnauthorizedException('ACCOUNT_NOT_APPROVED');
            }
        }
        const payload = { email: user.email, sub: user.id, role: user.role };
        const accessToken = this.jwtService.sign(payload);
        let userDetails = {
            id: user.id,
            email: user.email,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
        };
        if (user.role === user_entity_1.UserRole.STUDENT) {
            const student = await this.studentsService.findByUserId(user.id);
            if (student !== undefined && student !== null) {
                userDetails = { ...userDetails, studentDetails: student };
            }
        }
        else if (user.role === user_entity_1.UserRole.PARENT) {
            const parent = await this.parentsService.findByUserId(user.id);
            if (parent !== undefined && parent !== null) {
                userDetails = { ...userDetails, parentDetails: parent };
            }
        }
        else if (user.role === user_entity_1.UserRole.ADMIN) {
        }
        return {
            accessToken,
            user: userDetails,
        };
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
    async forgotPassword(email) {
        const user = await this.userRepository.findOne({ where: { email } });
        if (!user) {
            throw new common_1.NotFoundException("User not found");
        }
        const resetToken = (0, uuid_1.v4)();
        user.verification_token = resetToken;
        user.verification_token_expiry = new Date(Date.now() + 1000 * 60 * 60);
        await this.userRepository.save(user);
        await this.emailService.sendPasswordReset(user.email, resetToken);
        return { message: 'Password reset link sent successfully' };
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
    async changePassword(userId, currentPassword, newPassword) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.HttpException('Utilisateur non trouvé', common_1.HttpStatus.NOT_FOUND);
        }
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
        if (!isCurrentPasswordValid) {
            throw new common_1.HttpException('Mot de passe actuel incorrect', common_1.HttpStatus.BAD_REQUEST);
        }
        const isNewPasswordSame = await bcrypt.compare(newPassword, user.password_hash);
        if (isNewPasswordSame) {
            throw new common_1.HttpException('Le nouveau mot de passe doit être différent de l\'actuel', common_1.HttpStatus.BAD_REQUEST);
        }
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
        user.password_hash = hashedPassword;
        await this.userRepository.save(user);
        return { message: 'Mot de passe modifié avec succès' };
    }
    generateTemporaryPassword() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let password = '';
        for (let i = 0; i < 12; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(5, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        students_service_1.StudentsService,
        parents_service_1.ParentsService,
        relations_service_1.RelationsService,
        email_verification_service_1.EmailVerificationService,
        typeorm_2.Repository,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map