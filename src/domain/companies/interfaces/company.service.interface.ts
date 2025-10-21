import {
  CreateCompanyRequest,
  UpdateCompanyRequest,
  CompanyResponse,
  CompanyListResponse,
} from '../dto/company.dto';
import { PaginationParams, SearchParams } from '../../../shared/interfaces/entities';

export abstract class CompanyService {
  /**
   * Create a new company
   */
  abstract create(request: CreateCompanyRequest): Promise<CompanyResponse>;

  /**
   * Get company by ID
   */
  abstract findById(companyId: string): Promise<CompanyResponse>;

  /**
   * Update company information
   */
  abstract update(companyId: string, request: UpdateCompanyRequest): Promise<CompanyResponse>;

  /**
   * Delete company by ID
   */
  abstract delete(companyId: string): Promise<void>;

  /**
   * Get paginated list of companies
   */
  abstract findAll(
    pagination: PaginationParams,
    search?: SearchParams,
  ): Promise<CompanyListResponse>;

  /**
   * Check if company exists by name
   */
  abstract existsByName(name: string): Promise<boolean>;

  /**
   * Get company users count
   */
  abstract getUsersCount(companyId: string): Promise<number>;

  /**
   * Activate/Deactivate company
   */
  abstract setActiveStatus(companyId: string, isActive: boolean): Promise<void>;

  /**
   * Get company vacancies with filters
   */
  abstract getVacancies(
    companyId: string,
    filters?: { status?: string; area?: string; page?: number; limit?: number },
  ): Promise<any[]>;

  /**
   * Get company users with filters
   */
  abstract getUsers(
    companyId: string,
    filters?: { type?: string; status?: string; page?: number; limit?: number },
  ): Promise<any[]>;

  /**
   * Get company statistics
   */
  abstract getStatistics(companyId: string): Promise<any>;
}
