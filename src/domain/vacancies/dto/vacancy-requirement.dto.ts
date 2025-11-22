export class CreateVacancyRequirementDto {
  vacancyId: string;
  requirement: string;
}

export class UpdateVacancyRequirementDto {
  vacancyId: string;
  requirement: string;
}

export interface VacancyRequirementFilters {
  vacancyId?: string;
  requirement?: string;
}
