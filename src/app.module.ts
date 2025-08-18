// src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './config/database.config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { StudentsModule } from './modules/students/students.module';
import { ParentsModule } from './modules/parents/parents.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...databaseConfig, // Spread existing config
      autoLoadEntities: true, // ✅ Added this to auto-load entities from feature modules
    }),
    AuthModule,
    UsersModule,
    StudentsModule,
    ParentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}