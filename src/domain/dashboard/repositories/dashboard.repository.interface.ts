import { DashboardFilters } from '../interfaces/dashboard.interface';

export abstract class DashboardRepository {
  abstract getApplicationCount(filters?: DashboardFilters): Promise<number>;
  abstract getVacancyCount(filters?: DashboardFilters): Promise<number>;
  abstract getCompanyCount(filters?: DashboardFilters): Promise<number>;
  abstract getUserCount(filters?: DashboardFilters): Promise<number>;
  abstract getRecentApplications(limit: number, companyId?: string): Promise<any[]>;
  abstract getTopVacancies(limit: number, companyId?: string): Promise<any[]>;
  abstract getApplicationsByStatus(companyId?: string): Promise<any[]>;
  abstract getMonthlyApplications(months: number, companyId?: string): Promise<any[]>;
}
