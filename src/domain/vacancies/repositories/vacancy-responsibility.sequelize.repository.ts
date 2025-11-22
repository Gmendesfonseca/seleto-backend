import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize/dist/common/sequelize.decorators';
import { VacancyResponsibilityRepository } from '../interfaces/vacancy-responsibility.repository.interface';
import { VacancyResponsibility } from '../vacancy-responsibility.model';
import { WhereOptions } from 'sequelize';
import {
  CreateVacancyResponsibilityDto,
  UpdateVacancyResponsibilityDto,
  VacancyResponsibilityFilters,
} from '../dto/vacancy-responsibility.dto';

@Injectable()
export class VacancyResponsibilitySequelizeRepository implements VacancyResponsibilityRepository {
  private readonly logger = new Logger(VacancyResponsibilitySequelizeRepository.name);

  constructor(
    @InjectModel(VacancyResponsibility)
    private readonly model: typeof VacancyResponsibility,
  ) {}

  async findAll(filters?: VacancyResponsibilityFilters): Promise<VacancyResponsibility[]> {
    const where: WhereOptions<VacancyResponsibility> = {};

    if (filters?.vacancyId) {
      where.vacancy_id = filters.vacancyId;
    }

    this.logger.debug('FindAll: Called');
    return this.model.findAll({ where });
  }

  async findOne(id: string): Promise<VacancyResponsibility | null> {
    this.logger.debug('FindOne: Called');
    return this.model.findByPk(id);
  }

  async bulkCreate(dtos: CreateVacancyResponsibilityDto[]): Promise<VacancyResponsibility[]> {
    this.logger.debug('BulkCreate: Called');
    return this.model.bulkCreate(dtos as unknown as VacancyResponsibility[]);
  }

  async create(dto: CreateVacancyResponsibilityDto): Promise<VacancyResponsibility> {
    this.logger.debug('Create: Called');
    return this.model.create(dto as unknown as VacancyResponsibility);
  }

  async update(id: string, dto: UpdateVacancyResponsibilityDto): Promise<VacancyResponsibility> {
    this.logger.debug('Update: Called');
    const requirement = await this.model.findByPk(id);
    if (!requirement) {
      throw new Error('VacancyResponsibility not found');
    }
    await requirement.update(dto as unknown as VacancyResponsibility);
    return requirement;
  }

  async delete(id: string): Promise<void> {
    this.logger.debug('Delete: Called');
    const responsibility = await this.model.findByPk(id);
    if (!responsibility) {
      throw new Error('VacancyResponsibility not found');
    }
    await responsibility.destroy();
  }
}
