import { PaginatedList, PaginationParams, SearchParams } from 'src/shared/interfaces';
import { Company } from '../interfaces/company.interface';

export abstract class CompanyRepository {
  abstract findOne(data: { id?: string; cnpj?: string; user_id?: string }): Promise<Company | null>;
  abstract findAll(
    pagination: PaginationParams,
    search?: SearchParams,
  ): Promise<PaginatedList<Company>>;
  abstract create(company: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>): Promise<Company>;
  abstract update(id: string, company: Partial<Company>): Promise<Company>;
  abstract delete(id: string): Promise<void>;
  abstract count(): Promise<number>;
}
