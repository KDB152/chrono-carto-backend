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
exports.MessagingController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const messaging_service_1 = require("./messaging.service");
const create_conversation_dto_1 = require("./dto/create-conversation.dto");
const send_message_dto_1 = require("./dto/send-message.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const multer_1 = require("multer");
const path_1 = require("path");
let MessagingController = class MessagingController {
    constructor(messagingService) {
        this.messagingService = messagingService;
    }
    async getConversations(userId) {
        return this.messagingService.getConversations(parseInt(userId));
    }
    async getConversation(id) {
        return this.messagingService.getConversation(parseInt(id));
    }
    async createConversation(dto) {
        return this.messagingService.createConversation(dto);
    }
    async getMessages(conversationId) {
        return this.messagingService.getMessages(parseInt(conversationId));
    }
    async sendMessage(dto) {
        return this.messagingService.sendMessage(dto);
    }
    async markMessageAsRead(messageId) {
        return this.messagingService.markMessageAsRead(parseInt(messageId));
    }
    async deleteConversation(id, req) {
        const userId = req.user?.id;
        return this.messagingService.deleteConversation(parseInt(id), userId);
    }
    async deleteMessage(id) {
        return this.messagingService.deleteMessage(parseInt(id));
    }
    async getContacts(userId) {
        return this.messagingService.getContacts(parseInt(userId));
    }
    async getAvailableRecipients(userId) {
        return this.messagingService.getAvailableRecipients(parseInt(userId));
    }
    async createOrGetConversation(body) {
        try {
            console.log('Creating conversation with:', body);
            const result = await this.messagingService.createOrGetConversation(body.participant1Id, body.participant2Id);
            console.log('Conversation created:', result);
            return result;
        }
        catch (error) {
            console.error('Error creating conversation:', error);
            throw error;
        }
    }
    async searchMessages(conversationId, query) {
        return this.messagingService.searchMessages(parseInt(conversationId), query);
    }
    async test() {
        return { message: 'Messaging API is working!' };
    }
    async uploadFile(file, body) {
        return this.messagingService.uploadFile(file, body);
    }
};
exports.MessagingController = MessagingController;
__decorate([
    (0, common_1.Get)('conversations'),
    __param(0, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MessagingController.prototype, "getConversations", null);
__decorate([
    (0, common_1.Get)('conversations/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MessagingController.prototype, "getConversation", null);
__decorate([
    (0, common_1.Post)('conversations'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_conversation_dto_1.CreateConversationDto]),
    __metadata("design:returntype", Promise)
], MessagingController.prototype, "createConversation", null);
__decorate([
    (0, common_1.Get)('conversations/:id/messages'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MessagingController.prototype, "getMessages", null);
__decorate([
    (0, common_1.Post)('messages'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [send_message_dto_1.SendMessageDto]),
    __metadata("design:returntype", Promise)
], MessagingController.prototype, "sendMessage", null);
__decorate([
    (0, common_1.Patch)('messages/:id/read'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MessagingController.prototype, "markMessageAsRead", null);
__decorate([
    (0, common_1.Delete)('conversations/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MessagingController.prototype, "deleteConversation", null);
__decorate([
    (0, common_1.Delete)('messages/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MessagingController.prototype, "deleteMessage", null);
__decorate([
    (0, common_1.Get)('users/:userId/contacts'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MessagingController.prototype, "getContacts", null);
__decorate([
    (0, common_1.Get)('users/:userId/available-recipients'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MessagingController.prototype, "getAvailableRecipients", null);
__decorate([
    (0, common_1.Post)('conversations/create-or-get'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MessagingController.prototype, "createOrGetConversation", null);
__decorate([
    (0, common_1.Get)('search'),
    __param(0, (0, common_1.Query)('conversationId')),
    __param(1, (0, common_1.Query)('query')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MessagingController.prototype, "searchMessages", null);
__decorate([
    (0, common_1.Get)('test'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MessagingController.prototype, "test", null);
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads/messages',
            filename: (req, file, cb) => {
                const randomName = Array(32).fill(null)
                    .map(() => Math.round(Math.random() * 16).toString(16)).join('');
                return cb(null, `${randomName}${(0, path_1.extname)(file.originalname)}`);
            }
        }),
        limits: {
            fileSize: 25 * 1024 * 1024
        }
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MessagingController.prototype, "uploadFile", null);
exports.MessagingController = MessagingController = __decorate([
    (0, common_1.Controller)('messaging'),
    __metadata("design:paramtypes", [messaging_service_1.MessagingService])
], MessagingController);
//# sourceMappingURL=messaging.controller.js.map