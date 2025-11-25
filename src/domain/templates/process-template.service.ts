import { Injectable, Logger } from '@nestjs/common';
import {
  ProcessTemplateServiceInterface,
  ProcessTemplate,
  ProcessTemplateFilters,
} from './interfaces/process-template.service.interface';
import { ProcessTemplatesRepository } from './repositories/process-templates.repository.interface';
import { StepRepository } from '../steps';

@Injectable()
export class ProcessTemplateService implements ProcessTemplateServiceInterface {
  private readonly logger = new Logger(ProcessTemplateService.name);

  constructor(
    private readonly repository: ProcessTemplatesRepository,
    private readonly stepRepository: StepRepository,
  ) {}

  async findAll(filters?: ProcessTemplateFilters): Promise<{
    templates: ProcessTemplate[];
    total: number;
    limit: number;
    offset: number;
  }> {
    this.logger.debug('ProcessTemplateServiceImpl.findAll: Called', { filters });
    const models = await this.repository.findAll(filters);
    return models;
  }

  async findOne(id: string): Promise<ProcessTemplate> {
    this.logger.debug('ProcessTemplateServiceImpl.findOne: Called', { id });
    return this.repository.findOne(id);
  }

  async create(template: any): Promise<ProcessTemplate> {
    this.logger.debug('ProcessTemplateServiceImpl.create: Called', { template });
    const model = await this.repository.create(template);
    await Promise.all(
      template.stages?.map((step) =>
        this.stepRepository.create({
          name: step.name,
          description: step.description ?? undefined,
          estimatedDuration: step.estimatedDuration,
          type: step.type,
          templateId: model.id,
          companyId: template.companyId,
        }),
      ) || [],
    );
    return model;
  }

  async update(id: string, template: any): Promise<ProcessTemplate> {
    this.logger.debug('ProcessTemplateServiceImpl.update: Called', { id, template });
    return this.repository.update(id, template);
  }

  async remove(id: string): Promise<void> {
    this.logger.debug('ProcessTemplateServiceImpl.remove: Called', { id });
    return this.repository.delete(id);
  }

  async duplicate(id: string, name?: string): Promise<ProcessTemplate> {
    this.logger.debug('ProcessTemplateServiceImpl.duplicate: Called', { id, name });
    return this.repository.duplicate(id, name);
  }

  async getDefaults(): Promise<ProcessTemplate[]> {
    this.logger.debug('ProcessTemplateServiceImpl.getDefaults: Called');
    const { templates } = await this.repository.findAll({ isDefault: true });
    return templates;
  }
}
