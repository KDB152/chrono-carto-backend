// src/config/database.config.ts
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config();

// Import de toutes les entités
import { User, UserRole } from '../modules/users/entities/user.entity';
import { Student } from '../modules/students/entities/student.entity';
import { Parent } from '../modules/parents/entities/parent.entity';
import { ParentStudent } from '../modules/relations/entities/parent-student.entity';
import { Quiz } from '../modules/quizzes/entities/quiz.entity';
import { Question } from '../modules/quizzes/entities/question.entity';
import { QuizAttempt } from '../modules/quizzes/entities/quiz-attempt.entity';
import { Course } from '../modules/content/entities/course.entity';
import { SystemSettings } from '../modules/settings/entities/settings.entity';
import { UserPreferences } from '../modules/settings/entities/user-preferences.entity';
// import d'autres entités si tu en as
// import { Student } from '../modules/students/entities/student.entity';
// import { Class } from '../modules/classes/entities/class.entity';

export const databaseConfig = {
  type: 'mysql' as const,
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'chrono_carto',
  entities: [User, Student, Parent, ParentStudent, Quiz, Question, QuizAttempt, Course, SystemSettings, UserPreferences],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: true,
  logging: true,
};