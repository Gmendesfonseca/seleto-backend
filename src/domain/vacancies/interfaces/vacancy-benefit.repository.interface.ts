import {
  CreateVacancyBenefitDto,
  UpdateVacancyBenefitDto,
  VacancyBenefitFilters,
} from '../dto/vacancy-benefit.dto';
import { VacancyBenefit } from '../vacancy-benefit.model';

export abstract class VacancyBenefitRepository {
  abstract bulkCreate(dtos: CreateVacancyBenefitDto[]): Promise<VacancyBenefit[]>;
  abstract create(dto: CreateVacancyBenefitDto): Promise<VacancyBenefit>;
  abstract findAll(filters?: VacancyBenefitFilters): Promise<VacancyBenefit[]>;
  abstract findOne(id: string): Promise<VacancyBenefit | null>;
  abstract update(id: string, dto: UpdateVacancyBenefitDto): Promise<VacancyBenefit>;
  abstract delete(id: string): Promise<void>;
}
