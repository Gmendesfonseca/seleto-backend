export class CreateVacancyBenefitDto {
  vacancyId: string;
  benefit: string;
}

export class UpdateVacancyBenefitDto {
  vacancyId: string;
  benefit: string;
}

export interface VacancyBenefitFilters {
  vacancyId?: string;
  benefit?: string;
}
