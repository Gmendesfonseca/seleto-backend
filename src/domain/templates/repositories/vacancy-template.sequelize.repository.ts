import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { VacancyTemplate } from '../vacancy-template.model';
import { VacancyTemplateRepository } from './vacancy-template.repository.interface';
import { CreateVacancyTemplateDto, UpdateVacancyTemplateDto } from '../dto/vacancy-template.dto';
import { VacancyTemplateFilters } from '../interfaces/vacancy-template.interface';
import { Company } from '../../users/user.model';
import { Op, WhereOptions } from 'sequelize';

@Injectable()
export class VacancyTemplateSequelizeRepository implements VacancyTemplateRepository {
  private readonly logger = new Logger(VacancyTemplateSequelizeRepository.name);

  constructor(
    @InjectModel(VacancyTemplate)
    private readonly vacancyTemplateModel: typeof VacancyTemplate,
  ) {}

  async create(createVacancyTemplateDto: CreateVacancyTemplateDto): Promise<VacancyTemplate> {
    this.logger.debug('VacancyTemplateSequelizeRepository.create: Called');
    return this.vacancyTemplateModel.create({
      name: createVacancyTemplateDto.name,
      company_id: createVacancyTemplateDto.companyId,
    } as VacancyTemplate);
  }

  async findAll(filters?: VacancyTemplateFilters): Promise<VacancyTemplate[]> {
    this.logger.debug('VacancyTemplateSequelizeRepository.findAll: Called');
    const where: WhereOptions<VacancyTemplate> = {};

    if (filters?.name) {
      where.name = { [Op.like]: `%${filters.name}%` };
    }
    if (filters?.companyId) {
      where.company_id = filters.companyId;
    }
    if (filters?.isDefault !== undefined) {
      where.is_default = filters.isDefault;
    }
    if (filters?.isActive !== undefined) {
      where.is_active = filters.isActive;
    }

    return this.vacancyTemplateModel.findAll({
      where,
      include: [
        {
          model: Company,
          attributes: ['id', 'name'],
        },
      ],
    });
  }

  async findOne(id: string): Promise<VacancyTemplate | null> {
    this.logger.debug('VacancyTemplateSequelizeRepository.findOne: Called');
    return this.vacancyTemplateModel.findOne({
      where: { id },
      include: [
        {
          model: Company,
          attributes: ['id', 'name'],
        },
      ],
    });
  }

  async update(
    id: string,
    updateVacancyTemplateDto: UpdateVacancyTemplateDto,
  ): Promise<VacancyTemplate> {
    this.logger.debug('VacancyTemplateSequelizeRepository.update: Called');
    const template = await this.vacancyTemplateModel.findByPk(id);
    if (!template) {
      throw new Error('Vacancy template not found');
    }

    await template.update(updateVacancyTemplateDto as any);
    return template;
  }

  async delete(id: string): Promise<void> {
    this.logger.debug('VacancyTemplateSequelizeRepository.delete: Called');
    await this.vacancyTemplateModel.destroy({ where: { id } });
  }

  async findByCompany(companyId: string): Promise<VacancyTemplate[]> {
    this.logger.debug('VacancyTemplateSequelizeRepository.findByCompany: Called');
    return this.vacancyTemplateModel.findAll({
      where: { company_id: companyId },
    });
  }

  async findDefault(companyId: string): Promise<VacancyTemplate | null> {
    this.logger.debug('VacancyTemplateSequelizeRepository.findDefault: Called');
    return this.vacancyTemplateModel.findOne({
      where: {
        company_id: companyId,
        is_default: true,
      },
    });
  }

  async countByFilters(filters?: VacancyTemplateFilters): Promise<number> {
    this.logger.debug('VacancyTemplateSequelizeRepository.countByFilters: Called');
    const where: WhereOptions<VacancyTemplate> = {};

    if (filters?.name) {
      where.name = { [Op.like]: `%${filters.name}%` };
    }
    if (filters?.companyId) {
      where.company_id = filters.companyId;
    }
    if (filters?.isDefault !== undefined) {
      where.is_default = filters.isDefault;
    }
    if (filters?.isActive !== undefined) {
      where.is_active = filters.isActive;
    }

    return this.vacancyTemplateModel.count({ where });
  }
}
