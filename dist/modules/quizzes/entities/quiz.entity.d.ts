export type QuizStatus = 'Publié' | 'Brouillon' | 'Archivé';
export declare class Quiz {
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
    status: QuizStatus;
    tags?: string[];
    is_time_limited: boolean;
    allow_retake: boolean;
    show_results: boolean;
    randomize_questions: boolean;
    created_at: Date;
    updated_at: Date;
}
