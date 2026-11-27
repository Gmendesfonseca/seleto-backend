import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CandidateVacancyMatch } from '../candidate-vacancy-match.model';
import { CandidateVacancyMatchRepository } from '../interfaces/candidate-vacancy-match.repository.interface';
import { CandidateVacancyMatchFilters } from '../interfaces/candidate-vacancy-match.interface';
import { WhereOptions, Op } from 'sequelize';

@Injectable()
export class CandidateVacancyMatchSequelizeRepository implements CandidateVacancyMatchRepository {
  private readonly logger = new Logger(CandidateVacancyMatchSequelizeRepository.name);

  constructor(
    @InjectModel(CandidateVacancyMatch)
    private readonly model: typeof CandidateVacancyMatch,
  ) {}

  async create(data: Partial<CandidateVacancyMatch>): Promise<CandidateVacancyMatch> {
    this.logger.debug('CandidateVacancyMatchSequelizeRepository.create: Called');
    return this.model.create({
      personId: data.personId,
      vacancyId: data.vacancyId,
      matchScore: data.matchScore,
      scoreBreakdown: data.scoreBreakdown,
      matchedCompetencesCount: data.matchedCompetencesCount || 0,
      requiredCompetencesCount: data.requiredCompetencesCount || 0,
      totalCompetencesCount: data.totalCompetencesCount || 0,
      calculatedAt: data.calculatedAt || new Date(),
    } as any);
  }

  async findAll(filters?: CandidateVacancyMatchFilters): Promise<CandidateVacancyMatch[]> {
    this.logger.debug('CandidateVacancyMatchSequelizeRepository.findAll: Called');
    const where: WhereOptions<CandidateVacancyMatch> = {};

    if (filters?.personId) {
      where.personId = filters.personId;
    }

    if (filters?.vacancyId) {
      where.vacancyId = filters.vacancyId;
    }

    if (filters?.minScore !== undefined) {
      where.matchScore = { [Op.gte]: filters.minScore };
    }

    return this.model.findAll({
      where,
      limit: filters?.limit,
      offset: filters?.offset,
      order: [['match_score', 'DESC']],
    });
  }

  async findOne(id: string): Promise<CandidateVacancyMatch | null> {
    this.logger.debug('CandidateVacancyMatchSequelizeRepository.findOne: Called');
    return this.model.findByPk(id);
  }

  async findByPersonAndVacancy(
    personId: string,
    vacancyId: string,
  ): Promise<CandidateVacancyMatch | null> {
    this.logger.debug('CandidateVacancyMatchSequelizeRepository.findByPersonAndVacancy: Called');
    return this.model.findOne({
      where: {
        personId: personId,
        vacancyId: vacancyId,
      },
    });
  }

  async update(id: string, data: Partial<CandidateVacancyMatch>): Promise<CandidateVacancyMatch> {
    this.logger.debug('CandidateVacancyMatchSequelizeRepository.update: Called');
    const match = await this.model.findByPk(id);
    if (!match) {
      throw new Error('Match not found');
    }

    return match.update({
      match_score: data.matchScore,
      score_breakdown: data.scoreBreakdown,
      matched_competences_count: data.matchedCompetencesCount,
      required_competences_count: data.requiredCompetencesCount,
      total_competences_count: data.totalCompetencesCount,
      calculated_at: data.calculatedAt || new Date(),
    } as any);
  }

  async delete(id: string): Promise<void> {
    this.logger.debug('CandidateVacancyMatchSequelizeRepository.delete: Called');
    await this.model.destroy({ where: { id } });
  }

  async upsert(data: Partial<CandidateVacancyMatch>): Promise<CandidateVacancyMatch> {
    this.logger.debug('CandidateVacancyMatchSequelizeRepository.upsert: Called');

    const existing = await this.findByPersonAndVacancy(data.personId!, data.vacancyId!);

    if (existing) {
      return this.update(existing.id, data);
    } else {
      return this.create(data);
    }
  }
}
