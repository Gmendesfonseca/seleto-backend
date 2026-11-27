import { IsEnum, IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { ProficiencyLevel } from '../person-competence.model';

export class CreatePersonCompetenceDto {
  @IsUUID()
  competenceId: string;

  @IsEnum(ProficiencyLevel)
  level: ProficiencyLevel;

  @IsOptional()
  @IsInt()
  @Min(0)
  yearsOfExperience?: number;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdatePersonCompetenceDto {
  @IsOptional()
  @IsEnum(ProficiencyLevel)
  level?: ProficiencyLevel;

  @IsOptional()
  @IsInt()
  @Min(0)
  yearsOfExperience?: number;

  @IsOptional()
  @IsString()
  description?: string;
}

export interface PersonCompetenceFilters {
  personId?: string;
}
