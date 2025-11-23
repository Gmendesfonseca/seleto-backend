export class CreatePersonCompetenceDto {
  personId: string;
  competenceName: string;
  proficiencyLevel: number;
  description?: string;
  yearsOfExperience: number;
}

export class UpdatePersonCompetenceDto {
  competenceName?: string;
  proficiencyLevel?: number;
  description?: string;
  yearsOfExperience?: number;
}

export interface PersonCompetenceFilters {
  personId?: string;
  competenceName?: string;
  proficiencyLevel?: number;
}
