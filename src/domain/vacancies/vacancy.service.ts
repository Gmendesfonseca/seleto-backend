import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
  VacancyServiceInterface,
  CreateVacancyResult,
} from './interfaces/vacancy.service.interface';
import { VacancyRepository } from './interfaces/vacancy.repository.interface';
import { CreateVacancyDto, UpdateVacancyDto } from './dto/vacancy.dto';
import { VacancyFilters, VacancyStatus } from './interfaces/vacancy.interface';
import { Vacancy } from './vacancy.model';
import { PaginatedList } from 'src/shared/interfaces';
import { VacancyBenefitRepository } from './interfaces/vacancy-benefit.repository.interface';
import { VacancyRequirementRepository } from './interfaces/vacancy-requirement.repository.interface';
import { VacancyResponsibilityRepository } from './interfaces/vacancy-responsibility.repository.interface';
import { VacancyStepRepository } from './interfaces/vacancy-step.repository.interface';
import { MatchingService } from '../matching/matching.service';
import { CandidateVacancyMatch } from '../matching/interfaces/candidate-vacancy-match.interface';

@Injectable()
export class VacancyService implements VacancyServiceInterface {
  private readonly logger = new Logger(VacancyService.name);

  constructor(
    private readonly repository: VacancyRepository,
    private readonly benefitRepository: VacancyBenefitRepository,
    private readonly requirementRepository: VacancyRequirementRepository,
    private readonly responsibilityRepository: VacancyResponsibilityRepository,
    private readonly stepRepository: VacancyStepRepository,
    private readonly matchingService: MatchingService,
  ) {}

  async findOne(id: string): Promise<Vacancy | null> {
    this.logger.debug('VacancyService.findOne: Called');
    return this.repository.findOne(id);
  }

  async findAll(filters?: VacancyFilters): Promise<PaginatedList<Vacancy>> {
    this.logger.debug('VacancyService.findAll: Called');
    const models = await this.repository.findAll(filters);
    return {
      data: models,
      meta: { total: models.length, currentPage: 1, lastPage: 1, perPage: models.length },
    };
  }

  async create({
    benefits,
    responsibilities,
    requirements,
    steps,
    ...dto
  }: CreateVacancyDto): Promise<CreateVacancyResult> {
    this.logger.debug('VacancyService.create: Called');

    const model = await this.repository.create(dto);

    const benefitModels = await this.benefitRepository.bulkCreate(
      benefits?.map((benefit) => ({ benefit, vacancyId: model.id })) || [],
    );
    const responsibilityModels = await this.responsibilityRepository.bulkCreate(
      responsibilities?.map((responsibility) => ({ responsibility, vacancyId: model.id })) || [],
    );
    const requirementModels = await this.requirementRepository.bulkCreate(
      requirements?.map((requirement) => ({ requirement, vacancyId: model.id })) || [],
    );
    const stepModels = await this.stepRepository.bulkCreate(
      steps?.map((step, index) => ({
        stepId: step,
        vacancyId: model.id,
        order: index,
      })) || [],
    );

    return {
      ...model.get(),
      benefits: benefitModels.map((b) => b.benefit),
      responsibilities: responsibilityModels.map((r) => r.responsibility),
      requirements: requirementModels.map((r) => r.requirement),
      steps: stepModels,
    };
  }

  async update(id: string, updateVacancyDto: UpdateVacancyDto): Promise<Vacancy> {
    this.logger.debug('VacancyService.update: Called');
    const vacancy = await this.repository.findOne(id);
    if (!vacancy) {
      throw new NotFoundException(`Vacancy with id ${id} not found`);
    }
    return this.repository.update(id, updateVacancyDto);
  }

  async remove(id: string): Promise<void> {
    this.logger.debug('VacancyService.remove: Called');
    const vacancy = await this.repository.findOne(id);
    if (!vacancy) {
      throw new NotFoundException(`Vacancy with id ${id} not found`);
    }
    await this.repository.delete(id);
  }

  async findByCompany(companyId: string): Promise<Vacancy[]> {
    this.logger.debug('VacancyService.findByCompany: Called');
    return this.repository.findByCompany(companyId);
  }

  async findPublished(): Promise<PaginatedList<Vacancy>> {
    this.logger.debug('VacancyService.findPublished: Called');
    const models = await this.repository.findAll({ status: VacancyStatus.PUBLISHED });
    return {
      data: models,
      meta: { total: models.length, currentPage: 1, lastPage: 1, perPage: models.length },
    };
  }

  async publishVacancy(id: string): Promise<Vacancy> {
    this.logger.debug('VacancyService.publishVacancy: Called');
    return this.update(id, { status: VacancyStatus.PUBLISHED });
  }

  async closeVacancy(id: string): Promise<Vacancy> {
    this.logger.debug('VacancyService.closeVacancy: Called');
    return this.update(id, { status: VacancyStatus.CLOSED });
  }

  async findBestCandidates(
    vacancyId: string,
    minScore?: number,
    limit?: number,
  ): Promise<CandidateVacancyMatch[]> {
    this.logger.debug('VacancyService.findBestCandidates: Called');
    return this.matchingService.findMatchesForVacancy(vacancyId, minScore, limit);
  }

  async getBestCandidate(vacancyId: string): Promise<CandidateVacancyMatch | null> {
    this.logger.debug('VacancyService.getBestCandidate: Called');
    return this.matchingService.getBestMatchForVacancy(vacancyId);
  }
}
