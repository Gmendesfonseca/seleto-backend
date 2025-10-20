import { Injectable, Logger } from '@nestjs/common';
import { DashboardServiceInterface } from './interfaces/dashboard.service.interface';
import { DashboardRepository } from './repositories/dashboard.repository.interface';
import { DashboardStats, DashboardFilters } from './interfaces/dashboard.interface';

@Injectable()
export class DashboardService implements DashboardServiceInterface {
  private readonly logger = new Logger(DashboardService.name);

  constructor(private readonly dashboardRepository: DashboardRepository) {}

  async getStats(filters?: DashboardFilters): Promise<DashboardStats> {
    this.logger.debug('DashboardService.getStats: Called');
    
    const [
      totalApplications,
      totalVacancies,
      totalCompanies,
      totalUsers,
      recentApplications,
      topVacancies,
      applicationsByStatus,
      monthlyApplications,
    ] = await Promise.all([
      this.dashboardRepository.getApplicationCount(filters),
      this.dashboardRepository.getVacancyCount(filters),
      this.dashboardRepository.getCompanyCount(filters),
      this.dashboardRepository.getUserCount(filters),
      this.dashboardRepository.getRecentApplications(10, filters?.companyId),
      this.dashboardRepository.getTopVacancies(10, filters?.companyId),
      this.dashboardRepository.getApplicationsByStatus(filters?.companyId),
      this.dashboardRepository.getMonthlyApplications(6, filters?.companyId),
    ]);

    return {
      totalApplications,
      totalVacancies,
      totalCompanies,
      totalUsers,
      recentApplications: recentApplications.map((app: any) => ({
        id: app.id,
        applicantName: 'Unknown',
        vacancyTitle: 'Unknown',
        companyName: 'Unknown',
        status: app.status,
        appliedAt: app.created_at,
      })),
      topVacancies: topVacancies.map((vac: any) => ({
        id: vac.id,
        title: vac.title,
        companyName: 'Unknown',
        applicationCount: 0,
        publishedAt: vac.created_at,
      })),
      applicationsByStatus: applicationsByStatus.map((stat: any) => ({
        status: stat.status,
        count: stat.count,
        percentage: stat.percentage,
      })),
      monthlyApplications: monthlyApplications.map((monthly: any) => ({
        month: monthly.month,
        year: monthly.year,
        count: monthly.count,
      })),
    };
  }

  async getCompanyStats(companyId: string, filters?: DashboardFilters): Promise<DashboardStats> {
    this.logger.debug('DashboardService.getCompanyStats: Called');
    return this.getStats({ ...filters, companyId });
  }

  async getRecentApplications(limit?: number, companyId?: string): Promise<any[]> {
    this.logger.debug('DashboardService.getRecentApplications: Called');
    return this.dashboardRepository.getRecentApplications(limit || 10, companyId);
  }

  async getTopVacancies(limit?: number, companyId?: string): Promise<any[]> {
    this.logger.debug('DashboardService.getTopVacancies: Called');
    return this.dashboardRepository.getTopVacancies(limit || 10, companyId);
  }

  async getApplicationsByStatus(companyId?: string): Promise<any[]> {
    this.logger.debug('DashboardService.getApplicationsByStatus: Called');
    return this.dashboardRepository.getApplicationsByStatus(companyId);
  }

  async getMonthlyApplications(months?: number, companyId?: string): Promise<any[]> {
    this.logger.debug('DashboardService.getMonthlyApplications: Called');
    return this.dashboardRepository.getMonthlyApplications(months || 6, companyId);
  }
}
