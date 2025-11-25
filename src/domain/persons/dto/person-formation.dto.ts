import { DegreeType } from '../person-formation.model';

export class CreatePersonFormationDto {
  personId: string;
  institution: string;
  degree: DegreeType;
  fieldOfStudy: string;
  startDate: Date;
  endDate: Date | null;
  isCompleted: boolean;
  grade: number | null;
  description?: string;
  location?: string;
}

export class UpdatePersonFormationDto {
  institution?: string;
  degree?: DegreeType;
  fieldOfStudy?: string;
  startDate?: Date;
  endDate?: Date | null;
  isCompleted?: boolean;
  grade?: number | null;
  description?: string;
  location?: string;
}

export interface PersonFormationFilters {
  personId?: string;
  degree?: DegreeType;
  isCompleted?: boolean;
}
