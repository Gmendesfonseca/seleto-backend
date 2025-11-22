import {
  CreateVacancyRequirementDto,
  UpdateVacancyRequirementDto,
  VacancyRequirementFilters,
} from '../dto/vacancy-requirement.dto';
import { VacancyRequirement } from '../vacancy-requirement.model';

export abstract class VacancyRequirementRepository {
  abstract bulkCreate(dtos: CreateVacancyRequirementDto[]): Promise<VacancyRequirement[]>;
  abstract create(dto: CreateVacancyRequirementDto): Promise<VacancyRequirement>;
  abstract findAll(filters?: VacancyRequirementFilters): Promise<VacancyRequirement[]>;
  abstract findOne(id: string): Promise<VacancyRequirement | null>;
  abstract update(id: string, dto: UpdateVacancyRequirementDto): Promise<VacancyRequirement>;
  abstract delete(id: string): Promise<void>;
}
