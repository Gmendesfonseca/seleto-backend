import { Controller, Logger } from '@nestjs/common';
import { DashboardServiceInterface } from './interfaces/dashboard.service.interface';

@Controller('dashboard')
export class DashboardController {
  private readonly logger = new Logger(DashboardController.name);

  constructor(private readonly service: DashboardServiceInterface) {}

  public async stats(filters?: any) {
    this.logger.debug('Stats: called', { filters });
    return this.service.getStats(filters);
  }

  public async companyStats(companyId: string, filters?: any) {
    this.logger.debug('CompanyStats: called', { companyId, filters });
    return this.service.getCompanyStats(companyId, filters);
  }

  public async recentApplications(limit?: number, companyId?: string) {
    return this.service.getRecentApplications(limit, companyId);
  }

  public async topVacancies(limit?: number, companyId?: string) {
    return this.service.getTopVacancies(limit, companyId);
  }

  public async applicationsByStatus(companyId?: string) {
    return this.service.getApplicationsByStatus(companyId);
  }

  public async monthlyApplications(months?: number, companyId?: string) {
    return this.service.getMonthlyApplications(months, companyId);
  }
}
