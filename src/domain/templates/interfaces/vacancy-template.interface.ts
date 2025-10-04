export interface VacancyTemplate {
  id: string;
  name: string;
  description?: string;
  companyId: string;
  isDefault: boolean;
  isActive: boolean;
  steps: string[]; // Step IDs
  config?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface VacancyTemplateFilters {
  name?: string;
  companyId?: string;
  isDefault?: boolean;
  isActive?: boolean;
}
