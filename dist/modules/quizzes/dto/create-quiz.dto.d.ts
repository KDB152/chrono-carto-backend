export declare class CreateQuizDto {
    title: string;
    description?: string;
    subject: string;
    level: string;
    duration?: number;
    pass_score?: number;
    status?: 'Publié' | 'Brouillon' | 'Archivé';
    tags?: string[];
    is_time_limited?: boolean;
    allow_retake?: boolean;
    show_results?: boolean;
    randomize_questions?: boolean;
}
