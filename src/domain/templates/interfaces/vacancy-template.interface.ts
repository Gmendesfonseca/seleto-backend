import { DateTime } from 'luxon';
export interface VacancyTemplate {
  id: string;
  name: string;
  description?: string;
  companyId: string;
  isDefault: boolean;
  isActive: boolean;
  steps: string[]; // Step IDs
  config?: Record<string, any>;
  createdAt: DateTime;
  updatedAt: DateTime;
}

export interface VacancyTemplateFilters {
  name?: string;
  companyId?: string;
  isDefault?: boolean;
  isActive?: boolean;
}
