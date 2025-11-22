import { StepType } from '../interfaces/step.interface';

export class CreateStepDto {
  templateId: string;
  name: string;
  description?: string;
  order: number;
  type: StepType;
  isRequired: boolean;
  estimatedDuration?: number;
  config?: Record<string, any>;
}

export class UpdateStepDto {
  name?: string;
  description?: string;
  order?: number;
  type?: StepType;
  isRequired?: boolean;
  estimatedDuration?: number;
  config?: Record<string, any>;
}

export class StepQueryDto {
  templateId?: string;
  name?: string;
  type?: StepType;
  isRequired?: boolean;
}

export class StepResponseDto {
  id: string;
  templateId: string;
  name: string;
  description?: string;
  order: number;
  type: StepType;
  isRequired: boolean;
  estimatedDuration?: number;
  config?: Record<string, any>;
  createdAt: DateTime;
  updatedAt: DateTime;
}
