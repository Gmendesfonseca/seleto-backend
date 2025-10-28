import { PaginatedList, PaginationParams, SearchParams } from 'src/shared/interfaces';
import { Company } from '../interfaces/company.interface';

export abstract class CompanyRepository {
  /**
   * Create a new company
   */
  abstract create(company: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>): Promise<Company>;

  /**
   * Find company by ID
   */
  abstract findById(id: string): Promise<Company | null>;

  /**
   * Find company by name
   */
  abstract findByName(name: string): Promise<Company | null>;

  /**
   * Update company
   */
  abstract update(id: string, company: Partial<Company>): Promise<Company>;

  /**
   * Delete company
   */
  abstract delete(id: string): Promise<void>;

  /**
   * Find all companies with pagination
   */
  abstract findAll(
    pagination: PaginationParams,
    search?: SearchParams,
    filters?: { isActive?: boolean },
  ): Promise<PaginatedList<Company>>;

  /**
   * Check if company exists by name
   */
  abstract existsByName(name: string): Promise<boolean>;

  /**
   * Count total companies
   */
  abstract count(): Promise<number>;

  /**
   * Find active companies
   */
  abstract findActive(pagination?: PaginationParams): Promise<PaginatedList<Company>>;
}
