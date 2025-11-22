import { VacancyFilters } from './vacancy.interface';
import { CreateVacancyDto, UpdateVacancyDto } from '../dto/vacancy.dto';
import { Vacancy } from '../vacancy.model';
import { PaginatedList } from 'src/shared/interfaces';

export abstract class VacancyServiceInterface {
  abstract create(createVacancyDto: CreateVacancyDto): Promise<Vacancy>;
  abstract findAll(filters?: VacancyFilters): Promise<PaginatedList<Vacancy>>;
  abstract findOne(id: string): Promise<Vacancy | null>;
  abstract update(id: string, updateVacancyDto: UpdateVacancyDto): Promise<Vacancy>;
  abstract remove(id: string): Promise<void>;
  abstract findByCompany(companyId: string): Promise<Vacancy[]>;
  abstract findPublished(): Promise<PaginatedList<Vacancy>>;
  abstract publishVacancy(id: string): Promise<Vacancy>;
  abstract closeVacancy(id: string): Promise<Vacancy>;
}
