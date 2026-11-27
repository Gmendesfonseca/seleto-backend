import {
  CompetenceRequirementResponseDto,
  ReplaceCompetenceRequirementsDto,
} from '../dto/vacancy-competence-requirement.dto';

export abstract class VacancyCompetenceRequirementServiceInterface {
  abstract list(
    vacancyId: string,
    companyId: string | null,
  ): Promise<CompetenceRequirementResponseDto[]>;
  abstract replace(
    vacancyId: string,
    companyId: string | null,
    dto: ReplaceCompetenceRequirementsDto,
  ): Promise<CompetenceRequirementResponseDto[]>;
}
