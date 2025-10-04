import { Vacancy, VacancyFilters } from '../interfaces/vacancy.interface';
import { CreateVacancyDto, UpdateVacancyDto } from '../dto/vacancy.dto';

export abstract class VacancyRepository {
  abstract create(createVacancyDto: CreateVacancyDto): Promise<Vacancy>;
  abstract findAll(filters?: VacancyFilters): Promise<Vacancy[]>;
  abstract findOne(id: string): Promise<Vacancy | null>;
  abstract update(id: string, updateVacancyDto: UpdateVacancyDto): Promise<Vacancy>;
  abstract delete(id: string): Promise<void>;
  abstract findByCompany(companyId: string): Promise<Vacancy[]>;
  abstract findPublished(): Promise<Vacancy[]>;
  abstract countByFilters(filters?: VacancyFilters): Promise<number>;
}
