export interface IPage {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  total: number;
  size: number;
  currentPage: number;
  totalPage: number;
  data: T[];
}
