export class CreatePersonExperienceDto {
  personId: string;
  companyName: string;
  position: string;
  description?: string;
  startDate: Date;
  endDate?: Date | null;
  isCurrent: boolean;
  location?: string;
}
export class UpdatePersonExperienceDto {
  companyName?: string;
  position?: string;
  description?: string;
  startDate?: Date;
  endDate?: Date | null;
  isCurrent?: boolean;
  location?: string;
}
export interface PersonExperienceFilters {
  personId?: string;
  companyName?: string;
  position?: string;
  isCurrent?: boolean;
}
