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
exports.QuizzesController = void 0;
const common_1 = require("@nestjs/common");
const quizzes_service_1 = require("./quizzes.service");
const quiz_access_service_1 = require("./quiz-access.service");
const create_quiz_dto_1 = require("./dto/create-quiz.dto");
const update_quiz_dto_1 = require("./dto/update-quiz.dto");
const create_question_dto_1 = require("./dto/create-question.dto");
const update_question_dto_1 = require("./dto/update-question.dto");
const submit_quiz_dto_1 = require("./dto/submit-quiz.dto");
let QuizzesController = class QuizzesController {
    constructor(quizzesService, quizAccessService) {
        this.quizzesService = quizzesService;
        this.quizAccessService = quizAccessService;
    }
    findAll(page, limit, subject, level, status) {
        return this.quizzesService.findAll({
            page: page ? parseInt(page) : 1,
            limit: limit ? parseInt(limit) : 50,
            subject,
            level,
            status,
        });
    }
    listStudentAttempts(quizId, studentId) {
        return this.quizzesService.listStudentAttempts(quizId ? parseInt(quizId) : undefined, studentId ? parseInt(studentId) : undefined);
    }
    findOne(id) {
        return this.quizzesService.findOne(parseInt(id));
    }
    findOneWithQuestions(id) {
        return this.quizzesService.findOneWithQuestions(parseInt(id));
    }
    listAttempts(id) {
        return this.quizzesService.listAttempts(parseInt(id));
    }
    create(dto) {
        return this.quizzesService.create(dto);
    }
    update(id, dto) {
        return this.quizzesService.update(parseInt(id), dto);
    }
    remove(id) {
        return this.quizzesService.remove(parseInt(id));
    }
    submitAttempt(dto) {
        return this.quizzesService.submitAttempt(dto, dto.student_id);
    }
    findQuestions(quizId) {
        return this.quizzesService.findQuestions(parseInt(quizId));
    }
    findQuestion(questionId) {
        return this.quizzesService.findQuestion(parseInt(questionId));
    }
    getAttemptAnswers(attemptId) {
        return this.quizzesService.getAttemptAnswers(parseInt(attemptId));
    }
    canStudentTakeQuiz(id, studentClassLevel) {
        return this.quizzesService.canStudentTakeQuiz(parseInt(id), studentClassLevel);
    }
    getAccessibleQuizzes(studentId) {
        return this.quizAccessService.getAccessibleQuizzes(parseInt(studentId));
    }
    getQuizAccessStats(id) {
        return this.quizAccessService.getQuizAccessStats(parseInt(id));
    }
    canStudentTakeQuizById(id, studentId) {
        return this.quizAccessService.canStudentTakeQuiz(parseInt(id), parseInt(studentId));
    }
    createQuestion(dto) {
        return this.quizzesService.createQuestion(dto);
    }
    updateQuestion(questionId, dto) {
        return this.quizzesService.updateQuestion(parseInt(questionId), dto);
    }
    removeQuestion(questionId) {
        return this.quizzesService.removeQuestion(parseInt(questionId));
    }
};
exports.QuizzesController = QuizzesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('subject')),
    __param(3, (0, common_1.Query)('level')),
    __param(4, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], QuizzesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('attempts'),
    __param(0, (0, common_1.Query)('quiz_id')),
    __param(1, (0, common_1.Query)('student_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], QuizzesController.prototype, "listStudentAttempts", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], QuizzesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/with-questions'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], QuizzesController.prototype, "findOneWithQuestions", null);
__decorate([
    (0, common_1.Get)(':id/attempts'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], QuizzesController.prototype, "listAttempts", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_quiz_dto_1.CreateQuizDto]),
    __metadata("design:returntype", void 0)
], QuizzesController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_quiz_dto_1.UpdateQuizDto]),
    __metadata("design:returntype", void 0)
], QuizzesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], QuizzesController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)('attempts'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [submit_quiz_dto_1.SubmitQuizDto]),
    __metadata("design:returntype", void 0)
], QuizzesController.prototype, "submitAttempt", null);
__decorate([
    (0, common_1.Get)(':quizId/questions'),
    __param(0, (0, common_1.Param)('quizId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], QuizzesController.prototype, "findQuestions", null);
__decorate([
    (0, common_1.Get)('questions/:questionId'),
    __param(0, (0, common_1.Param)('questionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], QuizzesController.prototype, "findQuestion", null);
__decorate([
    (0, common_1.Get)('attempts/:attemptId/answers'),
    __param(0, (0, common_1.Param)('attemptId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], QuizzesController.prototype, "getAttemptAnswers", null);
__decorate([
    (0, common_1.Get)(':id/can-take/:studentClassLevel'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('studentClassLevel')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], QuizzesController.prototype, "canStudentTakeQuiz", null);
__decorate([
    (0, common_1.Get)('accessible/:studentId'),
    __param(0, (0, common_1.Param)('studentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], QuizzesController.prototype, "getAccessibleQuizzes", null);
__decorate([
    (0, common_1.Get)(':id/access-stats'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], QuizzesController.prototype, "getQuizAccessStats", null);
__decorate([
    (0, common_1.Get)(':id/can-take-student/:studentId'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('studentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], QuizzesController.prototype, "canStudentTakeQuizById", null);
__decorate([
    (0, common_1.Post)('questions'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_question_dto_1.CreateQuestionDto]),
    __metadata("design:returntype", void 0)
], QuizzesController.prototype, "createQuestion", null);
__decorate([
    (0, common_1.Patch)('questions/:questionId'),
    __param(0, (0, common_1.Param)('questionId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_question_dto_1.UpdateQuestionDto]),
    __metadata("design:returntype", void 0)
], QuizzesController.prototype, "updateQuestion", null);
__decorate([
    (0, common_1.Delete)('questions/:questionId'),
    __param(0, (0, common_1.Param)('questionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], QuizzesController.prototype, "removeQuestion", null);
exports.QuizzesController = QuizzesController = __decorate([
    (0, common_1.Controller)('quizzes'),
    __metadata("design:paramtypes", [quizzes_service_1.QuizzesService,
        quiz_access_service_1.QuizAccessService])
], QuizzesController);
//# sourceMappingURL=quizzes.controller.js.map