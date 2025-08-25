import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, In } from 'typeorm';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class MessagingService {
  constructor(
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getConversations(userId: number) {
    return this.conversationRepository.find({
      where: [
        { participant1_id: userId },
        { participant2_id: userId }
      ],
      order: { updated_at: 'DESC' }
    });
  }

  async getConversation(id: number) {
    return this.conversationRepository.findOne({
      where: { id }
    });
  }

  async createConversation(dto: CreateConversationDto) {
    const conversation = this.conversationRepository.create({
      participant1_id: dto.participant1Id,
      participant2_id: dto.participant2Id,
      title: dto.title,
      type: dto.type || 'direct'
    });
    return this.conversationRepository.save(conversation);
  }

  async getMessages(conversationId: number) {
    return this.messageRepository.find({
      where: { conversation_id: conversationId },
      order: { created_at: 'ASC' }
    });
  }

  async sendMessage(dto: SendMessageDto) {
    const message = this.messageRepository.create({
      conversation_id: dto.conversationId,
      sender_id: dto.senderId,
      content: dto.content,
      message_type: dto.messageType || 'text'
    });

    const savedMessage = await this.messageRepository.save(message);

    // Update conversation's last message and timestamp
    await this.conversationRepository.update(dto.conversationId, {
      last_message_id: savedMessage.id,
      updated_at: new Date()
    });

    return savedMessage;
  }

  async markMessageAsRead(messageId: number) {
    return this.messageRepository.update(messageId, { is_read: true });
  }

  async deleteConversation(id: number, userId?: number) {
    // Get the conversation to check permissions
    const conversation = await this.conversationRepository.findOne({
      where: { id }
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Get user info to check if admin
    let canDelete = false;
    if (userId) {
      const user = await this.userRepository.findOne({
        where: { id: userId },
        select: ['id', 'role']
      });

      if (user) {
        // Admin can delete any conversation
        if (user.role === 'admin') {
          canDelete = true;
        }
        // User can delete their own conversations
        else if (conversation.participant1_id === userId || conversation.participant2_id === userId) {
          canDelete = true;
        }
      }
    }

    if (!canDelete) {
      throw new Error('You do not have permission to delete this conversation');
    }

    // Delete all messages first
    await this.messageRepository.delete({ conversation_id: id });
    // Then delete conversation
    return this.conversationRepository.delete(id);
  }

  async deleteMessage(id: number) {
    return this.messageRepository.delete(id);
  }

  async getContacts(userId: number) {
    // Get all users that the current user has conversations with
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
      } else {
        contactIds.add(conv.participant1_id);
      }
    });

    // Récupérer les informations des utilisateurs
    const contacts = await this.userRepository.find({
      where: { id: In(Array.from(contactIds)) },
      select: ['id', 'first_name', 'last_name', 'email', 'role']
    });

    return contacts;
  }

  async searchMessages(conversationId: number, query: string) {
    return this.messageRepository
      .createQueryBuilder('message')
      .where('message.conversation_id = :conversationId', { conversationId })
      .andWhere('message.content LIKE :query', { query: `%${query}%` })
      .orderBy('message.created_at', 'ASC')
      .getMany();
  }

  async getAvailableRecipients(currentUserId: number) {
    // Récupérer tous les utilisateurs approuvés sauf l'utilisateur actuel
    return this.userRepository.find({
      where: {
        is_approved: true,
        is_active: true,
        id: Not(currentUserId)
      },
      select: ['id', 'first_name', 'last_name', 'email', 'role'],
      order: {
        first_name: 'ASC',
        last_name: 'ASC'
      }
    });
  }

  async createOrGetConversation(participant1Id: number, participant2Id: number) {
    try {
      console.log('Creating conversation with:', { participant1Id, participant2Id });
      
      // Validate inputs
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
      
      // Vérifier si une conversation existe déjà entre ces deux utilisateurs
      let conversation = await this.conversationRepository.findOne({
        where: [
          { participant1_id: participant1Id, participant2_id: participant2Id },
          { participant1_id: participant2Id, participant2_id: participant1Id }
        ]
      });

      if (!conversation) {
        console.log('No existing conversation found, creating new one');
        // Créer une nouvelle conversation
        conversation = this.conversationRepository.create({
          participant1_id: participant1Id,
          participant2_id: participant2Id,
          type: 'direct'
        });
        conversation = await this.conversationRepository.save(conversation);
        console.log('New conversation created:', conversation);
      } else {
        console.log('Existing conversation found:', conversation);
      }

      return conversation;
    } catch (error) {
      console.error('Error in createOrGetConversation:', error);
      throw error;
    }
  }

  async uploadFile(file: Express.Multer.File, body: any) {
    try {
      // Validate file
      if (!file) {
        throw new Error('No file uploaded');
      }

      // Validate required fields
      if (!body.conversationId || !body.senderId) {
        throw new Error('conversationId and senderId are required');
      }

      const conversationId = parseInt(body.conversationId);
      const senderId = parseInt(body.senderId);

      // Verify conversation exists
      const conversation = await this.conversationRepository.findOne({
        where: { id: conversationId }
      });

      if (!conversation) {
        throw new Error('Conversation not found');
      }

      // Verify sender is participant in conversation
      if (conversation.participant1_id !== senderId && conversation.participant2_id !== senderId) {
        throw new Error('Sender is not a participant in this conversation');
      }

      // Create message with file
      const message = this.messageRepository.create({
        conversation_id: conversationId,
        sender_id: senderId,
        content: file.originalname, // Use original filename as content
        message_type: 'file',
        file_path: file.path // Store the file path
      });

      const savedMessage = await this.messageRepository.save(message);

      // Update conversation's last message and timestamp
      await this.conversationRepository.update(conversationId, {
        last_message_id: savedMessage.id,
        updated_at: new Date()
      });

      return savedMessage;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }
}
