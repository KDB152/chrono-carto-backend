import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { QuizzesService } from './quizzes.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { SubmitQuizDto } from './dto/submit-quiz.dto';

@Controller('quizzes')
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('subject') subject?: string,
    @Query('level') level?: string,
    @Query('status') status?: string,
  ) {
    return this.quizzesService.findAll({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 50,
      subject,
      level,
      status,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.quizzesService.findOne(parseInt(id));
  }

  @Post()
  create(@Body() dto: CreateQuizDto) {
    return this.quizzesService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateQuizDto>) {
    return this.quizzesService.update(parseInt(id), dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.quizzesService.remove(parseInt(id));
  }

  @Get(':id/attempts')
  listAttempts(@Param('id') id: string) {
    return this.quizzesService.listAttempts(parseInt(id));
  }

  @Post('attempts')
  submitAttempt(@Body() dto: SubmitQuizDto) {
    return this.quizzesService.submitAttempt(dto);
  }
}
