export declare class SendMessageDto {
    conversationId: number;
    senderId: number;
    content: string;
    messageType?: 'text' | 'image' | 'file' | 'audio';
    filePath?: string;
    fileName?: string;
    fileType?: string;
}
