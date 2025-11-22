export class CreateVacancyResponsibilityDto {
  vacancyId: string;
  responsibility: string;
}

export class UpdateVacancyResponsibilityDto {
  vacancyId: string;
  responsibility: string;
}

export interface VacancyResponsibilityFilters {
  vacancyId?: string;
  responsibility?: string;
}
