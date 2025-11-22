import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Step } from '../step.model';
import { StepRepository } from './step.repository.interface';
import { CreateStepDto, UpdateStepDto } from '../dto/step.dto';
import { StepFilters } from '../interfaces/step.interface';
import { Company } from '../../companies/company.model';
import { Op, WhereOptions } from 'sequelize';

@Injectable()
export class StepSequelizeRepository implements StepRepository {
  private readonly logger = new Logger(StepSequelizeRepository.name);

  constructor(
    @InjectModel(Step)
    private readonly stepModel: typeof Step,
  ) {}

  async create(createStepDto: CreateStepDto): Promise<Step> {
    this.logger.debug('StepSequelizeRepository.create: Called');
    return this.stepModel.create(createStepDto as Step);
  }

  async findAll(filters?: StepFilters): Promise<Step[]> {
    this.logger.debug('StepSequelizeRepository.findAll: Called');
    const where: WhereOptions<Step> = {};

    if (filters?.templateId) {
      where.template_id = filters.templateId;
    }
    if (filters?.name) {
      where.name = { [Op.iLike]: `%${filters.name}%` };
    }
    if (filters?.type) {
      where.type = filters.type;
    }
    if (filters?.isRequired !== undefined) {
      where.is_required = filters.isRequired;
    }

    return this.stepModel.findAll({
      where,
      include: [
        {
          model: Company,
          attributes: ['id', 'name'],
        },
      ],
    });
  }

  async findOne(id: string): Promise<Step | null> {
    this.logger.debug('StepSequelizeRepository.findOne: Called');
    return this.stepModel.findOne({
      where: { id },
      include: [
        {
          model: Company,
          attributes: ['id', 'name'],
        },
      ],
    });
  }

  async update(id: string, updateStepDto: UpdateStepDto): Promise<Step> {
    this.logger.debug('StepSequelizeRepository.update: Called');
    const step = await this.stepModel.findByPk(id);
    if (!step) {
      throw new Error('Step not found');
    }

    await step.update(updateStepDto as any);
    return step;
  }

  async delete(id: string): Promise<void> {
    this.logger.debug('StepSequelizeRepository.delete: Called');
    await this.stepModel.destroy({ where: { id } });
  }

  async findByTemplate(templateId: string): Promise<Step[]> {
    this.logger.debug('StepSequelizeRepository.findByTemplate: Called');
    return this.stepModel.findAll({
      where: { template_id: templateId },
    });
  }

  async findByTemplateOrdered(templateId: string): Promise<Step[]> {
    this.logger.debug('StepSequelizeRepository.findByTemplateOrdered: Called');
    return this.stepModel.findAll({
      where: { template_id: templateId },
      order: [['order', 'ASC']],
    });
  }

  async countByFilters(filters?: StepFilters): Promise<number> {
    this.logger.debug('StepSequelizeRepository.countByFilters: Called');
    const where: WhereOptions<Step> = {};

    if (filters?.templateId) {
      where.template_id = filters.templateId;
    }
    if (filters?.name) {
      where.name = { [Op.iLike]: `%${filters.name}%` };
    }
    if (filters?.type) {
      where.type = filters.type;
    }
    if (filters?.isRequired !== undefined) {
      where.is_required = filters.isRequired;
    }

    return this.stepModel.count({ where });
  }
}
