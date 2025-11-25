import { DateTime } from 'luxon';

export interface ProcessTemplate {
  id: string;
  name: string;
  description?: string;
  category?: string;
  isDefault: boolean;
  companyId?: string;
  steps: any[];
  createdAt: DateTime;
  updatedAt: DateTime;
}

export interface ProcessTemplateFilters {
  companyId?: string;
  category?: string;
  isDefault?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}

export abstract class ProcessTemplateServiceInterface {
  abstract findAll(filters?: ProcessTemplateFilters): Promise<{
    templates: ProcessTemplate[];
    total: number;
    limit: number;
    offset: number;
  }>;
  abstract findOne(id: string): Promise<ProcessTemplate>;
  abstract create(template: any): Promise<ProcessTemplate>;
  abstract update(id: string, template: any): Promise<ProcessTemplate>;
  abstract remove(id: string): Promise<void>;
  abstract duplicate(id: string, name?: string): Promise<ProcessTemplate>;
  abstract getDefaults(): Promise<ProcessTemplate[]>;
}
