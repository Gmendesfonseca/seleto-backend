import { StepFilters } from '../interfaces/step.interface';
import { CreateStepDto, UpdateStepDto } from '../dto/step.dto';
import { Step } from '../step.model';

export abstract class StepRepository {
  abstract create(createStepDto: CreateStepDto): Promise<Step>;
  abstract findAll(filters?: StepFilters): Promise<Step[]>;
  abstract findOne(id: string): Promise<Step | null>;
  abstract update(id: string, updateStepDto: UpdateStepDto): Promise<Step>;
  abstract delete(id: string): Promise<void>;
  abstract findByTemplate(templateId: string): Promise<Step[]>;
  abstract findByTemplateOrdered(templateId: string): Promise<Step[]>;
  abstract countByFilters(filters?: StepFilters): Promise<number>;
}
