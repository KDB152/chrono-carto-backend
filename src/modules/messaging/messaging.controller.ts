import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseInterceptors, UploadedFile, UseGuards, Req, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MessagingService } from './messaging.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';


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
  @UseInterceptors(FileInterceptor('file', {
    limits: {
      fileSize: 50 * 1024 * 1024 // 50MB limit
    }
  }))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any
  ) {
    if (!file) {
      throw new Error('Aucun fichier fourni');
    }

    const userId = req.user?.id;
    if (!userId) {
      throw new Error('Utilisateur non authentifié');
    }

    return this.messagingService.uploadFile(file, userId);
  }

  @Get('download/:messageId')
  async downloadFile(
    @Param('messageId') messageId: string,
    @Res() res: Response,
    @Req() req: any
  ) {
    try {
      // Récupérer le message pour vérifier les permissions
      const message = await this.messagingService.getMessage(parseInt(messageId));
      if (!message || !message.file_path) {
        return res.status(404).json({ error: 'Fichier non trouvé' });
      }

      // Vérifier que l'utilisateur a accès à cette conversation
      const conversation = await this.messagingService.getConversation(message.conversation_id);
      const userId = req.user?.id;
      
      if (!conversation || 
          (conversation.participant1_id !== userId && conversation.participant2_id !== userId)) {
        return res.status(403).json({ error: 'Accès non autorisé' });
      }

      // Construire le chemin du fichier
      const filePath = path.join(process.cwd(), message.file_path);
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'Fichier non trouvé sur le serveur' });
      }

      // Déterminer le type MIME
      const ext = path.extname(message.file_path).toLowerCase();
      let contentType = 'application/octet-stream';
      
      if (ext === '.pdf') contentType = 'application/pdf';
      else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
      else if (ext === '.png') contentType = 'image/png';
      else if (ext === '.gif') contentType = 'image/gif';
      else if (ext === '.mp4') contentType = 'video/mp4';
      else if (ext === '.mp3') contentType = 'audio/mpeg';
      else if (ext === '.doc') contentType = 'application/msword';
      else if (ext === '.docx') contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      else if (ext === '.xls') contentType = 'application/vnd.ms-excel';
      else if (ext === '.xlsx') contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

      // Extraire le nom de fichier original du contenu du message
      const originalFileName = message.content || `fichier${ext}`;

      // Configurer les headers de réponse
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${originalFileName}"`);
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');

      // Envoyer le fichier
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);

    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      return res.status(500).json({ error: 'Erreur lors du téléchargement du fichier' });
    }
  }
}
