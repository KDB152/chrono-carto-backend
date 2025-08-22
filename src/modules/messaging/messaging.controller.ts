import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { MessagingService } from './messaging.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('messaging')
@UseGuards(JwtAuthGuard)
export class MessagingController {
  constructor(private readonly messagingService: MessagingService) {}

  @Get('conversations')
  async getConversations(@Query('userId') userId: string) {
    return this.messagingService.getConversations(parseInt(userId));
  }

  @Get('conversations/:id')
  async getConversation(@Param('id') id: string) {
    return this.messagingService.getConversation(parseInt(id));
  }

  @Post('conversations')
  async createConversation(@Body() dto: CreateConversationDto) {
    return this.messagingService.createConversation(dto);
  }

  @Get('conversations/:id/messages')
  async getMessages(@Param('id') conversationId: string) {
    return this.messagingService.getMessages(parseInt(conversationId));
  }

  @Post('messages')
  async sendMessage(@Body() dto: SendMessageDto) {
    return this.messagingService.sendMessage(dto);
  }

  @Patch('messages/:id/read')
  async markMessageAsRead(@Param('id') messageId: string) {
    return this.messagingService.markMessageAsRead(parseInt(messageId));
  }

  @Delete('conversations/:id')
  async deleteConversation(@Param('id') id: string) {
    return this.messagingService.deleteConversation(parseInt(id));
  }

  @Delete('messages/:id')
  async deleteMessage(@Param('id') id: string) {
    return this.messagingService.deleteMessage(parseInt(id));
  }

  @Get('users/:userId/contacts')
  async getContacts(@Param('userId') userId: string) {
    return this.messagingService.getContacts(parseInt(userId));
  }

  @Get('search')
  async searchMessages(
    @Query('conversationId') conversationId: string,
    @Query('query') query: string
  ) {
    return this.messagingService.searchMessages(parseInt(conversationId), query);
  }
}
