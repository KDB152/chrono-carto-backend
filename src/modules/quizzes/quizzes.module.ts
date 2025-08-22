import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Quiz } from './entities/quiz.entity';
import { Question } from './entities/question.entity';
import { QuizAttempt } from './entities/quiz-attempt.entity';
import { QuizzesService } from './quizzes.service';
import { QuizzesController } from './quizzes.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Quiz, Question, QuizAttempt])],
  providers: [QuizzesService],
  controllers: [QuizzesController],
})
export class QuizzesModule {}
