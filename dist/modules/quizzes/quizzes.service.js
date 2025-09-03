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
exports.QuizzesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const quiz_entity_1 = require("./entities/quiz.entity");
const question_entity_1 = require("./entities/question.entity");
const quiz_attempt_entity_1 = require("./entities/quiz-attempt.entity");
const quiz_access_service_1 = require("./quiz-access.service");
let QuizzesService = class QuizzesService {
    constructor(quizRepo, questionRepo, attemptRepo, quizAccessService) {
        this.quizRepo = quizRepo;
        this.questionRepo = questionRepo;
        this.attemptRepo = attemptRepo;
        this.quizAccessService = quizAccessService;
    }
    async findAll({ page = 1, limit = 50, subject, level, status }) {
        const qb = this.quizRepo.createQueryBuilder('q');
        if (subject)
            qb.andWhere('q.subject = :subject', { subject });
        if (level)
            qb.andWhere('q.level = :level', { level });
        if (status)
            qb.andWhere('q.status = :status', { status });
        qb.orderBy('q.id', 'DESC').skip((page - 1) * limit).take(limit);
        const [items, total] = await qb.getManyAndCount();
        return { items, total, page, limit };
    }
    async findOne(id) {
        return this.quizRepo.findOne({ where: { id } });
    }
    async findOneWithQuestions(id) {
        const quiz = await this.quizRepo.findOne({ where: { id } });
        if (!quiz)
            return null;
        const questions = await this.questionRepo.find({
            where: { quiz_id: id },
            order: { id: 'ASC' }
        });
        return { ...quiz, questions };
    }
    async create(dto) {
        const entity = this.quizRepo.create({
            title: dto.title,
            description: dto.description,
            subject: dto.subject,
            level: dto.level,
            duration: dto.duration ?? 0,
            pass_score: dto.pass_score ?? 10,
            status: dto.status ?? 'Brouillon',
            tags: dto.tags,
            is_time_limited: dto.is_time_limited ?? false,
            allow_retake: dto.allow_retake ?? false,
            show_results: dto.show_results ?? true,
            randomize_questions: dto.randomize_questions ?? false,
            target_groups: dto.target_groups,
        });
        return this.quizRepo.save(entity);
    }
    async update(id, dto) {
        await this.quizRepo.update(id, dto);
        return this.findOne(id);
    }
    async remove(id) {
        await this.questionRepo.delete({ quiz_id: id });
        await this.attemptRepo.delete({ quiz_id: id });
        await this.quizRepo.delete(id);
        return { success: true };
    }
    async findQuestions(quizId) {
        try {
            const questions = await this.quizRepo.manager.query('SELECT * FROM quiz_questions WHERE quiz_id = ? ORDER BY id ASC', [quizId]);
            if (!Array.isArray(questions)) {
                console.error('Erreur: questions n\'est pas un tableau:', typeof questions);
                return [];
            }
            return questions.map(q => ({
                id: q.id,
                question_text: q.question,
                question_type: q.type,
                points: q.points,
                correct_answer: q.correct_answer,
                options: q.options ? q.options.split(',') : [],
                explanation: q.explanation
            }));
        }
        catch (error) {
            console.error('Erreur dans findQuestions:', error);
            return [];
        }
    }
    async findQuestion(questionId) {
        return this.questionRepo.findOne({ where: { id: questionId } });
    }
    async canStudentTakeQuiz(quizId, studentClassLevel) {
        const quiz = await this.findOne(quizId);
        if (!quiz)
            return false;
        if (!quiz.target_groups || quiz.target_groups.length === 0)
            return true;
        return quiz.target_groups.includes(studentClassLevel);
    }
    async createQuestion(dto) {
        const entity = this.questionRepo.create({
            quiz_id: dto.quiz_id,
            question: dto.question,
            type: dto.type,
            options: dto.options,
            correct_answer: dto.correct_answer,
            points: dto.points ?? 1,
            explanation: dto.explanation,
        });
        const savedQuestion = await this.questionRepo.save(entity);
        await this.updateQuizTotalPoints(dto.quiz_id);
        return savedQuestion;
    }
    async updateQuestion(questionId, dto) {
        await this.questionRepo.update(questionId, dto);
        const updatedQuestion = await this.findQuestion(questionId);
        if (updatedQuestion) {
            await this.updateQuizTotalPoints(updatedQuestion.quiz_id);
        }
        return updatedQuestion;
    }
    async removeQuestion(questionId) {
        const question = await this.findQuestion(questionId);
        if (!question)
            return { success: false, message: 'Question not found' };
        await this.questionRepo.delete(questionId);
        await this.updateQuizTotalPoints(question.quiz_id);
        return { success: true };
    }
    async updateQuizTotalPoints(quizId) {
        const questions = await this.findQuestions(quizId);
        const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
        await this.quizRepo.update(quizId, { total_points: totalPoints });
    }
    async listAttempts(quizId) {
        if (quizId)
            return this.attemptRepo.find({ where: { quiz_id: quizId }, order: { id: 'DESC' } });
        return this.attemptRepo.find({ order: { id: 'DESC' } });
    }
    async listStudentAttempts(quizId, studentId) {
        const where = {};
        if (quizId)
            where.quiz_id = quizId;
        if (studentId)
            where.student_id = studentId;
        return this.attemptRepo.find({
            where,
            order: { id: 'DESC' }
        });
    }
    async submitAttempt(dto, studentId) {
        if (!studentId) {
            throw new Error('ID de l\'étudiant requis pour vérifier l\'accès au quiz.');
        }
        const canTake = await this.quizAccessService.canStudentTakeQuiz(dto.quiz_id, studentId);
        if (!canTake) {
            throw new Error('Vous n\'êtes pas autorisé à tenter ce quiz. Contactez votre administrateur.');
        }
        const mysql = require('mysql2/promise');
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'chrono_carto'
        });
        let saved;
        try {
            const insertQuery = `
        INSERT INTO quiz_attempts 
        (quiz_id, student_id, score, student_name, total_points, percentage, time_spent, completed_at, answers)
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?)
      `;
            const insertValues = [
                dto.quiz_id,
                dto.student_id,
                dto.score,
                dto.student_name,
                dto.total_points,
                dto.percentage,
                dto.time_spent ?? 0,
                dto.answers ? JSON.stringify(dto.answers) : null
            ];
            const [result] = await connection.execute(insertQuery, insertValues);
            saved = await this.attemptRepo.findOne({
                where: { id: result.insertId }
            });
        }
        finally {
            await connection.end();
        }
        await this.quizRepo.createQueryBuilder()
            .update()
            .set({ attempts: () => 'attempts + 1' })
            .where('id = :id', { id: dto.quiz_id })
            .execute();
        return saved;
    }
    async getAttemptAnswers(attemptId) {
        const attempt = await this.attemptRepo.findOne({
            where: { id: attemptId },
            select: ['answers']
        });
        if (!attempt) {
            throw new Error('Tentative non trouvée');
        }
        return attempt.answers || {};
    }
};
exports.QuizzesService = QuizzesService;
exports.QuizzesService = QuizzesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(quiz_entity_1.Quiz)),
    __param(1, (0, typeorm_1.InjectRepository)(question_entity_1.Question)),
    __param(2, (0, typeorm_1.InjectRepository)(quiz_attempt_entity_1.QuizAttempt)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        quiz_access_service_1.QuizAccessService])
], QuizzesService);
//# sourceMappingURL=quizzes.service.js.map