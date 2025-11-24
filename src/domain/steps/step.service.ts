import { Injectable, Inject, Logger, NotFoundException } from '@nestjs/common';
import { StepService } from './interfaces/step.service.interface';
import { StepRepository } from './repositories/step.repository.interface';
import { CreateStepDto, UpdateStepDto } from './dto/step.dto';
import { Step, StepFilters } from './interfaces/step.interface';
import { PaginatedList } from 'src/shared/interfaces';

@Injectable()
export class StepServiceImpl implements StepService {
  private readonly logger = new Logger(StepServiceImpl.name);

  constructor(
    @Inject(StepRepository)
    private readonly stepRepository: StepRepository,
  ) {}

  async create(createStepDto: CreateStepDto): Promise<Step> {
    this.logger.debug('StepService.create: Called');
    return this.stepRepository.create(createStepDto);
  }

  async findAll(filters?: StepFilters): Promise<PaginatedList<Step>> {
    this.logger.debug('StepService.findAll: Called');
    const models = await this.stepRepository.findAll(filters);
    return {
      data: models,
      meta: { total: models.length, currentPage: 1, lastPage: 1, perPage: models.length },
    };
  }

  async findOne(id: string): Promise<Step | null> {
    this.logger.debug('StepService.findOne: Called');
    return this.stepRepository.findOne(id);
  }

  async update(id: string, updateStepDto: UpdateStepDto): Promise<Step> {
    this.logger.debug('StepService.update: Called');
    const step = await this.stepRepository.findOne(id);
    if (!step) {
      throw new NotFoundException(`Step with id ${id} not found`);
    }
    return this.stepRepository.update(id, updateStepDto);
  }

  async remove(id: string): Promise<void> {
    this.logger.debug('StepService.remove: Called');
    const step = await this.stepRepository.findOne(id);
    if (!step) {
      throw new NotFoundException(`Step with id ${id} not found`);
    }
    await this.stepRepository.delete(id);
  }

  async findByTemplate(templateId: string): Promise<Step[]> {
    this.logger.debug('StepService.findByTemplate: Called');
    return this.stepRepository.findByTemplateOrdered(templateId);
  }
}
