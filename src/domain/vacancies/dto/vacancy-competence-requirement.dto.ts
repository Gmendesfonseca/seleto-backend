import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { RequirementPriority } from '../../competences/vacancy-competence-requirement.model';

export class CompetenceRequirementItemDto {
  @IsUUID()
  competenceId: string;

  @IsEnum(RequirementPriority)
  priority: RequirementPriority;

  @IsOptional()
  @IsInt()
  @Min(0)
  minimumYearsExperience?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  weight?: number;
}

export class ReplaceCompetenceRequirementsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CompetenceRequirementItemDto)
  requirements: CompetenceRequirementItemDto[];
}

export class CompetenceRequirementResponseDto {
  id: string;
  competenceId: string;
  competenceName: string;
  priority: RequirementPriority;
  minimumYearsExperience: number | null;
  weight: number;
}
