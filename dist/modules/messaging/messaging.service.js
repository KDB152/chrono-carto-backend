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
const user_entity_1 = require("../users/entities/user.entity");
let MessagingService = class MessagingService {
    constructor(conversationRepository, messageRepository, userRepository) {
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
    }
    async getConversations(userId) {
        return this.conversationRepository.find({
            where: [
                { participant1_id: userId },
                { participant2_id: userId }
            ],
            order: { updated_at: 'DESC' }
        });
    }
    async getConversation(id) {
        return this.conversationRepository.findOne({
            where: { id }
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
            order: { created_at: 'ASC' }
        });
    }
    async getMessage(messageId) {
        return this.messageRepository.findOne({
            where: { id: messageId }
        });
    }
    async sendMessage(dto) {
        const message = this.messageRepository.create({
            conversation_id: dto.conversationId,
            sender_id: dto.senderId,
            content: dto.content,
            message_type: dto.messageType || 'text',
            file_path: dto.filePath || null
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
    async deleteConversation(id, userId) {
        const conversation = await this.conversationRepository.findOne({
            where: { id }
        });
        if (!conversation) {
            throw new Error('Conversation not found');
        }
        let canDelete = false;
        if (userId) {
            const user = await this.userRepository.findOne({
                where: { id: userId },
                select: ['id', 'role']
            });
            if (user) {
                if (user.role === 'admin') {
                    canDelete = true;
                }
                else if (conversation.participant1_id === userId || conversation.participant2_id === userId) {
                    canDelete = true;
                }
            }
        }
        if (!canDelete) {
            throw new Error('You do not have permission to delete this conversation');
        }
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
            ]
        });
        const contactIds = new Set();
        conversations.forEach(conv => {
            if (conv.participant1_id === userId) {
                contactIds.add(conv.participant2_id);
            }
            else {
                contactIds.add(conv.participant1_id);
            }
        });
        const contacts = await this.userRepository.find({
            where: { id: (0, typeorm_2.In)(Array.from(contactIds)) },
            select: ['id', 'firstName', 'lastName', 'email', 'role']
        });
        return contacts;
    }
    async searchMessages(conversationId, query) {
        return this.messageRepository
            .createQueryBuilder('message')
            .where('message.conversation_id = :conversationId', { conversationId })
            .andWhere('message.content LIKE :query', { query: `%${query}%` })
            .orderBy('message.created_at', 'ASC')
            .getMany();
    }
    async uploadFile(file, userId) {
        const fs = require('fs');
        const path = require('path');
        const uploadsDir = path.join(process.cwd(), 'uploads', 'messages');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }
        const fileExtension = path.extname(file.originalname);
        const fileName = path.basename(file.originalname, fileExtension);
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        const storedName = `message-${timestamp}-${randomSuffix}-${fileName}${fileExtension}`;
        const filePath = path.join('uploads', 'messages', storedName);
        const fullPath = path.join(process.cwd(), filePath);
        fs.writeFileSync(fullPath, file.buffer);
        console.log('✅ Fichier de message sauvegardé:', fullPath);
        return {
            fileName: file.originalname,
            storedName,
            filePath,
            fileType: file.mimetype,
            fileSize: file.size
        };
    }
    async getAvailableRecipients(currentUserId) {
        return this.userRepository.find({
            where: {
                is_approved: true,
                is_active: true,
                id: (0, typeorm_2.Not)(currentUserId)
            },
            select: ['id', 'firstName', 'lastName', 'email', 'role'],
            order: {
                firstName: 'ASC',
                lastName: 'ASC'
            }
        });
    }
    async createOrGetConversation(participant1Id, participant2Id) {
        try {
            console.log('Creating conversation with:', { participant1Id, participant2Id });
            if (!participant1Id || !participant2Id) {
                throw new Error('Both participant1Id and participant2Id are required');
            }
            if (isNaN(participant1Id) || isNaN(participant2Id)) {
                throw new Error('Both participant1Id and participant2Id must be valid numbers');
            }
            if (participant1Id === participant2Id) {
                throw new Error('Cannot create conversation with the same user');
            }
            console.log('Looking for existing conversation between:', participant1Id, 'and', participant2Id);
            let conversation = await this.conversationRepository.findOne({
                where: [
                    { participant1_id: participant1Id, participant2_id: participant2Id },
                    { participant1_id: participant2Id, participant2_id: participant1Id }
                ]
            });
            if (!conversation) {
                console.log('No existing conversation found, creating new one');
                conversation = this.conversationRepository.create({
                    participant1_id: participant1Id,
                    participant2_id: participant2Id,
                    type: 'direct'
                });
                conversation = await this.conversationRepository.save(conversation);
                console.log('New conversation created:', conversation);
            }
            else {
                console.log('Existing conversation found:', conversation);
            }
            return conversation;
        }
        catch (error) {
            console.error('Error in createOrGetConversation:', error);
            throw error;
        }
    }
};
exports.MessagingService = MessagingService;
exports.MessagingService = MessagingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(conversation_entity_1.Conversation)),
    __param(1, (0, typeorm_1.InjectRepository)(message_entity_1.Message)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], MessagingService);
//# sourceMappingURL=messaging.service.js.map