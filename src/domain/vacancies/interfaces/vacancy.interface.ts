export interface Vacancy {
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

export enum VacancyType {
  FULL_TIME = 'full_time',
  PART_TIME = 'part_time',
  CONTRACT = 'contract',
  INTERNSHIP = 'internship',
  TEMPORARY = 'temporary',
}

export enum ExperienceLevel {
  ENTRY = 'entry',
  JUNIOR = 'junior',
  MID = 'mid',
  SENIOR = 'senior',
  LEAD = 'lead',
}

export enum VacancyStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  PAUSED = 'paused',
  CLOSED = 'closed',
  EXPIRED = 'expired',
}

export interface VacancyFilters {
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
