import { Repository } from 'typeorm';
import { Quiz } from './entities/quiz.entity';
import { Question } from './entities/question.entity';
import { QuizAttempt } from './entities/quiz-attempt.entity';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
export declare class QuizzesService {
    private readonly quizRepo;
    private readonly questionRepo;
    private readonly attemptRepo;
    constructor(quizRepo: Repository<Quiz>, questionRepo: Repository<Question>, attemptRepo: Repository<QuizAttempt>);
    findAll({ page, limit, subject, level, status }: {
        page?: number;
        limit?: number;
        subject?: string;
        level?: string;
        status?: string;
    }): Promise<{
        items: Quiz[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(id: number): Promise<Quiz>;
    create(dto: CreateQuizDto): Promise<Quiz>;
    update(id: number, dto: Partial<CreateQuizDto>): Promise<Quiz>;
    remove(id: number): Promise<{
        success: boolean;
    }>;
    listAttempts(quizId?: number): Promise<QuizAttempt[]>;
    submitAttempt(dto: SubmitQuizDto): Promise<QuizAttempt>;
}
