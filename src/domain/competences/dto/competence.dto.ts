import { DateTime } from 'luxon';
import { CompetenceCategory, CompetenceLevel } from '../interfaces/competence.interface';

export class CreateCompetenceDto {
  name: string;
  category: CompetenceCategory;
  description?: string;
  level?: CompetenceLevel;
}

export class UpdateCompetenceDto {
  name?: string;
  category?: CompetenceCategory;
  description?: string;
  level?: CompetenceLevel;
}

export class CompetenceQueryDto {
  name?: string;
}

export class CompetenceResponseDto {
  id: string;
  name: string;
  category: CompetenceCategory;
  description?: string;
  level?: CompetenceLevel;
  createdAt: DateTime;
  updatedAt: DateTime;
}
