import { PaginationParams } from '../entities/pagination.interface';

// Common response interfaces
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface ErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
  statusCode?: number;
}

export interface SuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
}

// Common filter interfaces
export interface DateFilter {
  startDate?: string;
  endDate?: string;
}

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// Sort options
export interface SortOptions {
  field: string;
  direction: 'ASC' | 'DESC';
}

// Query options
export interface QueryOptions extends PaginationParams {
  search?: string;
  sort?: SortOptions;
  filters?: Record<string, any>;
}
