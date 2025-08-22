export type QuestionType = 'multiple' | 'single' | 'text' | 'boolean';
export declare class Question {
    id: number;
    quiz_id: number;
    question: string;
    type: QuestionType;
    options?: string[];
    correct_answer?: string;
    points: number;
    explanation?: string;
}
