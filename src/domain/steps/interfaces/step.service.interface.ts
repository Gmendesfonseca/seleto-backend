import { Step, StepFilters } from './step.interface';
import { CreateStepDto, UpdateStepDto } from '../dto/step.dto';
import { PaginatedList } from 'src/shared/interfaces';

export abstract class StepService {
  abstract create(createStepDto: CreateStepDto): Promise<Step>;
  abstract findAll(filters?: StepFilters): Promise<PaginatedList<Step>>;
  abstract findOne(id: string): Promise<Step | null>;
  abstract update(id: string, updateStepDto: UpdateStepDto): Promise<Step>;
  abstract remove(id: string): Promise<void>;
  abstract findByTemplate(templateId: string): Promise<Step[]>;
}
