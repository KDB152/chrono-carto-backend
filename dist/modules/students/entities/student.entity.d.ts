import { User } from '../../users/entities/user.entity';
export declare enum ClassLevel {
    TERMINALE_GROUPE_1 = "Terminale groupe 1",
    TERMINALE_GROUPE_2 = "Terminale groupe 2",
    TERMINALE_GROUPE_3 = "Terminale groupe 3",
    TERMINALE_GROUPE_4 = "Terminale groupe 4",
    PREMIERE_GROUPE_1 = "1\u00E8re groupe 1",
    PREMIERE_GROUPE_2 = "1\u00E8re groupe 2",
    PREMIERE_GROUPE_3 = "1\u00E8re groupe 3"
}
export declare class Student {
    id: number;
    user: User;
    user_id: number;
    class_level: ClassLevel;
    birth_date: Date;
    phone_number: string;
    address: string;
    progress_percentage: number;
    total_quiz_attempts: number;
    average_score: number;
    last_activity: Date;
    parent_id: number;
    paid_sessions: number;
    unpaid_sessions: number;
}
