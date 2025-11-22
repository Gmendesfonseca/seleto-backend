import { Vacancy } from 'src/domain/vacancies/vacancy.model';
import { Application } from '../../applications/application.model';
import { DashboardFilters } from '../interfaces/dashboard.interface';
import { ApplicationStatus } from 'src/domain/applications';

export abstract class DashboardRepository {
  abstract getApplicationCount(filters?: DashboardFilters): Promise<number>;
  abstract getVacancyCount(filters?: DashboardFilters): Promise<number>;
  abstract getCompanyCount(filters?: DashboardFilters): Promise<number>;
  abstract getUserCount(filters?: DashboardFilters): Promise<number>;
  abstract getRecentApplications(limit: number, companyId?: string): Promise<Application[]>;
  abstract getTopVacancies(limit: number, companyId?: string): Promise<Vacancy[]>;
  abstract getApplicationsByStatus(
    status: ApplicationStatus,
    companyId?: string,
  ): Promise<Application[]>;
  abstract getMonthlyApplications(months: number, compApplicationId?: string): Promise<any[]>;
}
