import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { UsersModule } from '../users/users.module';
import { StudentsModule } from '../students/students.module';
import { ParentsModule } from '../parents/parents.module';
import { AdminService } from './admin.service';

@Module({
  imports: [UsersModule, StudentsModule, ParentsModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}

