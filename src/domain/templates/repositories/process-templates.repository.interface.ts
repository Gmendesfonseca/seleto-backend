import { VacancyTemplate } from '../vacancy-template.model';

export abstract class ProcessTemplatesRepository {
  abstract findAll(filters?: {
    limit?: number;
    offset?: number;
    search?: string;
    isDefault?: boolean;
  }): Promise<{
    templates: VacancyTemplate[];
    total: number;
    limit: number;
    offset: number;
  }>;
  abstract findOne(id: string): Promise<VacancyTemplate | null>;
  abstract create(template: any): Promise<VacancyTemplate>;
  abstract update(id: string, template: any): Promise<VacancyTemplate>;
  abstract delete(id: string): Promise<void>;
  abstract duplicate(id: string, name?: string): Promise<VacancyTemplate>;
}
