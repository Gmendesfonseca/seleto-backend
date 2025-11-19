import {
  CompaniesOutputDto,
  CompanyOutputDto,
  CreateCompanyDto,
  UpdateCompanyDto,
} from '../dto/company.dto';
import { PaginationParams, SearchParams } from '../../../shared/interfaces/entities';

export abstract class CompanyServiceInterface {
  abstract findById(companyId: string): Promise<CompanyOutputDto>;
  abstract findAll(
    pagination: PaginationParams,
    search?: SearchParams,
  ): Promise<CompaniesOutputDto>;
  abstract create(request: CreateCompanyDto): Promise<CompanyOutputDto>;
  abstract update(companyId: string, request: UpdateCompanyDto): Promise<CompanyOutputDto>;
  abstract delete(companyId: string): Promise<void>;
  abstract count(companyId: string): Promise<number>;
  abstract setActiveStatus(companyId: string, isActive: boolean): Promise<void>;
  abstract findVacancies(
    companyId: string,
    filters?: { status?: string; area?: string; page?: number; limit?: number },
  ): Promise<any[]>;
  abstract findUsers(
    companyId: string,
    filters?: { type?: string; status?: string; page?: number; limit?: number },
  ): Promise<any[]>;
  abstract statistics(companyId: string): Promise<any>;
}
