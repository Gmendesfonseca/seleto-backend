import {
  CreateVacancyResponsibilityDto,
  UpdateVacancyResponsibilityDto,
  VacancyResponsibilityFilters,
} from '../dto/vacancy-responsibility.dto';
import { VacancyResponsibility } from '../vacancy-responsibility.model';

export abstract class VacancyResponsibilityRepository {
  abstract bulkCreate(dtos: CreateVacancyResponsibilityDto[]): Promise<VacancyResponsibility[]>;
  abstract create(dto: CreateVacancyResponsibilityDto): Promise<VacancyResponsibility>;
  abstract findAll(filters?: VacancyResponsibilityFilters): Promise<VacancyResponsibility[]>;
  abstract findOne(id: string): Promise<VacancyResponsibility | null>;
  abstract update(id: string, dto: UpdateVacancyResponsibilityDto): Promise<VacancyResponsibility>;
  abstract delete(id: string): Promise<void>;
}
