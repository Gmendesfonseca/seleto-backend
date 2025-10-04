import { DashboardStats, DashboardFilters } from './dashboard.interface';

export abstract class DashboardServiceInterface {
  abstract getStats(filters?: DashboardFilters): Promise<DashboardStats>;
  abstract getCompanyStats(companyId: string, filters?: DashboardFilters): Promise<DashboardStats>;
  abstract getRecentApplications(limit?: number, companyId?: string): Promise<any[]>;
  abstract getTopVacancies(limit?: number, companyId?: string): Promise<any[]>;
  abstract getApplicationsByStatus(companyId?: string): Promise<any[]>;
  abstract getMonthlyApplications(months?: number, companyId?: string): Promise<any[]>;
}
