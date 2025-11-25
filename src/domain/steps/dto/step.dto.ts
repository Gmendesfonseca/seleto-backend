import { DateTime } from 'luxon';
import { StepType } from '../interfaces/step.interface';

export class CreateStepDto {
  companyId: string;
  name: string;
  description?: string;
  type: StepType;
  estimatedDuration?: string;
  templateId: string | null;
}

export class UpdateStepDto {
  name?: string;
  description?: string;
  type?: StepType;
  estimatedDuration?: number;
  templateId?: string | null;
}

export class StepQueryDto {
  name?: string;
  type?: StepType;
  templateId?: string;
}

export class StepResponseDto {
  id: string;
  templateId: string;
  name: string;
  description?: string;
  type: StepType;
  estimatedDuration?: number;
  config?: Record<string, any>;
  createdAt: DateTime;
  updatedAt: DateTime;
}
