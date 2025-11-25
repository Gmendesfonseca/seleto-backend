import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';

import { Op, WhereOptions } from 'sequelize';
import { ProcessTemplatesRepository } from './process-templates.repository.interface';
import { VacancyTemplate } from '../vacancy-template.model';
import { ProcessTemplate } from '../interfaces/process-template.service.interface';
import { Company } from 'src/domain/companies/company.model';

@Injectable()
export class ProcessTemplateSequelizeRepository implements ProcessTemplatesRepository {
  private readonly logger = new Logger(ProcessTemplateSequelizeRepository.name);

  constructor(
    @InjectModel(VacancyTemplate)
    private readonly model: typeof VacancyTemplate,
  ) {}

  async create(createProcessTemplateDto: any): Promise<VacancyTemplate> {
    this.logger.debug('ProcessTemplateSequelizeRepository.create: Called');
    return this.model.create({
      name: createProcessTemplateDto.name,
      company_id: createProcessTemplateDto.companyId,
    } as ProcessTemplate);
  }

  async findAll(filters?: any): Promise<ProcessTemplate[]> {
    this.logger.debug('ProcessTemplateSequelizeRepository.findAll: Called');
    const where: WhereOptions<VacancyTemplate> = {};

    if (filters?.name) {
      where.name = { [Op.iLike]: `%${filters.name}%` };
    }
    if (filters?.companyId) {
      where.company_id = filters.companyId;
    }
    if (filters?.isDefault !== undefined) {
      where.isDefault = filters.isDefault;
    }
    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    return this.model.findAll({
      where,
      include: [
        {
          model: Company,
          attributes: ['id'],
        },
      ],
    });
  }

  async findOne(id: string): Promise<VacancyTemplate | null> {
    this.logger.debug('ProcessTemplateSequelizeRepository.findOne: Called');
    return this.model.findOne({
      where: { id },
      include: [
        {
          model: Company,
          attributes: ['id'],
        },
      ],
    });
  }

  async update(id: string, updateProcessTemplateDto: any): Promise<VacancyTemplate> {
    this.logger.debug('ProcessTemplateSequelizeRepository.update: Called');
    const template = await this.model.findByPk(id);
    if (!template) {
      throw new Error('Process template not found');
    }

    await template.update(updateProcessTemplateDto as any);
    return template;
  }

  async delete(id: string): Promise<void> {
    this.logger.debug('ProcessTemplateSequelizeRepository.delete: Called');
    await this.model.destroy({ where: { id } });
  }

  async findByCompany(companyId: string): Promise<ProcessTemplate[]> {
    this.logger.debug('ProcessTemplateSequelizeRepository.findByCompany: Called');
    return this.model.findAll({
      where: { company_id: companyId },
    });
  }

  async findDefault(companyId: string): Promise<ProcessTemplate | null> {
    this.logger.debug('ProcessTemplateSequelizeRepository.findDefault: Called');
    return this.model.findOne({
      where: {
        company_id: companyId,
        is_default: true,
      },
    });
  }

  async countByFilters(filters?: any): Promise<number> {
    this.logger.debug('ProcessTemplateSequelizeRepository.countByFilters: Called');
    const where: WhereOptions<VacancyTemplate> = {};

    if (filters?.name) {
      where.name = { [Op.iLike]: `%${filters.name}%` };
    }
    if (filters?.companyId) {
      where.company_id = filters.companyId;
    }
    if (filters?.isDefault !== undefined) {
      where.isDefault = filters.isDefault;
    }
    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    return this.model.count({ where });
  }
}
