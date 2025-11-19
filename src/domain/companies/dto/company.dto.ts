import { PaginatedList } from '../../../shared/interfaces/entities/pagination.interface';

export interface CreateCompanyDto {
  cnpj: string;
  userId: string;
}

export interface UpdateCompanyDto {
  cnpj?: string;
}

export interface CompanyOutputDto {
  id: string;
  cnpj: string;
  createdAt: string;
  updatedAt: string;
}

export type CompaniesOutputDto = PaginatedList<CompanyOutputDto>;
