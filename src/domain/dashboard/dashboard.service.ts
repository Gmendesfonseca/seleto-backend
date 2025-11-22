import { Injectable, Inject, Logger } from '@nestjs/common';
import { DashboardServiceInterface } from './interfaces/dashboard.service.interface';
import { DashboardRepository } from './repositories/dashboard.repository.interface';
import { DashboardStats, DashboardFilters } from './interfaces/dashboard.interface';

@Injectable()
export class DashboardService implements DashboardServiceInterface {
  private readonly logger = new Logger(DashboardService.name);

  constructor(
    @Inject(DashboardRepository)
    private readonly dashboardRepository: DashboardRepository,
  ) {}

  async getStats(filters?: DashboardFilters): Promise<DashboardStats> {
    this.logger.debug('DashboardService.getStats: Called');

    const [
      totalVacancies = 0,
      totalApplications = 0,
      recentApplications = [],
      topVacancies = [],
      applicationsByStatus = [],
      monthlyApplications = [],
    ] = await Promise.all([
      this.dashboardRepository.getVacancyCount(filters),
      this.dashboardRepository.getApplicationCount(filters),
      this.dashboardRepository.getRecentApplications(10, filters?.companyId),
      this.dashboardRepository.getTopVacancies(10, filters?.companyId),
      this.dashboardRepository.getApplicationsByStatus(filters?.companyId),
      this.dashboardRepository.getMonthlyApplications(6, filters?.companyId),
    ]);

    return {
      totalVacancies,
      totalApplications,
      recentApplications: recentApplications.map((app) => ({
        id: app.id,
        applicantName: app.applicant.user.name || 'Unknown',
        vacancyTitle: app.vacancy.title,
        companyName: app.vacancy.company ? app.vacancy.company.user.name : 'Unknown',
        status: app.status,
        appliedAt: app.created_at,
      })),
      topVacancies: topVacancies.map((vac) => ({
        id: vac.id,
        title: vac.title,
        companyName: vac.company ? vac.company.user.name : 'Unknown',
        applicationCount: vac.applications?.length || 0,
        publishedAt: vac.publication_date,
      })),
      applicationsByStatus: applicationsByStatus.map((stat) => ({
        status: stat.status,
        count: stat.count,
        percentage: stat.percentage,
      })),
      monthlyApplications: monthlyApplications.map((monthly) => ({
        month: monthly.month,
        year: monthly.year,
        count: monthly.count,
      })),
    };
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
