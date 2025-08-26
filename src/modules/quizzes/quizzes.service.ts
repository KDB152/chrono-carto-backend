import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quiz } from './entities/quiz.entity';
import { Question } from './entities/question.entity';
import { QuizAttempt } from './entities/quiz-attempt.entity';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { SubmitQuizDto } from './dto/submit-quiz.dto';

@Injectable()
export class QuizzesService {
  constructor(
    @InjectRepository(Quiz) private readonly quizRepo: Repository<Quiz>,
    @InjectRepository(Question) private readonly questionRepo: Repository<Question>,
    @InjectRepository(QuizAttempt) private readonly attemptRepo: Repository<QuizAttempt>,
  ) {}

  async findAll({ page = 1, limit = 50, subject, level, status }: { page?: number; limit?: number; subject?: string; level?: string; status?: string; }) {
    const qb = this.quizRepo.createQueryBuilder('q');
    if (subject) qb.andWhere('q.subject = :subject', { subject });
    if (level) qb.andWhere('q.level = :level', { level });
    if (status) qb.andWhere('q.status = :status', { status });
    qb.orderBy('q.id', 'DESC').skip((page - 1) * limit).take(limit);
    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit };
  }

  async findOne(id: number) {
    return this.quizRepo.findOne({ where: { id } });
  }

  async findOneWithQuestions(id: number) {
    const quiz = await this.quizRepo.findOne({ where: { id } });
    if (!quiz) return null;
    
    const questions = await this.questionRepo.find({ 
      where: { quiz_id: id },
      order: { id: 'ASC' }
    });
    
    return { ...quiz, questions };
  }

  async create(dto: CreateQuizDto) {
    const entity = this.quizRepo.create({
      title: dto.title,
      description: dto.description,
      subject: dto.subject,
      level: dto.level,
      duration: dto.duration ?? 0,
      pass_score: dto.pass_score ?? 10,
      status: dto.status ?? 'Brouillon',
      tags: dto.tags,
      is_time_limited: dto.is_time_limited ?? false,
      allow_retake: dto.allow_retake ?? false,
      show_results: dto.show_results ?? true,
      randomize_questions: dto.randomize_questions ?? false,
    });
    return this.quizRepo.save(entity);
  }

  async update(id: number, dto: Partial<CreateQuizDto>) {
    await this.quizRepo.update(id, dto as any);
    return this.findOne(id);
  }

  async remove(id: number) {
    // Delete all questions first
    await this.questionRepo.delete({ quiz_id: id });
    // Delete all attempts
    await this.attemptRepo.delete({ quiz_id: id });
    // Delete the quiz
    await this.quizRepo.delete(id);
    return { success: true };
  }

  // Question management methods
  async findQuestions(quizId: number) {
    return this.questionRepo.find({ 
      where: { quiz_id: quizId },
      order: { id: 'ASC' }
    });
  }

  async findQuestion(questionId: number) {
    return this.questionRepo.findOne({ where: { id: questionId } });
  }

  async createQuestion(dto: CreateQuestionDto) {
    const entity = this.questionRepo.create({
      quiz_id: dto.quiz_id,
      question: dto.question,
      type: dto.type,
      options: dto.options,
      correct_answer: dto.correct_answer,
      points: dto.points ?? 1,
      explanation: dto.explanation,
    });
    
    const savedQuestion = await this.questionRepo.save(entity);
    
    // Update quiz total points
    await this.updateQuizTotalPoints(dto.quiz_id);
    
    return savedQuestion;
  }

  async updateQuestion(questionId: number, dto: UpdateQuestionDto) {
    await this.questionRepo.update(questionId, dto as any);
    const updatedQuestion = await this.findQuestion(questionId);
    
    // Update quiz total points
    if (updatedQuestion) {
      await this.updateQuizTotalPoints(updatedQuestion.quiz_id);
    }
    
    return updatedQuestion;
  }

  async removeQuestion(questionId: number) {
    const question = await this.findQuestion(questionId);
    if (!question) return { success: false, message: 'Question not found' };
    
    await this.questionRepo.delete(questionId);
    
    // Update quiz total points
    await this.updateQuizTotalPoints(question.quiz_id);
    
    return { success: true };
  }

  private async updateQuizTotalPoints(quizId: number) {
    const questions = await this.findQuestions(quizId);
    const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
    
    await this.quizRepo.update(quizId, { total_points: totalPoints });
  }

  async listAttempts(quizId?: number) {
    if (quizId) return this.attemptRepo.find({ where: { quiz_id: quizId }, order: { id: 'DESC' } });
    return this.attemptRepo.find({ order: { id: 'DESC' } });
  }

  async listStudentAttempts(quizId?: number, studentId?: number) {
    const where: any = {};
    if (quizId) where.quiz_id = quizId;
    if (studentId) where.student_id = studentId;
    
    return this.attemptRepo.find({ 
      where, 
      order: { id: 'DESC' } 
    });
  }

  async submitAttempt(dto: SubmitQuizDto) {
    const entity = this.attemptRepo.create({
      quiz_id: dto.quiz_id,
      student_id: dto.student_id,
      student_name: dto.student_name,
      score: dto.score,
      total_points: dto.total_points,
      percentage: dto.percentage,
      time_spent: dto.time_spent ?? 0,
      answers: dto.answers ?? null,
    });
    const saved = await this.attemptRepo.save(entity);
    // update aggregate on quiz
    await this.quizRepo.createQueryBuilder()
      .update()
      .set({ attempts: () => 'attempts + 1' })
      .where('id = :id', { id: dto.quiz_id })
      .execute();
    return saved;
  }
}
