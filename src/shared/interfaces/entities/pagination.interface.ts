export interface PaginationMeta {
  currentPage: number;
  perPage: number;
  lastPage: number;
  total: number;
}

export interface PaginatedList<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface PaginationParams {
  page?: number;
  perPage?: number;
}

export interface SearchParams {
  search?: string;
}

export interface FilterParams {
  [key: string]: any;
}

export interface PaginatedResponse<T> {
  total: number;
  size: number;
  currentPage: number;
  totalPage: number;
  data: T[];
}
