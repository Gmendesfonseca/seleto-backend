import { DateTime } from 'luxon';

export interface Step {
  id: string;
  templateId: string;
  name: string;
  description?: string;
  order: number;
  type: StepType;
  isRequired: boolean;
  estimatedDuration?: number; // in minutes
  config?: Record<string, any>;
  createdAt: DateTime;
  updatedAt: DateTime;
}

export const StepType = {
  APPLICATION: 'application',
  SCREENING: 'screening',
  INTERVIEW: 'interview',
  TECHNICAL_TEST: 'technical_test',
  BACKGROUND_CHECK: 'background_check',
  OFFER: 'offer',
  ONBOARDING: 'onboarding',
  CUSTOM: 'custom',
} as const;
export type StepType = (typeof StepType)[keyof typeof StepType];

export interface StepFilters {
  templateId?: string;
  name?: string;
  type?: StepType;
}
