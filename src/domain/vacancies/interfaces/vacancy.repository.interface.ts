import { VacancyFilters } from './vacancy.interface';
import { CreateVacancyDto, UpdateVacancyDto } from '../dto/vacancy.dto';
import { Vacancy } from '../vacancy.model';

export abstract class VacancyRepository {
  abstract create(
    dto: Omit<CreateVacancyDto, 'benefits' | 'responsibilities' | 'requirements' | 'steps'>,
  ): Promise<Vacancy>;
  abstract findAll(filters?: VacancyFilters): Promise<Vacancy[]>;
  abstract findOne(id: string): Promise<Vacancy | null>;
  abstract update(id: string, dto: UpdateVacancyDto): Promise<Vacancy>;
  abstract delete(id: string): Promise<void>;
  abstract findByCompany(companyId: string): Promise<Vacancy[]>;
  abstract countByFilters(filters?: VacancyFilters): Promise<number>;
}
