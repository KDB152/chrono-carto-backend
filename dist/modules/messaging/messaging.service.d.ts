import { Repository } from 'typeorm';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';
export declare class MessagingService {
    private conversationRepository;
    private messageRepository;
    constructor(conversationRepository: Repository<Conversation>, messageRepository: Repository<Message>);
    getConversations(userId: number): Promise<Conversation[]>;
    getConversation(id: number): Promise<Conversation>;
    createConversation(dto: CreateConversationDto): Promise<Conversation>;
    getMessages(conversationId: number): Promise<Message[]>;
    sendMessage(dto: SendMessageDto): Promise<Message>;
    markMessageAsRead(messageId: number): Promise<import("typeorm").UpdateResult>;
    deleteConversation(id: number): Promise<import("typeorm").DeleteResult>;
    deleteMessage(id: number): Promise<import("typeorm").DeleteResult>;
    getContacts(userId: number): Promise<unknown[]>;
    searchMessages(conversationId: number, query: string): Promise<Message[]>;
}
