import { MessagingService } from './messaging.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';
export declare class MessagingController {
    private readonly messagingService;
    constructor(messagingService: MessagingService);
    getConversations(userId: string): Promise<import("./entities/conversation.entity").Conversation[]>;
    getConversation(id: string): Promise<import("./entities/conversation.entity").Conversation>;
    createConversation(dto: CreateConversationDto): Promise<import("./entities/conversation.entity").Conversation>;
    getMessages(conversationId: string): Promise<import("./entities/message.entity").Message[]>;
    sendMessage(dto: SendMessageDto): Promise<import("./entities/message.entity").Message>;
    markMessageAsRead(messageId: string): Promise<import("typeorm").UpdateResult>;
    deleteConversation(id: string): Promise<import("typeorm").DeleteResult>;
    deleteMessage(id: string): Promise<import("typeorm").DeleteResult>;
    getContacts(userId: string): Promise<unknown[]>;
    searchMessages(conversationId: string, query: string): Promise<import("./entities/message.entity").Message[]>;
}
