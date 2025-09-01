import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { StudentsService } from '../students/students.service';
import { ParentsService } from '../parents/parents.service';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class AdminService {
  constructor(
    private readonly usersService: UsersService,
    private readonly studentsService: StudentsService,
    private readonly parentsService: ParentsService,
  ) {}

  async listStudents({ page = 1, limit = 50 }: { page?: number; limit?: number }) {
    // First, ensure all student users have profiles
    await this.createMissingProfiles();
    
    return this.studentsService.findAll({ page, limit });
  }

  async listParents({ page = 1, limit = 50 }: { page?: number; limit?: number }) {
    // First, ensure all parent users have profiles
    await this.createMissingProfiles();
    
    return this.parentsService.findAll({ page, limit });
  }

  async createMissingProfiles() {
    console.log('Creating missing profiles for existing users...');
    
    // Get all users
    const allUsers = await this.usersService.findAll();
    console.log(`Found ${allUsers.length} total users`);
    
    for (const user of allUsers) {
      try {
        if (user.role === UserRole.STUDENT) {
          // Check if student profile exists
          const existingStudent = await this.studentsService.findByUserId(user.id);
          if (!existingStudent) {
            console.log(`Creating student profile for user ${user.id} (${user.email})`);
            await this.studentsService.create({
              user_id: user.id,
              class_level: undefined, // Pas de classe par défaut - l'utilisateur devra la sélectionner
              phone_number: user.phone || '',
            });
          }
        } else if (user.role === UserRole.PARENT) {
          // Check if parent profile exists
          const existingParent = await this.parentsService.findByUserId(user.id);
          if (!existingParent) {
            console.log(`Creating parent profile for user ${user.id} (${user.email})`);
            await this.parentsService.create({
              user_id: user.id,
              phone_number: user.phone || '',
              address: 'Non spécifié',
              occupation: 'Non spécifié',
            });
          }
        }
      } catch (error) {
        console.log(`Error creating profile for user ${user.id}:`, error.message);
      }
    }
    
    console.log('Missing profiles creation completed!');
  }

  async createStudentWithUser(payload: any) {
    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(payload.email);
    if (existingUser) {
      throw new Error(`Un utilisateur avec l'email ${payload.email} existe déjà`);
    }

    // expected payload from UI: firstName, lastName, email, phone, class, level, averageScore, completedCourses, totalCourses
    const user = await this.usersService.createUser({
      email: payload.email,
      password: payload.password || 'changeme',
      first_name: payload.firstName,
      last_name: payload.lastName,
      role: UserRole.STUDENT,
      is_approved: true, // Auto-approve users created by admin
    });

    const student = await this.studentsService.create({
      user_id: user.id,
      class_level: payload.class || payload.level,
      phone_number: payload.phone,
      address: payload.address,
      parent_id: payload.parent_id,
    });

    // Optional stats mapping
    await this.studentsService.update(student.id, {
      average_score: payload.averageScore ?? undefined,
      total_quiz_attempts: payload.completedCourses ?? undefined,
      progress_percentage: payload.totalCourses ? Math.min(100, Math.round((payload.completedCourses || 0) / payload.totalCourses * 100)) : undefined,
    });

    return { user, student };
  }

  async updateStudentWithUser(studentId: number, payload: any) {
    const student = await this.studentsService.findOne(studentId);
    if (!student) return null;
    if (payload.firstName || payload.lastName || payload.email || payload.phone !== undefined) {
      await this.usersService.update(student.user_id, {
        first_name: payload.firstName,
        last_name: payload.lastName,
        email: payload.email,
        phone: payload.phone,
      } as any);
    }
    return this.studentsService.update(studentId, {
      class_level: payload.class || payload.level,
      phone_number: payload.phone,
      address: payload.address,
      average_score: payload.averageScore,
      total_quiz_attempts: payload.completedCourses,
      progress_percentage: payload.totalCourses ? Math.min(100, Math.round((payload.completedCourses || 0) / payload.totalCourses * 100)) : undefined,
      parent_id: payload.parent_id,
    });
  }

  async deleteStudent(studentId: number) {
    const student = await this.studentsService.findOne(studentId);
    if (!student) {
      throw new Error('Étudiant non trouvé');
    }
    
    // Delete the student first
    await this.studentsService.remove(studentId);
    
    // Then delete the associated user
    await this.usersService.remove(student.user_id);
    
    return { success: true };
  }

  async createParentWithUser(payload: any) {
    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(payload.email);
    if (existingUser) {
      throw new Error(`Un utilisateur avec l'email ${payload.email} existe déjà`);
    }

    // expected: firstName, lastName, email, phone, studentIds?
    const user = await this.usersService.createUser({
      email: payload.email,
      password: payload.password || 'changeme',
      first_name: payload.firstName,
      last_name: payload.lastName,
      role: UserRole.PARENT,
      is_approved: true, // Auto-approve users created by admin
    });

    const parent = await this.parentsService.create({
      user_id: user.id,
      phone_number: payload.phone,
      address: payload.address,
      occupation: payload.occupation,
    });

    // Link to students if provided
    if (payload.studentIds && Array.isArray(payload.studentIds)) {
      for (const sid of payload.studentIds) {
        const studentId = parseInt(sid);
        if (!isNaN(studentId)) {
          await this.studentsService.update(studentId, { parent_id: parent.id });
        }
      }
    }

    return { user, parent };
  }

  async updateParentWithUser(parentId: number, payload: any) {
    const parent = await this.parentsService.findOne(parentId);
    if (!parent) return null;
    if (payload.firstName || payload.lastName || payload.email || payload.phone !== undefined) {
      await this.usersService.update(parent.user_id, {
        first_name: payload.firstName,
        last_name: payload.lastName,
        email: payload.email,
        phone: payload.phone,
      } as any);
    }
    const updated = await this.parentsService.update(parentId, {
      phone_number: payload.phone,
      address: payload.address,
      occupation: payload.occupation,
    });
    if (payload.studentIds && Array.isArray(payload.studentIds)) {
      for (const sid of payload.studentIds) {
        const studentId = parseInt(sid);
        if (!isNaN(studentId)) {
          await this.studentsService.update(studentId, { parent_id: parent.id });
        }
      }
    }
    return updated;
  }

  async deleteParent(parentId: number) {
    const parent = await this.parentsService.findOne(parentId);
    if (!parent) {
      throw new Error('Parent non trouvé');
    }
    
    // Delete the parent first
    await this.parentsService.remove(parentId);
    
    // Then delete the associated user
    await this.usersService.remove(parent.user_id);
    
    return { success: true };
  }

  async setUserApproval(studentOrParentId: number, approve: boolean) {
    // Try to find student first
    const student = await this.studentsService.findOne(studentOrParentId);
    if (student) {
      return this.usersService.update(student.user_id, { is_approved: approve, is_active: approve } as any);
    }
    
    // If not found as student, try to find as parent
    const parent = await this.parentsService.findOne(studentOrParentId);
    if (parent) {
      return this.usersService.update(parent.user_id, { is_approved: approve, is_active: approve } as any);
    }
    
    throw new Error('Utilisateur non trouvé');
  }

  async cleanTestUsers() {
    console.log('Cleaning test users from database...');
    
    const testEmails = [
      'lucas.dubois@student.fr',
      'emma.martin@student.fr', 
      'thomas.bernard@student.fr',
      'sophie.leroy@student.fr',
      'marie.dubois@parent.fr',
      'jean.martin@parent.fr',
      'pierre.bernard@parent.fr'
    ];

    let deletedCount = 0;

    for (const email of testEmails) {
      try {
        const user = await this.usersService.findByEmail(email);
        if (user) {
          console.log(`Deleting test user: ${email}`);
          
          // Delete associated student/parent profile first
          if (user.role === UserRole.STUDENT) {
            const student = await this.studentsService.findByUserId(user.id);
            if (student) {
              await this.studentsService.remove(student.id);
            }
          } else if (user.role === UserRole.PARENT) {
            const parent = await this.parentsService.findByUserId(user.id);
            if (parent) {
              await this.parentsService.remove(parent.id);
            }
          }
          
          // Delete the user
          await this.usersService.remove(user.id);
          deletedCount++;
        }
      } catch (error) {
        console.log(`Error deleting test user ${email}:`, error.message);
      }
    }

    console.log(`Cleaned ${deletedCount} test users from database.`);
    return { deletedCount };
  }
}

