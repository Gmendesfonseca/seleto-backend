import { Injectable, Inject, Logger, NotFoundException } from '@nestjs/common';
import { VacancyTemplateServiceInterface } from './interfaces/vacancy-template.service.interface';
import { VacancyTemplateRepository } from './repositories/vacancy-template.repository.interface';
import { CreateVacancyTemplateDto, UpdateVacancyTemplateDto } from './dto/vacancy-template.dto';
import { VacancyTemplate, VacancyTemplateFilters } from './interfaces/vacancy-template.interface';

@Injectable()
export class VacancyTemplateService implements VacancyTemplateServiceInterface {
  private readonly logger = new Logger(VacancyTemplateService.name);

  constructor(
    @Inject(VacancyTemplateRepository)
    private readonly repository: VacancyTemplateRepository,
  ) {}

  async findAll(filters?: VacancyTemplateFilters): Promise<VacancyTemplate[]> {
    this.logger.debug('VacancyTemplateService.findAll: Called');
    return this.repository.findAll(filters);
  }

  async findOne(id: string): Promise<VacancyTemplate | null> {
    this.logger.debug('VacancyTemplateService.findOne: Called');
    return this.repository.findOne(id);
  }

  async create(dto: CreateVacancyTemplateDto): Promise<VacancyTemplate> {
    this.logger.debug('VacancyTemplateService.create: Called');
    return this.repository.create(dto);
  }

  async update(id: string, dto: UpdateVacancyTemplateDto): Promise<VacancyTemplate> {
    this.logger.debug('VacancyTemplateService.update: Called');
    const template = await this.repository.findOne(id);
    if (!template) {
      throw new NotFoundException(`Vacancy template with id ${id} not found`);
    }
    return this.repository.update(id, dto);
  }

  async remove(id: string): Promise<void> {
    this.logger.debug('VacancyTemplateService.remove: Called');
    const template = await this.repository.findOne(id);
    if (!template) {
      throw new NotFoundException(`Vacancy template with id ${id} not found`);
    }
    await this.repository.delete(id);
  }

  async findByCompany(companyId: string): Promise<VacancyTemplate[]> {
    this.logger.debug('VacancyTemplateService.findByCompany: Called');
    return this.repository.findByCompany(companyId);
  }

  async findDefault(companyId: string): Promise<VacancyTemplate | null> {
    this.logger.debug('VacancyTemplateService.findDefault: Called');
    return this.repository.findDefault(companyId);
  }

  async setAsDefault(id: string): Promise<VacancyTemplate> {
    this.logger.debug('VacancyTemplateService.setAsDefault: Called');
    const template = await this.repository.findOne(id);
    if (!template) {
      throw new NotFoundException(`Vacancy template with id ${id} not found`);
    }

    // Unset other default templates for the same company
    const companyTemplates = await this.repository.findByCompany(template.companyId);
    for (const t of companyTemplates) {
      if (t.id !== id && t.isDefault) {
        await this.repository.update(t.id, { isDefault: false });
      }
    }

    // Set this template as default
    return this.repository.update(id, { isDefault: true });
  }
}
