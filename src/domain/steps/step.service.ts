import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { StepService } from './interfaces/step.service.interface';
import { StepRepository } from './repositories/step.repository.interface';
import { CreateStepDto, UpdateStepDto } from './dto/step.dto';
import { Step, StepFilters } from './interfaces/step.interface';

@Injectable()
export class StepServiceImpl implements StepService {
  private readonly logger = new Logger(StepServiceImpl.name);

  constructor(private readonly stepRepository: StepRepository) {}

  async create(createStepDto: CreateStepDto): Promise<Step> {
    this.logger.debug('StepService.create: Called');
    return this.stepRepository.create(createStepDto);
  }

  async findAll(filters?: StepFilters): Promise<Step[]> {
    this.logger.debug('StepService.findAll: Called');
    return this.stepRepository.findAll(filters);
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

  async reorderSteps(templateId: string, stepIds: string[]): Promise<Step[]> {
    this.logger.debug('StepService.reorderSteps: Called');
    
    // Update the order of each step
    for (let i = 0; i < stepIds.length; i++) {
      const stepId = stepIds[i];
      await this.stepRepository.update(stepId, { order: i + 1 });
    }
    
    // Return the reordered steps
    return this.stepRepository.findByTemplateOrdered(templateId);
  }
}
