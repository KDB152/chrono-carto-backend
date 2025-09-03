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
exports.QuizAccessService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const quiz_entity_1 = require("./entities/quiz.entity");
const student_entity_1 = require("../students/entities/student.entity");
let QuizAccessService = class QuizAccessService {
    constructor(quizRepo, studentRepo) {
        this.quizRepo = quizRepo;
        this.studentRepo = studentRepo;
    }
    async canStudentTakeQuiz(quizId, studentId) {
        try {
            console.log(`🔍 Vérification d'accès: Quiz ${quizId}, Étudiant ${studentId}`);
            const quiz = await this.quizRepo.findOne({ where: { id: quizId } });
            if (!quiz) {
                console.log(`❌ Quiz ${quizId} non trouvé`);
                return false;
            }
            console.log(`📋 Quiz trouvé:`, {
                id: quiz.id,
                title: quiz.title,
                target_groups: quiz.target_groups,
                target_groups_type: typeof quiz.target_groups
            });
            const student = await this.studentRepo.findOne({ where: { id: studentId } });
            if (!student) {
                console.log(`❌ Étudiant ${studentId} non trouvé`);
                return false;
            }
            console.log(`👤 Étudiant trouvé:`, {
                id: student.id,
                class_level: student.class_level,
                class_level_type: typeof student.class_level
            });
            if (!quiz.target_groups || quiz.target_groups.length === 0) {
                console.log(`✅ Pas de restriction, accès autorisé`);
                return true;
            }
            if (Array.isArray(quiz.target_groups)) {
                const hasAccess = quiz.target_groups.includes(student.class_level);
                console.log(`🔍 Vérification tableau: ${quiz.target_groups.includes(student.class_level)}`);
                console.log(`  target_groups: [${quiz.target_groups.join(', ')}]`);
                console.log(`  student.class_level: ${student.class_level}`);
                console.log(`  Résultat: ${hasAccess}`);
                return hasAccess;
            }
            else if (typeof quiz.target_groups === 'string') {
                const hasAccess = quiz.target_groups === student.class_level;
                console.log(`🔍 Vérification chaîne: ${quiz.target_groups === student.class_level}`);
                console.log(`  target_groups: "${quiz.target_groups}"`);
                console.log(`  student.class_level: "${student.class_level}"`);
                console.log(`  Résultat: ${hasAccess}`);
                return hasAccess;
            }
            console.log(`❌ Format target_groups non reconnu`);
            return false;
        }
        catch (error) {
            console.error('Erreur lors de la vérification d\'accès au quiz:', error);
            return false;
        }
    }
    async getAccessibleQuizzes(studentId) {
        try {
            const student = await this.studentRepo.findOne({ where: { id: studentId } });
            if (!student) {
                return [];
            }
            const allQuizzes = await this.quizRepo.find({
                where: { status: 'Publié' },
                order: { created_at: 'DESC' }
            });
            return allQuizzes.filter(quiz => {
                if (!quiz.target_groups || quiz.target_groups.length === 0) {
                    return true;
                }
                if (Array.isArray(quiz.target_groups)) {
                    return quiz.target_groups.includes(student.class_level);
                }
                else if (typeof quiz.target_groups === 'string') {
                    return quiz.target_groups === student.class_level;
                }
                return false;
            });
        }
        catch (error) {
            console.error('Erreur lors de la récupération des quizzes accessibles:', error);
            return [];
        }
    }
    async isQuizAccessibleToGroup(quizId, groupName) {
        try {
            const quiz = await this.quizRepo.findOne({ where: { id: quizId } });
            if (!quiz) {
                return false;
            }
            if (!quiz.target_groups || quiz.target_groups.length === 0) {
                return true;
            }
            if (Array.isArray(quiz.target_groups)) {
                return quiz.target_groups.includes(groupName);
            }
            else if (typeof quiz.target_groups === 'string') {
                return quiz.target_groups === groupName;
            }
            return false;
        }
        catch (error) {
            console.error('Erreur lors de la vérification d\'accès du groupe:', error);
            return false;
        }
    }
    async getQuizAccessStats(quizId) {
        try {
            const quiz = await this.quizRepo.findOne({ where: { id: quizId } });
            if (!quiz) {
                return { totalStudents: 0, accessibleStudents: 0, accessibleGroups: [] };
            }
            const totalStudents = await this.studentRepo.count();
            if (!quiz.target_groups || quiz.target_groups.length === 0) {
                return {
                    totalStudents,
                    accessibleStudents: totalStudents,
                    accessibleGroups: ['Tous les groupes']
                };
            }
            const accessibleStudents = await this.studentRepo.count({
                where: { class_level: (0, typeorm_2.In)(quiz.target_groups) }
            });
            return {
                totalStudents,
                accessibleStudents,
                accessibleGroups: quiz.target_groups
            };
        }
        catch (error) {
            console.error('Erreur lors de la récupération des statistiques d\'accès:', error);
            return { totalStudents: 0, accessibleStudents: 0, accessibleGroups: [] };
        }
    }
};
exports.QuizAccessService = QuizAccessService;
exports.QuizAccessService = QuizAccessService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(quiz_entity_1.Quiz)),
    __param(1, (0, typeorm_1.InjectRepository)(student_entity_1.Student)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], QuizAccessService);
//# sourceMappingURL=quiz-access.service.js.map