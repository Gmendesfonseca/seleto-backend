import { PaginatedList } from '../../../shared/interfaces/entities/pagination.interface';

export interface CreateCompanyRequest {
  name: string;
  address?: string;
}

export interface UpdateCompanyRequest {
  name?: string;
  address?: string;
}

export interface CompanyResponse {
  id: string;
  name: string;
  address?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyListResponse extends PaginatedList<CompanyResponse> {} // eslint-disable-line
