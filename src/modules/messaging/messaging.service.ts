import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class MessagingService {
  constructor(
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
  ) {}

  async getConversations(userId: number) {
    return this.conversationRepository.find({
      where: [
        { participant1_id: userId },
        { participant2_id: userId }
      ],
      relations: ['participant1', 'participant2', 'lastMessage'],
      order: { updated_at: 'DESC' }
    });
  }

  async getConversation(id: number) {
    return this.conversationRepository.findOne({
      where: { id },
      relations: ['participant1', 'participant2', 'messages']
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
      relations: ['sender'],
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

  async deleteConversation(id: number) {
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
      ],
      relations: ['participant1', 'participant2']
    });

    const contacts = new Set();
    conversations.forEach(conv => {
      if (conv.participant1_id === userId) {
        contacts.add(conv.participant2);
      } else {
        contacts.add(conv.participant1);
      }
    });

    return Array.from(contacts);
  }

  async searchMessages(conversationId: number, query: string) {
    return this.messageRepository
      .createQueryBuilder('message')
      .where('message.conversation_id = :conversationId', { conversationId })
      .andWhere('message.content LIKE :query', { query: `%${query}%` })
      .orderBy('message.created_at', 'ASC')
      .getMany();
  }
}
