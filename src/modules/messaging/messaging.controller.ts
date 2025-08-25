import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseInterceptors, UploadedFile, UseGuards, Req } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MessagingService } from './messaging.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { diskStorage } from 'multer';
import { extname } from 'path';


@Controller('messaging')
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
  @UseGuards(JwtAuthGuard)
  async deleteConversation(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.id;
    return this.messagingService.deleteConversation(parseInt(id), userId);
  }

  @Delete('messages/:id')
  async deleteMessage(@Param('id') id: string) {
    return this.messagingService.deleteMessage(parseInt(id));
  }

  @Get('users/:userId/contacts')
  async getContacts(@Param('userId') userId: string) {
    return this.messagingService.getContacts(parseInt(userId));
  }

  @Get('users/:userId/available-recipients')
  async getAvailableRecipients(@Param('userId') userId: string) {
    return this.messagingService.getAvailableRecipients(parseInt(userId));
  }

  @Post('conversations/create-or-get')
  async createOrGetConversation(@Body() body: { participant1Id: number; participant2Id: number }) {
    try {
      console.log('Creating conversation with:', body);
      const result = await this.messagingService.createOrGetConversation(body.participant1Id, body.participant2Id);
      console.log('Conversation created:', result);
      return result;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  }

  @Get('search')
  async searchMessages(
    @Query('conversationId') conversationId: string,
    @Query('query') query: string
  ) {
    return this.messagingService.searchMessages(parseInt(conversationId), query);
  }

  @Get('test')
  async test() {
    return { message: 'Messaging API is working!' };
  }

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/messages',
      filename: (req, file, cb) => {
        const randomName = Array(32).fill(null)
          .map(() => Math.round(Math.random() * 16).toString(16)).join('');
        return cb(null, `${randomName}${extname(file.originalname)}`);
      }
    }),
    limits: {
      fileSize: 25 * 1024 * 1024 // 25MB limit
    }
  }))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any
  ) {
    return this.messagingService.uploadFile(file, body);
  }
}
