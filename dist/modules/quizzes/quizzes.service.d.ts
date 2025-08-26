import { Repository } from 'typeorm';
import { Quiz } from './entities/quiz.entity';
import { Question } from './entities/question.entity';
import { QuizAttempt } from './entities/quiz-attempt.entity';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
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
    findOneWithQuestions(id: number): Promise<{
        questions: Question[];
        id: number;
        title: string;
        description?: string;
        subject: string;
        level: string;
        duration: number;
        total_points: number;
        attempts: number;
        average_score: number;
        pass_score: number;
        status: import("./entities/quiz.entity").QuizStatus;
        tags?: string[];
        is_time_limited: boolean;
        allow_retake: boolean;
        show_results: boolean;
        randomize_questions: boolean;
        created_at: Date;
        updated_at: Date;
    }>;
    create(dto: CreateQuizDto): Promise<Quiz>;
    update(id: number, dto: Partial<CreateQuizDto>): Promise<Quiz>;
    remove(id: number): Promise<{
        success: boolean;
    }>;
    findQuestions(quizId: number): Promise<Question[]>;
    findQuestion(questionId: number): Promise<Question>;
    createQuestion(dto: CreateQuestionDto): Promise<Question>;
    updateQuestion(questionId: number, dto: UpdateQuestionDto): Promise<Question>;
    removeQuestion(questionId: number): Promise<{
        success: boolean;
        message: string;
    } | {
        success: boolean;
        message?: undefined;
    }>;
    private updateQuizTotalPoints;
    listAttempts(quizId?: number): Promise<QuizAttempt[]>;
    listStudentAttempts(quizId?: number, studentId?: number): Promise<QuizAttempt[]>;
    submitAttempt(dto: SubmitQuizDto): Promise<QuizAttempt>;
}
