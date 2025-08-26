import { IsString, IsOptional, IsNumber, IsArray, IsBoolean, IsIn } from 'class-validator';

export class CreateQuizDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  subject: string;

  @IsString()
  level: string;

  @IsOptional()
  @IsNumber()
  duration?: number;

  @IsOptional()
  @IsNumber()
  pass_score?: number;

  @IsOptional()
  @IsIn(['Publié', 'Brouillon', 'Archivé'])
  status?: 'Publié' | 'Brouillon' | 'Archivé';

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsBoolean()
  is_time_limited?: boolean;

  @IsOptional()
  @IsBoolean()
  allow_retake?: boolean;

  @IsOptional()
  @IsBoolean()
  show_results?: boolean;

  @IsOptional()
  @IsBoolean()
  randomize_questions?: boolean;
}
