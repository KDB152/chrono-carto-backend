// src/modules/auth/dto/register.dto.ts
import { IsEmail, IsString, IsOptional, IsEnum } from 'class-validator';
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

  @IsEnum(UserRole)
  userType: UserRole | 'student' | 'parent';

  // Student-specific
  @IsOptional()
  @IsString()
  studentBirthDate?: string;

  @IsOptional()
  @IsString()
  studentClass?: string;

  // Parent-specific
  @IsOptional()
  @IsString()
  childFirstName?: string;

  @IsOptional()
  @IsString()
  childLastName?: string;

  @IsOptional()
  @IsString()
  childBirthDate?: string;

  @IsOptional()
  @IsString()
  childClass?: string;

  // Student requires parent contacts
  @IsOptional()
  @IsString()
  parentFirstName?: string;

  @IsOptional()
  @IsString()
  parentLastName?: string;

  @IsOptional()
  @IsEmail()
  parentEmail?: string;

  @IsOptional()
  @IsString()
  parentPhone?: string;
}
