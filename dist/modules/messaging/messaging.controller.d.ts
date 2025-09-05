import { MessagingService } from './messaging.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { Response } from 'express';
export declare class MessagingController {
    private readonly messagingService;
    constructor(messagingService: MessagingService);
    getConversations(userId: string): Promise<import("./entities/conversation.entity").Conversation[]>;
    getConversation(id: string): Promise<import("./entities/conversation.entity").Conversation>;
    createConversation(dto: CreateConversationDto): Promise<import("./entities/conversation.entity").Conversation>;
    getMessages(conversationId: string): Promise<import("./entities/message.entity").Message[]>;
    sendMessage(dto: SendMessageDto): Promise<import("./entities/message.entity").Message>;
    markMessageAsRead(messageId: string): Promise<import("typeorm").UpdateResult>;
    deleteConversation(id: string, req: any): Promise<import("typeorm").DeleteResult>;
    deleteMessage(id: string): Promise<import("typeorm").DeleteResult>;
    getContacts(userId: string): Promise<import("../users/users.module").User[]>;
    getAvailableRecipients(userId: string): Promise<import("../users/users.module").User[]>;
    createOrGetConversation(body: {
        participant1Id: number;
        participant2Id: number;
    }): Promise<import("./entities/conversation.entity").Conversation>;
    searchMessages(conversationId: string, query: string): Promise<import("./entities/message.entity").Message[]>;
    test(): Promise<{
        message: string;
    }>;
    uploadFile(file: Express.Multer.File, req: any): Promise<{
        fileName: string;
        storedName: string;
        filePath: any;
        fileType: string;
        fileSize: number;
    }>;
    downloadFile(messageId: string, res: Response, req: any): Promise<Response<any, Record<string, any>>>;
}
