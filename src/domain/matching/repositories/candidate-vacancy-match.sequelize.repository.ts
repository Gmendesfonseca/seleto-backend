import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CandidateVacancyMatch as CandidateVacancyMatchModel } from '../candidate-vacancy-match.model';
import { CandidateVacancyMatchRepository } from '../interfaces/candidate-vacancy-match.repository.interface';
import {
  CandidateVacancyMatch,
  CandidateVacancyMatchFilters,
} from '../interfaces/candidate-vacancy-match.interface';
import { WhereOptions, Op } from 'sequelize';

@Injectable()
export class CandidateVacancyMatchSequelizeRepository implements CandidateVacancyMatchRepository {
  private readonly logger = new Logger(CandidateVacancyMatchSequelizeRepository.name);

  constructor(
    @InjectModel(CandidateVacancyMatchModel)
    private readonly model: typeof CandidateVacancyMatchModel,
  ) {}

  async create(data: Partial<CandidateVacancyMatch>): Promise<CandidateVacancyMatch> {
    this.logger.debug('CandidateVacancyMatchSequelizeRepository.create: Called');
    const match = await this.model.create({
      person_id: data.personId,
      vacancy_id: data.vacancyId,
      match_score: data.matchScore,
      score_breakdown: data.scoreBreakdown,
      matched_competences_count: data.matchedCompetencesCount || 0,
      required_competences_count: data.requiredCompetencesCount || 0,
      total_competences_count: data.totalCompetencesCount || 0,
      calculated_at: data.calculatedAt || new Date(),
    } as any);

    return this.toInterface(match);
  }

  async findAll(filters?: CandidateVacancyMatchFilters): Promise<CandidateVacancyMatch[]> {
    this.logger.debug('CandidateVacancyMatchSequelizeRepository.findAll: Called');
    const where: WhereOptions<CandidateVacancyMatchModel> = {};

    if (filters?.personId) {
      where.person_id = filters.personId;
    }

    if (filters?.vacancyId) {
      where.vacancy_id = filters.vacancyId;
    }

    if (filters?.minScore !== undefined) {
      where.match_score = { [Op.gte]: filters.minScore };
    }

    const matches = await this.model.findAll({
      where,
      limit: filters?.limit,
      offset: filters?.offset,
      order: [['match_score', 'DESC']],
    });

    return matches.map((match) => this.toInterface(match));
  }

  async findOne(id: string): Promise<CandidateVacancyMatch | null> {
    this.logger.debug('CandidateVacancyMatchSequelizeRepository.findOne: Called');
    const match = await this.model.findByPk(id);
    return match ? this.toInterface(match) : null;
  }

  async findByPersonAndVacancy(
    personId: string,
    vacancyId: string,
  ): Promise<CandidateVacancyMatch | null> {
    this.logger.debug('CandidateVacancyMatchSequelizeRepository.findByPersonAndVacancy: Called');
    const match = await this.model.findOne({
      where: {
        person_id: personId,
        vacancy_id: vacancyId,
      },
    });
    return match ? this.toInterface(match) : null;
  }

  async update(id: string, data: Partial<CandidateVacancyMatch>): Promise<CandidateVacancyMatch> {
    this.logger.debug('CandidateVacancyMatchSequelizeRepository.update: Called');
    const match = await this.model.findByPk(id);
    if (!match) {
      throw new Error('Match not found');
    }

    await match.update({
      match_score: data.matchScore,
      score_breakdown: data.scoreBreakdown,
      matched_competences_count: data.matchedCompetencesCount,
      required_competences_count: data.requiredCompetencesCount,
      total_competences_count: data.totalCompetencesCount,
      calculated_at: data.calculatedAt || new Date(),
    } as any);

    return this.toInterface(match);
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

  private toInterface(match: CandidateVacancyMatchModel): CandidateVacancyMatch {
    return {
      id: match.id,
      personId: match.person_id,
      vacancyId: match.vacancy_id,
      matchScore: Number(match.match_score),
      scoreBreakdown: match.score_breakdown || {
        competence_match: 0,
        experience_match: 0,
        education_match: 0,
        location_match: 0,
        salary_match: 0,
      },
      matchedCompetencesCount: match.matched_competences_count,
      requiredCompetencesCount: match.required_competences_count,
      totalCompetencesCount: match.total_competences_count,
      calculatedAt: match.calculated_at,
      createdAt: match.created_at,
      updatedAt: match.updated_at,
    };
  }
}
