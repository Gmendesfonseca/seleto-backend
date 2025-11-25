import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';

import { Op, WhereOptions } from 'sequelize';
import { ProcessTemplatesRepository } from './process-templates.repository.interface';
import { VacancyTemplate } from '../vacancy-template.model';
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
      ...createProcessTemplateDto,
      company_id: createProcessTemplateDto.companyId,
    });
  }

  async findAll(filters?: any): Promise<{
    templates: VacancyTemplate[];
    total: number;
    limit: number;
    offset: number;
  }> {
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

    const templates = await this.model.findAll({
      where,
      include: [
        {
          model: Company,
          attributes: ['id'],
        },
      ],
    });

    const total = await this.model.count({ where });

    return {
      templates,
      total,
      limit: filters?.limit || total,
      offset: filters?.offset || 0,
    };
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

    await template.update(updateProcessTemplateDto);
    return template;
  }

  async delete(id: string): Promise<void> {
    this.logger.debug('ProcessTemplateSequelizeRepository.delete: Called');
    await this.model.destroy({ where: { id } });
  }

  async findByCompany(companyId: string): Promise<VacancyTemplate[]> {
    this.logger.debug('ProcessTemplateSequelizeRepository.findByCompany: Called');
    return this.model.findAll({
      where: { company_id: companyId },
    });
  }

  async findDefault(companyId: string): Promise<VacancyTemplate | null> {
    this.logger.debug('ProcessTemplateSequelizeRepository.findDefault: Called');
    return this.model.findOne({
      where: {
        company_id: companyId,
        isDefault: true,
      },
    });
  }

  async duplicate(id: string, name?: string): Promise<VacancyTemplate> {
    this.logger.debug('ProcessTemplateSequelizeRepository.duplicate: Called');
    const template = await this.model.findByPk(id);
    if (!template) {
      throw new Error('Process template not found');
    }

    const duplicatedTemplate = await this.model.create({
      ...template.toJSON(),
      name: name || `${template.name} (Copy)`,
      isDefault: false,
    } as any);

    return duplicatedTemplate;
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
