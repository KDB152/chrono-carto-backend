export declare class QuizAttempt {
    id: number;
    quiz_id: number;
    student_id: number;
    student_name: string;
    score: number;
    total_points: number;
    percentage: number;
    time_spent: number;
    completed_at: Date;
    answers: any;
}
