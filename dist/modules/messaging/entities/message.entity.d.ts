import { User } from '../../users/entities/user.entity';
import { Conversation } from './conversation.entity';
export declare class Message {
    id: number;
    conversation_id: number;
    sender_id: number;
    content: string;
    message_type: string;
    is_read: boolean;
    file_path: string;
    created_at: Date;
    conversation: Conversation;
    sender: User;
}
