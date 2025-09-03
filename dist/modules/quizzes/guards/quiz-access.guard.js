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
exports.QuizAccessGuard = void 0;
const common_1 = require("@nestjs/common");
const quiz_access_service_1 = require("../quiz-access.service");
let QuizAccessGuard = class QuizAccessGuard {
    constructor(quizAccessService) {
        this.quizAccessService = quizAccessService;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const { quiz_id, student_id } = request.body;
        if (!quiz_id || !student_id) {
            throw new common_1.ForbiddenException('Quiz ID et Student ID requis');
        }
        const canTake = await this.quizAccessService.canStudentTakeQuiz(quiz_id, student_id);
        if (!canTake) {
            throw new common_1.ForbiddenException('Vous n\'êtes pas autorisé à tenter ce quiz. Contactez votre administrateur.');
        }
        return true;
    }
};
exports.QuizAccessGuard = QuizAccessGuard;
exports.QuizAccessGuard = QuizAccessGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [quiz_access_service_1.QuizAccessService])
], QuizAccessGuard);
//# sourceMappingURL=quiz-access.guard.js.map