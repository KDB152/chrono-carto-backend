import { User } from '../../users/entities/user.entity';
export declare class Student {
    id: number;
    user: User;
    user_id: number;
    class_level: string;
    birth_date: Date;
    phone_number: string;
    address: string;
    progress_percentage: number;
    total_quiz_attempts: number;
    average_score: number;
    last_activity: Date;
    parent_id: number;
}
