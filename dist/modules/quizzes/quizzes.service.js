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
let QuizzesService = class QuizzesService {
    constructor(quizRepo, questionRepo, attemptRepo) {
        this.quizRepo = quizRepo;
        this.questionRepo = questionRepo;
        this.attemptRepo = attemptRepo;
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
        return this.questionRepo.find({
            where: { quiz_id: quizId },
            order: { id: 'ASC' }
        });
    }
    async findQuestion(questionId) {
        return this.questionRepo.findOne({ where: { id: questionId } });
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
    async submitAttempt(dto) {
        const entity = this.attemptRepo.create({
            quiz_id: dto.quiz_id,
            student_id: dto.student_id,
            student_name: dto.student_name,
            score: dto.score,
            total_points: dto.total_points,
            percentage: dto.percentage,
            time_spent: dto.time_spent ?? 0,
            answers: dto.answers ?? null,
        });
        const saved = await this.attemptRepo.save(entity);
        await this.quizRepo.createQueryBuilder()
            .update()
            .set({ attempts: () => 'attempts + 1' })
            .where('id = :id', { id: dto.quiz_id })
            .execute();
        return saved;
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
        typeorm_2.Repository])
], QuizzesService);
//# sourceMappingURL=quizzes.service.js.map