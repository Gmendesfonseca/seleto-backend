import { DateTime } from 'luxon';

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
  contract: ContractType;
  workMode: WorkModeType;
  level: ExperienceLevel;
  remote: boolean;
  benefits?: string[];
  requirements: string[];
  responsibilities: string[];
  status: VacancyStatus;
  publicationDate: DateTime;
  expirationDate?: DateTime;
  createdAt: DateTime;
  updatedAt: DateTime;
}

export const VacancyType = {
  CONTRACT: 'contract',
  FULL_TIME: 'full_time',
  PART_TIME: 'part_time',
  TEMPORARY: 'temporary',
  INTERNSHIP: 'internship',
  APPRENTICESHIP: 'apprenticeship',
} as const;
export type VacancyType = (typeof VacancyType)[keyof typeof VacancyType];

export const ExperienceLevel = {
  ENTRY: 'entry',
  JUNIOR: 'junior',
  MID: 'mid',
  SENIOR: 'senior',
  LEAD: 'lead',
} as const;
export type ExperienceLevel = (typeof ExperienceLevel)[keyof typeof ExperienceLevel];

export const VacancyStatus = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  PAUSED: 'paused',
  CLOSED: 'closed',
  EXPIRED: 'expired',
} as const;
export type VacancyStatus = (typeof VacancyStatus)[keyof typeof VacancyStatus];

export const ContractType = {
  CLT: 'clt',
  PJ: 'pj',
  FREELANCE: 'freelance',
  INTERN: 'intern',
  APPRENTICESHIP: 'apprenticeship',
  TEMPORARY: 'temporary',
} as const;
export type ContractType = (typeof ContractType)[keyof typeof ContractType];

export const WorkModeType = {
  ONSITE: 'onsite',
  REMOTE: 'remote',
  HYBRID: 'hybrid',
} as const;
export type WorkModeType = (typeof WorkModeType)[keyof typeof WorkModeType];

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
