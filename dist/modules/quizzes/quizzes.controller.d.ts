import { QuizzesService } from './quizzes.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
export declare class QuizzesController {
    private readonly quizzesService;
    constructor(quizzesService: QuizzesService);
    findAll(page?: string, limit?: string, subject?: string, level?: string, status?: string): Promise<{
        items: import("./entities/quiz.entity").Quiz[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(id: string): Promise<import("./entities/quiz.entity").Quiz>;
    create(dto: CreateQuizDto): Promise<import("./entities/quiz.entity").Quiz>;
    update(id: string, dto: Partial<CreateQuizDto>): Promise<import("./entities/quiz.entity").Quiz>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
    listAttempts(id: string): Promise<import("./entities/quiz-attempt.entity").QuizAttempt[]>;
    submitAttempt(dto: SubmitQuizDto): Promise<import("./entities/quiz-attempt.entity").QuizAttempt>;
}
