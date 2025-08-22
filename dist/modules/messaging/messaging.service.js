"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagingService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const conversation_entity_1 = require("./entities/conversation.entity");
const message_entity_1 = require("./entities/message.entity");
let MessagingService = class MessagingService {
    constructor(conversationRepository, messageRepository) {
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
    }
    async getConversations(userId) {
        return this.conversationRepository.find({
            where: [
                { participant1_id: userId },
                { participant2_id: userId }
            ],
            relations: ['participant1', 'participant2', 'lastMessage'],
            order: { updated_at: 'DESC' }
        });
    }
    async getConversation(id) {
        return this.conversationRepository.findOne({
            where: { id },
            relations: ['participant1', 'participant2', 'messages']
        });
    }
    async createConversation(dto) {
        const conversation = this.conversationRepository.create({
            participant1_id: dto.participant1Id,
            participant2_id: dto.participant2Id,
            title: dto.title,
            type: dto.type || 'direct'
        });
        return this.conversationRepository.save(conversation);
    }
    async getMessages(conversationId) {
        return this.messageRepository.find({
            where: { conversation_id: conversationId },
            relations: ['sender'],
            order: { created_at: 'ASC' }
        });
    }
    async sendMessage(dto) {
        const message = this.messageRepository.create({
            conversation_id: dto.conversationId,
            sender_id: dto.senderId,
            content: dto.content,
            message_type: dto.messageType || 'text'
        });
        const savedMessage = await this.messageRepository.save(message);
        await this.conversationRepository.update(dto.conversationId, {
            last_message_id: savedMessage.id,
            updated_at: new Date()
        });
        return savedMessage;
    }
    async markMessageAsRead(messageId) {
        return this.messageRepository.update(messageId, { is_read: true });
    }
    async deleteConversation(id) {
        await this.messageRepository.delete({ conversation_id: id });
        return this.conversationRepository.delete(id);
    }
    async deleteMessage(id) {
        return this.messageRepository.delete(id);
    }
    async getContacts(userId) {
        const conversations = await this.conversationRepository.find({
            where: [
                { participant1_id: userId },
                { participant2_id: userId }
            ],
            relations: ['participant1', 'participant2']
        });
        const contacts = new Set();
        conversations.forEach(conv => {
            if (conv.participant1_id === userId) {
                contacts.add(conv.participant2);
            }
            else {
                contacts.add(conv.participant1);
            }
        });
        return Array.from(contacts);
    }
    async searchMessages(conversationId, query) {
        return this.messageRepository
            .createQueryBuilder('message')
            .where('message.conversation_id = :conversationId', { conversationId })
            .andWhere('message.content LIKE :query', { query: `%${query}%` })
            .orderBy('message.created_at', 'ASC')
            .getMany();
    }
};
exports.MessagingService = MessagingService;
exports.MessagingService = MessagingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(conversation_entity_1.Conversation)),
    __param(1, (0, typeorm_1.InjectRepository)(message_entity_1.Message)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], MessagingService);
//# sourceMappingURL=messaging.service.js.map