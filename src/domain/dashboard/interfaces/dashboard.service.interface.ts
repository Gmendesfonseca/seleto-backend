import {
  TopVacancy,
  DashboardStats,
  DashboardFilters,
  RecentApplication,
  ApplicationStatusCount,
  MonthlyApplicationCount,
} from './dashboard.interface';

export abstract class DashboardServiceInterface {
  abstract getStats(filters?: DashboardFilters): Promise<DashboardStats>;
  abstract getRecentApplications(limit?: number, companyId?: string): Promise<RecentApplication[]>;
  abstract getTopVacancies(limit?: number, companyId?: string): Promise<TopVacancy[]>;
  abstract getApplicationsByStatus(companyId?: string): Promise<ApplicationStatusCount[]>;
  abstract getMonthlyApplications(
    months?: number,
    companyId?: string,
  ): Promise<MonthlyApplicationCount[]>;
}
