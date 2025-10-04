import { VacancyType, ExperienceLevel, VacancyStatus } from '../interfaces/vacancy.interface';

export class CreateVacancyDto {
  title: string;
  description: string;
  companyId: string;
  location: string;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  type: VacancyType;
  level: ExperienceLevel;
  remote: boolean;
  benefits?: string[];
  requirements: string[];
  responsibilities: string[];
  expirationDate?: Date;
}

export class UpdateVacancyDto {
  title?: string;
  description?: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  type?: VacancyType;
  level?: ExperienceLevel;
  remote?: boolean;
  benefits?: string[];
  requirements?: string[];
  responsibilities?: string[];
  status?: VacancyStatus;
  expirationDate?: Date;
}

export class VacancyQueryDto {
  companyId?: string;
  title?: string;
  location?: string;
  type?: VacancyType;
  level?: ExperienceLevel;
  remote?: boolean;
  status?: VacancyStatus;
  salaryMin?: number;
  salaryMax?: number;
}

export class VacancyResponseDto {
  id: string;
  title: string;
  description: string;
  companyId: string;
  location: string;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  type: VacancyType;
  level: ExperienceLevel;
  remote: boolean;
  benefits?: string[];
  requirements: string[];
  responsibilities: string[];
  status: VacancyStatus;
  publicationDate: Date;
  expirationDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}
