"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuizzesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const quiz_entity_1 = require("./entities/quiz.entity");
const question_entity_1 = require("./entities/question.entity");
const quiz_attempt_entity_1 = require("./entities/quiz-attempt.entity");
const student_entity_1 = require("../students/entities/student.entity");
const quizzes_service_1 = require("./quizzes.service");
const quiz_access_service_1 = require("./quiz-access.service");
const quiz_access_guard_1 = require("./guards/quiz-access.guard");
const quizzes_controller_1 = require("./quizzes.controller");
let QuizzesModule = class QuizzesModule {
};
exports.QuizzesModule = QuizzesModule;
exports.QuizzesModule = QuizzesModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([quiz_entity_1.Quiz, question_entity_1.Question, quiz_attempt_entity_1.QuizAttempt, student_entity_1.Student])],
        providers: [quizzes_service_1.QuizzesService, quiz_access_service_1.QuizAccessService, quiz_access_guard_1.QuizAccessGuard],
        controllers: [quizzes_controller_1.QuizzesController],
        exports: [quiz_access_service_1.QuizAccessService],
    })
], QuizzesModule);
//# sourceMappingURL=quizzes.module.js.map