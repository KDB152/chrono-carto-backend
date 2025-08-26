import { IsNumber, IsString, IsOptional, IsObject } from 'class-validator';

export class SubmitQuizDto {
  @IsNumber()
  quiz_id: number;

  @IsNumber()
  student_id: number;

  @IsString()
  student_name: string;

  @IsNumber()
  score: number;

  @IsNumber()
  total_points: number;

  @IsNumber()
  percentage: number;

  @IsOptional()
  @IsNumber()
  time_spent?: number;

  @IsOptional()
  @IsObject()
  answers?: any;
}
