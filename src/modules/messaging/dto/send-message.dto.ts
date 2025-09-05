import { IsNumber, IsString, IsOptional, IsEnum } from 'class-validator';

export class SendMessageDto {
  @IsNumber()
  conversationId: number;

  @IsNumber()
  senderId: number;

  @IsString()
  content: string;

  @IsEnum(['text', 'image', 'file', 'audio'])
  @IsOptional()
  messageType?: 'text' | 'image' | 'file' | 'audio';

  @IsString()
  @IsOptional()
  filePath?: string;

  @IsString()
  @IsOptional()
  fileName?: string;

  @IsString()
  @IsOptional()
  fileType?: string;
}
