export class CreateVacancyTemplateDto {
  name: string;
  description?: string;
  companyId: string;
  isDefault?: boolean;
  isActive: boolean;
  steps: string[];
  config?: Record<string, any>;
}

export class UpdateVacancyTemplateDto {
  name?: string;
  description?: string;
  isDefault?: boolean;
  isActive?: boolean;
  steps?: string[];
  config?: Record<string, any>;
}

export class VacancyTemplateQueryDto {
  name?: string;
  companyId?: string;
  isDefault?: boolean;
  isActive?: boolean;
}

export class VacancyTemplateResponseDto {
  id: string;
  name: string;
  description?: string;
  companyId: string;
  isDefault: boolean;
  isActive: boolean;
  steps: string[];
  config?: Record<string, any>;
  createdAt: DateTime;
  updatedAt: DateTime;
}
