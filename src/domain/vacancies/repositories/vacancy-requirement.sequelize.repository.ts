import { Injectable, Logger } from '@nestjs/common';
import { VacancyRequirement } from '../vacancy-requirement.model';
import { InjectModel } from '@nestjs/sequelize/dist/common/sequelize.decorators';
import { VacancyRequirementRepository } from '../interfaces/vacancy-requirement.repository.interface';
import {
  CreateVacancyRequirementDto,
  UpdateVacancyRequirementDto,
  VacancyRequirementFilters,
} from '../dto/vacancy-requirement.dto';
import { WhereOptions } from 'sequelize';

@Injectable()
export class VacancyRequirementSequelizeRepository implements VacancyRequirementRepository {
  private readonly logger = new Logger(VacancyRequirementSequelizeRepository.name);

  constructor(
    @InjectModel(VacancyRequirement)
    private readonly model: typeof VacancyRequirement,
  ) {}

  async findAll(filters?: VacancyRequirementFilters): Promise<VacancyRequirement[]> {
    const where: WhereOptions<VacancyRequirement> = {};

    if (filters?.vacancyId) {
      where.vacancy_id = filters.vacancyId;
    }

    this.logger.debug('FindAll: Called');
    return this.model.findAll({ where });
  }

  async findOne(id: string): Promise<VacancyRequirement | null> {
    this.logger.debug('FindOne: Called');
    return this.model.findByPk(id);
  }

  async bulkCreate(dtos: CreateVacancyRequirementDto[]): Promise<VacancyRequirement[]> {
    this.logger.debug('BulkCreate: Called');
    return this.model.bulkCreate(dtos as unknown as VacancyRequirement[]);
  }

  async create(dto: CreateVacancyRequirementDto): Promise<VacancyRequirement> {
    this.logger.debug('Create: Called');
    return this.model.create(dto as unknown as VacancyRequirement);
  }

  async update(id: string, dto: UpdateVacancyRequirementDto): Promise<VacancyRequirement> {
    this.logger.debug('Update: Called');
    const requirement = await this.model.findByPk(id);
    if (!requirement) {
      throw new Error('VacancyRequirement not found');
    }
    await requirement.update(dto as unknown as VacancyRequirement);
    return requirement;
  }

  async delete(id: string): Promise<void> {
    this.logger.debug('Delete: Called');
    const requirement = await this.model.findByPk(id);
    if (!requirement) {
      throw new Error('VacancyRequirement not found');
    }
    await requirement.destroy();
  }
}
