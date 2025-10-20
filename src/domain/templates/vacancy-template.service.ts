import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { VacancyTemplateService } from './interfaces/vacancy-template.service.interface';
import { VacancyTemplateRepository } from './repositories/vacancy-template.repository.interface';
import { CreateVacancyTemplateDto, UpdateVacancyTemplateDto } from './dto/vacancy-template.dto';
import { VacancyTemplate, VacancyTemplateFilters } from './interfaces/vacancy-template.interface';

@Injectable()
export class VacancyTemplateServiceImpl implements VacancyTemplateService {
  private readonly logger = new Logger(VacancyTemplateServiceImpl.name);

  constructor(private readonly vacancyTemplateRepository: VacancyTemplateRepository) {}

  async create(createVacancyTemplateDto: CreateVacancyTemplateDto): Promise<VacancyTemplate> {
    this.logger.debug('VacancyTemplateService.create: Called');
    return this.vacancyTemplateRepository.create(createVacancyTemplateDto);
  }

  async findAll(filters?: VacancyTemplateFilters): Promise<VacancyTemplate[]> {
    this.logger.debug('VacancyTemplateService.findAll: Called');
    return this.vacancyTemplateRepository.findAll(filters);
  }

  async findOne(id: string): Promise<VacancyTemplate | null> {
    this.logger.debug('VacancyTemplateService.findOne: Called');
    return this.vacancyTemplateRepository.findOne(id);
  }

  async update(
    id: string,
    updateVacancyTemplateDto: UpdateVacancyTemplateDto,
  ): Promise<VacancyTemplate> {
    this.logger.debug('VacancyTemplateService.update: Called');
    const template = await this.vacancyTemplateRepository.findOne(id);
    if (!template) {
      throw new NotFoundException(`Vacancy template with id ${id} not found`);
    }
    return this.vacancyTemplateRepository.update(id, updateVacancyTemplateDto);
  }

  async remove(id: string): Promise<void> {
    this.logger.debug('VacancyTemplateService.remove: Called');
    const template = await this.vacancyTemplateRepository.findOne(id);
    if (!template) {
      throw new NotFoundException(`Vacancy template with id ${id} not found`);
    }
    await this.vacancyTemplateRepository.delete(id);
  }

  async findByCompany(companyId: string): Promise<VacancyTemplate[]> {
    this.logger.debug('VacancyTemplateService.findByCompany: Called');
    return this.vacancyTemplateRepository.findByCompany(companyId);
  }

  async findDefault(companyId: string): Promise<VacancyTemplate | null> {
    this.logger.debug('VacancyTemplateService.findDefault: Called');
    return this.vacancyTemplateRepository.findDefault(companyId);
  }

  async setAsDefault(id: string): Promise<VacancyTemplate> {
    this.logger.debug('VacancyTemplateService.setAsDefault: Called');
    const template = await this.vacancyTemplateRepository.findOne(id);
    if (!template) {
      throw new NotFoundException(`Vacancy template with id ${id} not found`);
    }

    // Unset other default templates for the same company
    const companyTemplates = await this.vacancyTemplateRepository.findByCompany(
      template.companyId,
    );
    for (const t of companyTemplates) {
      if (t.id !== id && t.isDefault) {
        await this.vacancyTemplateRepository.update(t.id, { isDefault: false });
      }
    }

    // Set this template as default
    return this.vacancyTemplateRepository.update(id, { isDefault: true });
  }
}
