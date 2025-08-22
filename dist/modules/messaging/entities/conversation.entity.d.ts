import { User } from '../../users/entities/user.entity';
import { Message } from './message.entity';
export declare class Conversation {
    id: number;
    participant1_id: number;
    participant2_id: number;
    title: string;
    type: string;
    last_message_id: number;
    created_at: Date;
    updated_at: Date;
    participant1: User;
    participant2: User;
    messages: Message[];
    lastMessage: Message;
}
