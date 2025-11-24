import {
  CreateVacancyStepDto,
  UpdateVacancyStepDto,
  VacancyStepFilters,
} from '../dto/vacancy-step.dto';
import { VacancyStep } from '../vacancy-step.model';

export abstract class VacancyStepRepository {
  abstract bulkCreate(dtos: CreateVacancyStepDto[]): Promise<VacancyStep[]>;
  abstract create(dto: CreateVacancyStepDto): Promise<VacancyStep>;
  abstract findAll(filters?: VacancyStepFilters): Promise<VacancyStep[]>;
  abstract findOne(id: string): Promise<VacancyStep | null>;
  abstract update(id: string, dto: UpdateVacancyStepDto): Promise<VacancyStep>;
  abstract delete(id: string): Promise<void>;
  abstract findByVacancyId(vacancyId: string): Promise<VacancyStep[]>;
}
