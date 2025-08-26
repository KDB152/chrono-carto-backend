export declare class CreateQuestionDto {
    quiz_id: number;
    question: string;
    type: 'multiple' | 'single' | 'text' | 'boolean';
    options?: string[];
    correct_answer?: string;
    points?: number;
    explanation?: string;
}
