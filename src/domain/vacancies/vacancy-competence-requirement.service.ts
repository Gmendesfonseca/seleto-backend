import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { VacancyCompetenceRequirement } from '../competences/vacancy-competence-requirement.model';
import {
  CompetenceRequirementResponseDto,
  ReplaceCompetenceRequirementsDto,
} from './dto/vacancy-competence-requirement.dto';
import { VacancyCompetenceRequirementRepository } from './interfaces/vacancy-competence-requirement.repository.interface';
import { VacancyCompetenceRequirementServiceInterface } from './interfaces/vacancy-competence-requirement.service.interface';
import { VacancyRepository } from './interfaces/vacancy.repository.interface';
import { assertVacancyBelongsTo } from './vacancy-ownership';

@Injectable()
export class VacancyCompetenceRequirementService
  implements VacancyCompetenceRequirementServiceInterface
{
  constructor(
    private readonly vacancies: VacancyRepository,
    private readonly requirements: VacancyCompetenceRequirementRepository,
  ) {}

  async list(
    vacancyId: string,
    companyId: string | null,
  ): Promise<CompetenceRequirementResponseDto[]> {
    await assertVacancyBelongsTo(this.vacancies, vacancyId, companyId);
    const rows = await this.requirements.findByVacancy(vacancyId);
    return rows.map(toResponse);
  }

  async replace(
    vacancyId: string,
    companyId: string | null,
    dto: ReplaceCompetenceRequirementsDto,
  ): Promise<CompetenceRequirementResponseDto[]> {
    await assertVacancyBelongsTo(this.vacancies, vacancyId, companyId);

    const competenceIds = dto.requirements.map((requirement) => requirement.competenceId);
    if (new Set(competenceIds).size !== competenceIds.length) {
      throw new UnprocessableEntityException('Each competence can be required only once');
    }
    const missing = await this.requirements.findMissingCompetenceIds(competenceIds);
    if (missing.length > 0) {
      throw new UnprocessableEntityException(`Unknown competences: ${missing.join(', ')}`);
    }

    const rows = await this.requirements.replaceForVacancy(vacancyId, dto.requirements);
    return rows.map(toResponse);
  }
}

function toResponse(row: VacancyCompetenceRequirement): CompetenceRequirementResponseDto {
  return {
    id: row.id,
    competenceId: row.competence_id,
    competenceName: row.competence?.name ?? '',
    priority: row.priority,
    minimumYearsExperience: row.minimum_years_experience ?? null,
    weight: row.weight,
  };
}
