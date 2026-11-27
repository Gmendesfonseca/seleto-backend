import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { DateTime } from 'luxon';

export class CreateCompetenceDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateCompetenceDto extends CreateCompetenceDto {}

export class CompetenceQueryDto {
  @IsOptional()
  @IsString()
  name?: string;
}

export class CompetenceResponseDto {
  id: string;
  name: string;
  description: string | null;
  createdAt: DateTime;
  updatedAt: DateTime;
}
