import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize/dist/common/sequelize.decorators';
import { VacancyBenefitRepository } from '../interfaces/vacancy-benefit.repository.interface';
import { VacancyBenefit } from '../vacancy-benefit.model';
import { WhereOptions } from 'sequelize/types/model';
import {
  CreateVacancyBenefitDto,
  UpdateVacancyBenefitDto,
  VacancyBenefitFilters,
} from '../dto/vacancy-benefit.dto';

@Injectable()
export class VacancyBenefitSequelizeRepository implements VacancyBenefitRepository {
  private readonly logger = new Logger(VacancyBenefitSequelizeRepository.name);

  constructor(
    @InjectModel(VacancyBenefit)
    private readonly model: typeof VacancyBenefit,
  ) {}

  async findAll(filters?: VacancyBenefitFilters): Promise<VacancyBenefit[]> {
    const where: WhereOptions<VacancyBenefit> = {};

    if (filters?.vacancyId) {
      where.vacancy_id = filters.vacancyId;
    }

    this.logger.debug('FindAll: Called');
    return this.model.findAll({ where });
  }

  async findOne(id: string): Promise<VacancyBenefit | null> {
    this.logger.debug('FindOne: Called');
    return this.model.findByPk(id);
  }

  async create(dto: CreateVacancyBenefitDto): Promise<VacancyBenefit> {
    this.logger.debug('Create: Called');
    return this.model.create(dto as unknown as VacancyBenefit);
  }

  async bulkCreate(dtos: CreateVacancyBenefitDto[]): Promise<VacancyBenefit[]> {
    this.logger.debug('BulkInsert: Called');
    return this.model.bulkCreate(dtos as unknown as VacancyBenefit[]);
  }

  async update(id: string, dto: UpdateVacancyBenefitDto): Promise<VacancyBenefit> {
    this.logger.debug('Update: Called');
    const benefit = await this.model.findByPk(id);
    if (!benefit) {
      throw new Error('VacancyBenefit not found');
    }
    await benefit.update(dto as unknown as VacancyBenefit);
    return benefit;
  }

  async delete(id: string): Promise<void> {
    this.logger.debug('Delete: Called');
    const benefit = await this.model.findByPk(id);
    if (!benefit) {
      throw new Error('VacancyBenefit not found');
    }
    await benefit.destroy();
  }
}
