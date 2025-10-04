import { VacancyTemplate, VacancyTemplateFilters } from '../interfaces/vacancy-template.interface';
import { CreateVacancyTemplateDto, UpdateVacancyTemplateDto } from '../dto/vacancy-template.dto';

export abstract class VacancyTemplateRepository {
  abstract create(createVacancyTemplateDto: CreateVacancyTemplateDto): Promise<VacancyTemplate>;
  abstract findAll(filters?: VacancyTemplateFilters): Promise<VacancyTemplate[]>;
  abstract findOne(id: string): Promise<VacancyTemplate | null>;
  abstract update(
    id: string,
    updateVacancyTemplateDto: UpdateVacancyTemplateDto,
  ): Promise<VacancyTemplate>;
  abstract delete(id: string): Promise<void>;
  abstract findByCompany(companyId: string): Promise<VacancyTemplate[]>;
  abstract findDefault(companyId: string): Promise<VacancyTemplate | null>;
  abstract countByFilters(filters?: VacancyTemplateFilters): Promise<number>;
}
