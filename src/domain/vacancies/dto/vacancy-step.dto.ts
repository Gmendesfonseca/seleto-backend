export class CreateVacancyStepDto {
  vacancyId: string;
  stepId: string;
  order?: number;
}

export class UpdateVacancyStepDto {
  order?: number;
  stepId?: string;
}

export interface VacancyStepFilters {
  vacancyId?: string;
}
