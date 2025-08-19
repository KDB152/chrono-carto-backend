// src/modules/auth/auth.service.ts
import { Injectable, HttpException, HttpStatus, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UsersService } from '../users/users.service';
import { StudentsService } from '../students/students.service';
import { ParentsService } from '../parents/parents.service';
import { User, UserRole } from '../users/entities/user.entity';
import { EmailVerificationService } from './email-verification.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  findUserByEmail(email: string) {
    throw new Error('Method not implemented.');
  }
  emailService: any;
  constructor(
    private usersService: UsersService,
    private studentsService: StudentsService,
    private parentsService: ParentsService,
    private emailVerificationService: EmailVerificationService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ message: string; userId: number }> {
    const { firstName, lastName, email, password, phone, userType } = registerDto;

    // Convertir le string userType en enum UserRole
    let role: UserRole;
    switch (userType) {
      case 'student':
        role = UserRole.STUDENT;
        break;
      case 'parent':
        role = UserRole.PARENT;
        break;
      case 'teacher':
        role = UserRole.TEACHER;
        break;
      case 'admin':
        role = UserRole.ADMIN;
        break;
      default:
        role = UserRole.STUDENT; // valeur par défaut
    }

    const user = await this.usersService.createUser({
      email,
      password,
      first_name: firstName,
      last_name: lastName,
      role, // ✅ maintenant c'est un UserRole
    });

    if (role === UserRole.STUDENT) {
      await this.studentsService.createStudent(user.id, phone);
    } else if (role === UserRole.PARENT) {
      await this.parentsService.createParent(user.id, phone);
    }

    // Envoyer automatiquement le lien de vérification d'email
    try {
      await this.emailVerificationService.sendVerificationLink(email);
    } catch (error) {
      console.error('Erreur lors de l\'envoi du lien de vérification:', error);
      // Ne pas faire échouer l'inscription si l'email ne peut pas être envoyé
    }

    return { 
      message: 'Inscription réussie. Un lien de vérification a été envoyé à votre adresse email.', 
      userId: user.id 
    };
  }

  async login(loginDto: LoginDto): Promise<{ accessToken: string; user: { id: number; email: string; role: UserRole; firstName: string; lastName: string } }> {
    const { email, password } = loginDto;
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    if (!user.email_verified) {
      throw new UnauthorizedException('Veuillez vérifier votre email avant de vous connecter');
    }

    const payload = { email: user.email, sub: user.id, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    let userDetails: any = {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.first_name,
      lastName: user.last_name,
    };

    if (user.role === UserRole.STUDENT) {
      const student = await this.studentsService.findByUserId(user.id);
      if (student !== undefined && student !== null) {
        userDetails = { ...userDetails, studentDetails: student };
      }
    } else if (user.role === UserRole.PARENT) {
      const parent = await this.parentsService.findByUserId(user.id);
      if (parent !== undefined && parent !== null) {
        userDetails = { ...userDetails, parentDetails: parent };
      }
    } else if (user.role === UserRole.ADMIN) {
      // No specific admin details to fetch from a separate service, 
      // but you could add them here if needed.
    }

    return {
      accessToken,
      user: userDetails,
    };
  }

  async verifyEmailToken(token: string): Promise<boolean> {
    try {
      const { email } = await this.emailVerificationService.verifyToken(token);
      const user = await this.usersService.findByEmail(email);
      if (!user) {
        throw new HttpException('Utilisateur non trouvé', HttpStatus.NOT_FOUND);
      }
      user.email_verified = true;
      await this.userRepository.save(user);
      return true;
    } catch (error) {
      console.error('Erreur vérification email:', error);
      throw error;
    }
  }

  async forgotPassword(email: string) {
  // Vérifie si l'utilisateur existe
  const user = await this.userRepository.findOne({ where: { email } });
  if (!user) {
    throw new NotFoundException("User not found");
  }

  // Générer un token de reset
  const resetToken = uuidv4(); // nécessite import { v4 as uuidv4 } from 'uuid';
  user.verification_token = resetToken;
  user.verification_token_expiry = new Date(Date.now() + 1000 * 60 * 60); // expire dans 1h
  await this.userRepository.save(user);

  // Envoi email
  await this.emailService.sendPasswordReset(user.email, resetToken);

  return { message: 'Password reset link sent successfully' };
}


  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ 
      where: { password_reset_token: token } 
    });

    if (!user) {
      throw new HttpException('Token de réinitialisation invalide', HttpStatus.BAD_REQUEST);
    }

    if (!user.password_reset_token_expiry || new Date() > user.password_reset_token_expiry) {
      throw new HttpException('Token de réinitialisation expiré', HttpStatus.BAD_REQUEST);
    }

    // Hasher le nouveau mot de passe
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Mettre à jour le mot de passe et supprimer les tokens de réinitialisation
    user.password_hash = hashedPassword;
    user.password_reset_token = null;
    user.password_reset_token_expiry = null;
    user.password_reset_code = null;
    user.password_reset_code_expiry = null;
    await this.userRepository.save(user);

    return { message: 'Mot de passe réinitialisé avec succès' };
  }
}
