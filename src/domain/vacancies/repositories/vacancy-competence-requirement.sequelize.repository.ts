import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Competence } from '../../competences/competence.model';
import { VacancyCompetenceRequirement } from '../../competences/vacancy-competence-requirement.model';
import { CompetenceRequirementItemDto } from '../dto/vacancy-competence-requirement.dto';
import { VacancyCompetenceRequirementRepository } from '../interfaces/vacancy-competence-requirement.repository.interface';

@Injectable()
export class VacancyCompetenceRequirementSequelizeRepository
  implements VacancyCompetenceRequirementRepository
{
  constructor(
    @InjectModel(VacancyCompetenceRequirement)
    private readonly model: typeof VacancyCompetenceRequirement,
    @InjectModel(Competence)
    private readonly competences: typeof Competence,
  ) {}

  findByVacancy(vacancyId: string): Promise<VacancyCompetenceRequirement[]> {
    return this.model.findAll({
      where: { vacancy_id: vacancyId },
      include: [{ model: Competence, attributes: ['id', 'name'] }],
      order: [['created_at', 'ASC']],
    });
  }

  async findMissingCompetenceIds(competenceIds: string[]): Promise<string[]> {
    if (competenceIds.length === 0) return [];
    const found = await this.competences.findAll({
      where: { id: competenceIds },
      attributes: ['id'],
    });
    const existing = new Set(found.map((competence) => competence.id));
    return competenceIds.filter((id) => !existing.has(id));
  }

  async replaceForVacancy(
    vacancyId: string,
    requirements: CompetenceRequirementItemDto[],
  ): Promise<VacancyCompetenceRequirement[]> {
    await this.model.sequelize!.transaction(async (transaction) => {
      await this.model.destroy({ where: { vacancy_id: vacancyId }, transaction });
      await this.model.bulkCreate(
        requirements.map((requirement) => ({
          vacancy_id: vacancyId,
          competence_id: requirement.competenceId,
          priority: requirement.priority,
          minimum_years_experience: requirement.minimumYearsExperience ?? null,
          weight: requirement.weight ?? 0,
        })) as VacancyCompetenceRequirement[],
        { transaction },
      );
    });
    return this.findByVacancy(vacancyId);
  }
}
