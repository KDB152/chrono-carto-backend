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

@Injectable()
export class AuthService {
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
        role = UserRole.STUDENT;
    }

    const user = await this.usersService.createUser({
      email,
      password,
      first_name: firstName,
      last_name: lastName,
      role,
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
    }

    return { 
      message: 'Inscription réussie. Un lien de vérification a été envoyé à votre adresse email.', 
      userId: user.id 
    };
  }

  async login(loginDto: LoginDto): Promise<{
    accessToken: string; 
    user: {
      id: number;
      email: string;
      role: UserRole;
      firstName: string;
      lastName: string;
      profileData?: any;
    }
  }> {
    const { email, password } = loginDto;
    
    // Récupérer l'utilisateur avec ses relations
    const user = await this.userRepository.findOne({ 
      where: { email },
      relations: ['student', 'parent'] // Charger les relations
    });

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

    // Récupérer les données spécifiques selon le rôle
    let profileData = null;
    
    switch (user.role) {
      case UserRole.STUDENT:
        if (user.student) {
          profileData = {
            studentId: user.student.id,
            phone: user.student.phone,
            classLevel: user.student.class_level,
            enrollmentDate: user.student.enrollment_date,
            // Ajouter d'autres données spécifiques aux étudiants
            currentCourses: await this.getStudentCourses(user.student.id),
            grades: await this.getStudentGrades(user.student.id),
            attendance: await this.getStudentAttendance(user.student.id)
          };
        }
        break;
        
      case UserRole.PARENT:
        if (user.parent) {
          profileData = {
            parentId: user.parent.id,
            phone: user.parent.phone,
            // Récupérer les enfants du parent
            children: await this.getParentChildren(user.parent.id),
            notifications: await this.getParentNotifications(user.parent.id)
          };
        }
        break;
        
      case UserRole.ADMIN:
        profileData = {
          adminLevel: 'super_admin',
          permissions: ['all'],
          systemStats: await this.getAdminStats(),
          lastLogin: user.last_login
        };
        break;
        
      case UserRole.TEACHER:
        profileData = {
          teacherId: user.id,
          subjects: await this.getTeacherSubjects(user.id),
          classes: await this.getTeacherClasses(user.id)
        };
        break;
    }

    // Mettre à jour la date de dernière connexion
    user.last_login = new Date();
    await this.userRepository.save(user);

    const payload = { email: user.email, sub: user.id, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name,
        profileData
      },
    };
  }

  // Méthodes pour récupérer les données spécifiques
  private async getStudentCourses(studentId: number): Promise<any[]> {
    // Simulé - remplacer par vraie requête
    return [
      { id: 1, title: 'Histoire de France', progress: 75, nextLesson: 'La Révolution' },
      { id: 2, title: 'Géographie Europe', progress: 60, nextLesson: 'Les climats' },
      { id: 3, title: 'EMC - Citoyenneté', progress: 85, nextLesson: 'La démocratie' }
    ];
  }

  private async getStudentGrades(studentId: number): Promise<any[]> {
    // Simulé - remplacer par vraie requête
    return [
      { subject: 'Histoire', grade: 16, date: '2025-01-10', quiz: 'La Révolution française' },
      { subject: 'Géographie', grade: 14, date: '2025-01-08', quiz: 'Les climats européens' },
      { subject: 'EMC', grade: 18, date: '2025-01-05', quiz: 'La Constitution' }
    ];
  }

  private async getStudentAttendance(studentId: number): Promise<any> {
    // Simulé
    return {
      totalDays: 120,
      presentDays: 115,
      absences: 5,
      attendanceRate: 95.8
    };
  }

  private async getParentChildren(parentId: number): Promise<any[]> {
    // Simulé - remplacer par vraie requête avec jointure
    return [
      { 
        id: 1, 
        firstName: 'Lucas', 
        lastName: 'Dupont', 
        class: 'Terminale S',
        averageGrade: 15.2,
        lastActivity: '2025-01-15T14:30:00Z'
      },
      { 
        id: 2, 
        firstName: 'Emma', 
        lastName: 'Dupont', 
        class: 'Première ES',
        averageGrade: 16.8,
        lastActivity: '2025-01-15T16:45:00Z'
      }
    ];
  }

  private async getParentNotifications(parentId: number): Promise<any[]> {
    // Simulé
    return [
      { type: 'grade', message: 'Nouvelle note en Histoire pour Lucas', date: '2025-01-15' },
      { type: 'absence', message: 'Emma absente aujourd\'hui', date: '2025-01-14' }
    ];
  }

  private async getAdminStats(): Promise<any> {
    // Récupérer les vraies statistiques depuis la base
    const totalUsers = await this.userRepository.count();
    const totalStudents = await this.userRepository.count({ where: { role: UserRole.STUDENT } });
    const totalParents = await this.userRepository.count({ where: { role: UserRole.PARENT } });
    const totalTeachers = await this.userRepository.count({ where: { role: UserRole.TEACHER } });

    return {
      totalUsers,
      totalStudents,
      totalParents,
      totalTeachers,
      newUsersThisWeek: await this.getNewUsersThisWeek(),
      systemUptime: 99.8,
      activeUsers: await this.getActiveUsersCount()
    };
  }

  private async getTeacherSubjects(teacherId: number): Promise<any[]> {
    // Simulé
    return ['Histoire', 'Géographie', 'EMC'];
  }

  private async getTeacherClasses(teacherId: number): Promise<any[]> {
    // Simulé
    return [
      { name: 'Terminale S1', students: 28 },
      { name: 'Terminale ES2', students: 25 },
      { name: 'Première L1', students: 22 }
    ];
  }

  private async getNewUsersThisWeek(): Promise<number> {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    return await this.userRepository.count({
      where: {
        created_at: {
          $gte: oneWeekAgo
        } as any
      }
    });
  }

  private async getActiveUsersCount(): Promise<number> {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    return await this.userRepository.count({
      where: {
        last_login: {
          $gte: oneWeekAgo
        } as any
      }
    });
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email: email.toLowerCase() },
      relations: ['student', 'parent'] // Charger les relations
    });
  }

  async sendResetPasswordEmail(email: string): Promise<void> {
    const user = await this.findUserByEmail(email);
    
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    await this.emailVerificationService.sendPasswordResetLink(email);
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

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    user.password_hash = hashedPassword;
    user.password_reset_token = null;
    user.password_reset_token_expiry = null;
    user.password_reset_code = null;
    user.password_reset_code_expiry = null;
    await this.userRepository.save(user);

    return { message: 'Mot de passe réinitialisé avec succès' };
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
}