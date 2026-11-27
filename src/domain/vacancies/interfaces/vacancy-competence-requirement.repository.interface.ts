import { VacancyCompetenceRequirement } from '../../competences/vacancy-competence-requirement.model';
import { CompetenceRequirementItemDto } from '../dto/vacancy-competence-requirement.dto';

export abstract class VacancyCompetenceRequirementRepository {
  abstract findByVacancy(vacancyId: string): Promise<VacancyCompetenceRequirement[]>;
  abstract findMissingCompetenceIds(competenceIds: string[]): Promise<string[]>;
  abstract replaceForVacancy(
    vacancyId: string,
    requirements: CompetenceRequirementItemDto[],
  ): Promise<VacancyCompetenceRequirement[]>;
}
