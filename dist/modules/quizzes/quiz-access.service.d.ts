import { Repository } from 'typeorm';
import { Quiz } from './entities/quiz.entity';
import { Student } from '../students/entities/student.entity';
export declare class QuizAccessService {
    private readonly quizRepo;
    private readonly studentRepo;
    constructor(quizRepo: Repository<Quiz>, studentRepo: Repository<Student>);
    canStudentTakeQuiz(quizId: number, studentId: number): Promise<boolean>;
    getAccessibleQuizzes(studentId: number): Promise<Quiz[]>;
    isQuizAccessibleToGroup(quizId: number, groupName: string): Promise<boolean>;
    getQuizAccessStats(quizId: number): Promise<{
        totalStudents: number;
        accessibleStudents: number;
        accessibleGroups: string[];
    }>;
}
