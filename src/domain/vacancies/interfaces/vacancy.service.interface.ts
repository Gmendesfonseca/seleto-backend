import { VacancyFilters, VacancyStatus } from './vacancy.interface';
import { CreateVacancyDto, UpdateVacancyDto } from '../dto/vacancy.dto';
import { Vacancy } from '../vacancy.model';
import { PaginatedList } from 'src/shared/interfaces';
import { DateTime } from 'luxon';
import { VacancyStep } from '../vacancy-step.model';

export class CreateVacancyResult {
  id: string;
  title: string;
  description: string;
  company_id: string;
  location: string;
  salary_min: number;
  salary_max: number;
  currency: string;
  type: string;
  work_mode: string;
  contract: string;
  level: string;
  publication_date: DateTime;
  expiration_date: DateTime;
  status: VacancyStatus;
  created_at: DateTime;
  updated_at: DateTime;
  benefits: string[];
  responsibilities: string[];
  requirements: string[];
  steps: VacancyStep[];
}
export abstract class VacancyServiceInterface {
  abstract create(createVacancyDto: CreateVacancyDto): Promise<CreateVacancyResult>;
  abstract findAll(filters?: VacancyFilters): Promise<PaginatedList<Vacancy>>;
  abstract findOne(id: string): Promise<Vacancy | null>;
  abstract update(id: string, updateVacancyDto: UpdateVacancyDto): Promise<Vacancy>;
  abstract remove(id: string): Promise<void>;
  abstract findByCompany(companyId: string): Promise<Vacancy[]>;
  abstract findPublished(): Promise<PaginatedList<Vacancy>>;
  abstract publishVacancy(id: string): Promise<Vacancy>;
  abstract closeVacancy(id: string): Promise<Vacancy>;
}
