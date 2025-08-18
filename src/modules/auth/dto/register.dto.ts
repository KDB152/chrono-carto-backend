// src/modules/auth/dto/register.dto.ts
import { IsEmail, IsString, IsOptional } from 'class-validator';
import { UserRole } from '../../users/entities/user.entity';

export class RegisterDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  phone?: string;

  // ⚠️ mettre le type exact de UserRole
  userType: UserRole;
}
