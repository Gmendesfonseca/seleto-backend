import { Injectable, Inject, Logger } from '@nestjs/common';
import { DashboardServiceInterface } from './interfaces/dashboard.service.interface';
import { DashboardRepository } from './repositories/dashboard.repository.interface';
import { DashboardStats, DashboardFilters } from './interfaces/dashboard.interface';
import { ApplicationStatus } from '../applications';

@Injectable()
export class DashboardService implements DashboardServiceInterface {
  private readonly logger = new Logger(DashboardService.name);

  constructor(
    @Inject(DashboardRepository)
    private readonly dashboardRepository: DashboardRepository,
  ) {}

  async getStats(filters?: DashboardFilters): Promise<DashboardStats> {
    this.logger.debug('DashboardService.getStats: Called');
    const statusFilter: ApplicationStatus = filters?.applicationStatus || 'pending';

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
      this.dashboardRepository.getApplicationsByStatus(statusFilter, filters?.companyId),
      this.dashboardRepository.getMonthlyApplications(6, filters?.companyId),
    ]);

    return {
      totalApplications,
      totalVacancies,
      totalCompanies,
      totalUsers,
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
        publishedAt: vac.publication_date.toISO(),
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

  async getApplicationsByStatus(status: ApplicationStatus, companyId?: string): Promise<any[]> {
    this.logger.debug('DashboardService.getApplicationsByStatus: Called');
    return this.dashboardRepository.getApplicationsByStatus(status, companyId);
  }

  async getMonthlyApplications(months?: number, companyId?: string): Promise<any[]> {
    this.logger.debug('DashboardService.getMonthlyApplications: Called');
    return this.dashboardRepository.getMonthlyApplications(months || 6, companyId);
  }
}
