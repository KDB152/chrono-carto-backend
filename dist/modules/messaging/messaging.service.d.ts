import { Repository } from 'typeorm';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { User } from '../users/entities/user.entity';
export declare class MessagingService {
    private conversationRepository;
    private messageRepository;
    private userRepository;
    constructor(conversationRepository: Repository<Conversation>, messageRepository: Repository<Message>, userRepository: Repository<User>);
    getConversations(userId: number): Promise<Conversation[]>;
    getConversation(id: number): Promise<Conversation>;
    createConversation(dto: CreateConversationDto): Promise<Conversation>;
    getMessages(conversationId: number): Promise<Message[]>;
    sendMessage(dto: SendMessageDto): Promise<Message>;
    markMessageAsRead(messageId: number): Promise<import("typeorm").UpdateResult>;
    deleteConversation(id: number, userId?: number): Promise<import("typeorm").DeleteResult>;
    deleteMessage(id: number): Promise<import("typeorm").DeleteResult>;
    getContacts(userId: number): Promise<User[]>;
    searchMessages(conversationId: number, query: string): Promise<Message[]>;
    getAvailableRecipients(currentUserId: number): Promise<User[]>;
    createOrGetConversation(participant1Id: number, participant2Id: number): Promise<Conversation>;
    uploadFile(file: Express.Multer.File, body: any): Promise<Message>;
}
