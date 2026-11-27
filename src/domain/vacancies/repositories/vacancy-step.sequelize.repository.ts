import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize/dist/common/sequelize.decorators';
import { VacancyStepRepository } from '../interfaces/vacancy-step.repository.interface';
import { VacancyStep } from '../vacancy-step.model';
import { WhereOptions } from 'sequelize/types/model';
import {
  CreateVacancyStepDto,
  UpdateVacancyStepDto,
  VacancyStepFilters,
} from '../dto/vacancy-step.dto';

@Injectable()
export class VacancyStepSequelizeRepository implements VacancyStepRepository {
  private readonly logger = new Logger(VacancyStepSequelizeRepository.name);

  constructor(
    @InjectModel(VacancyStep)
    private readonly model: typeof VacancyStep,
  ) {}

  async findAll(filters?: VacancyStepFilters): Promise<VacancyStep[]> {
    const where: WhereOptions<VacancyStep> = {};

    if (filters?.vacancyId) {
      where.vacancyId = filters.vacancyId;
    }

    this.logger.debug('FindAll: Called');
    return this.model.findAll({ where });
  }

  async findByVacancyId(vacancyId: string): Promise<VacancyStep[]> {
    this.logger.debug('FindByVacancyId: Called');
    return this.model.findAll({ where: { vacancyId }, order: [['order', 'ASC']] });
  }

  async findOne(id: string): Promise<VacancyStep | null> {
    this.logger.debug('FindOne: Called');
    return this.model.findByPk(id);
  }

  async create(dto: CreateVacancyStepDto): Promise<VacancyStep> {
    this.logger.debug('Create: Called');
    return this.model.create(dto as unknown as VacancyStep);
  }

  async bulkCreate(dtos: CreateVacancyStepDto[]): Promise<VacancyStep[]> {
    this.logger.debug('BulkInsert: Called');
    return this.model.bulkCreate(dtos as unknown as VacancyStep[]);
  }

  async update(id: string, dto: UpdateVacancyStepDto): Promise<VacancyStep> {
    this.logger.debug('Update: Called');
    const step = await this.model.findByPk(id);
    if (!step) {
      throw new Error('VacancyStep not found');
    }
    await step.update(dto as unknown as VacancyStep);
    return step;
  }

  async delete(id: string): Promise<void> {
    this.logger.debug('Delete: Called');
    const step = await this.model.findByPk(id);
    if (!step) {
      throw new Error('VacancyStep not found');
    }
    await step.destroy();
  }
}
