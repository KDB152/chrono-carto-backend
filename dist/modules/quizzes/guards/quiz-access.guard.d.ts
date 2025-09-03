import { CanActivate, ExecutionContext } from '@nestjs/common';
import { QuizAccessService } from '../quiz-access.service';
export declare class QuizAccessGuard implements CanActivate {
    private readonly quizAccessService;
    constructor(quizAccessService: QuizAccessService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
