import { QuizzesService } from './quizzes.service';
import { QuizAccessService } from './quiz-access.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
export declare class QuizzesController {
    private readonly quizzesService;
    private readonly quizAccessService;
    constructor(quizzesService: QuizzesService, quizAccessService: QuizAccessService);
    findAll(page?: string, limit?: string, subject?: string, level?: string, status?: string): Promise<{
        items: import("./entities/quiz.entity").Quiz[];
        total: number;
        page: number;
        limit: number;
    }>;
    listStudentAttempts(quizId?: string, studentId?: string): Promise<import("./entities/quiz-attempt.entity").QuizAttempt[]>;
    findOne(id: string): Promise<import("./entities/quiz.entity").Quiz>;
    findOneWithQuestions(id: string): Promise<{
        questions: import("./entities/question.entity").Question[];
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
        target_groups?: string[];
        created_at: Date;
        updated_at: Date;
    }>;
    listAttempts(id: string): Promise<import("./entities/quiz-attempt.entity").QuizAttempt[]>;
    create(dto: CreateQuizDto): Promise<import("./entities/quiz.entity").Quiz>;
    update(id: string, dto: UpdateQuizDto): Promise<import("./entities/quiz.entity").Quiz>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
    submitAttempt(dto: SubmitQuizDto): Promise<any>;
    findQuestions(quizId: string): Promise<{
        id: any;
        question_text: any;
        question_type: any;
        points: any;
        correct_answer: any;
        options: any;
        explanation: any;
    }[]>;
    findQuestion(questionId: string): Promise<import("./entities/question.entity").Question>;
    getAttemptAnswers(attemptId: string): Promise<any>;
    canStudentTakeQuiz(id: string, studentClassLevel: string): Promise<boolean>;
    getAccessibleQuizzes(studentId: string): Promise<import("./entities/quiz.entity").Quiz[]>;
    getQuizAccessStats(id: string): Promise<{
        totalStudents: number;
        accessibleStudents: number;
        accessibleGroups: string[];
    }>;
    canStudentTakeQuizById(id: string, studentId: string): Promise<boolean>;
    createQuestion(dto: CreateQuestionDto): Promise<import("./entities/question.entity").Question>;
    updateQuestion(questionId: string, dto: UpdateQuestionDto): Promise<import("./entities/question.entity").Question>;
    removeQuestion(questionId: string): Promise<{
        success: boolean;
        message: string;
    } | {
        success: boolean;
        message?: undefined;
    }>;
}
