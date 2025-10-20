import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { DashboardRepository } from './dashboard.repository.interface';
import { DashboardFilters } from '../interfaces/dashboard.interface';
import { Application } from '../../applications/application.model';
import { Vacancy } from '../../vacancies/vacancy.model';
import { Company } from '../../users/user.model';
import { User } from '../../users/user.model';
import { Op } from 'sequelize';

@Injectable()
export class DashboardSequelizeRepository implements DashboardRepository {
  private readonly logger = new Logger(DashboardSequelizeRepository.name);

  constructor(
    @InjectModel(Application) private readonly applicationModel: typeof Application,
    @InjectModel(Vacancy) private readonly vacancyModel: typeof Vacancy,
    @InjectModel(Company) private readonly companyModel: typeof Company,
    @InjectModel(User) private readonly userModel: typeof User,
  ) {}

  async getApplicationCount(filters?: DashboardFilters): Promise<number> {
    this.logger.debug('DashboardSequelizeRepository.getApplicationCount: Called');
    const where: any = {};
    
    if (filters?.companyId) {
      // Would need to join with vacancy to filter by company
    }
    if (filters?.dateFrom || filters?.dateTo) {
      where.created_at = {};
      if (filters.dateFrom) {
        where.created_at[Op.gte] = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        where.created_at[Op.lte] = new Date(filters.dateTo);
      }
    }

    return this.applicationModel.count({ where });
  }

  async getVacancyCount(filters?: DashboardFilters): Promise<number> {
    this.logger.debug('DashboardSequelizeRepository.getVacancyCount: Called');
    const where: any = {};
    
    if (filters?.companyId) {
      where.company_id = filters.companyId;
    }

    return this.vacancyModel.count({ where });
  }

  async getCompanyCount(filters?: DashboardFilters): Promise<number> {
    this.logger.debug('DashboardSequelizeRepository.getCompanyCount: Called');
    return this.companyModel.count();
  }

  async getUserCount(filters?: DashboardFilters): Promise<number> {
    this.logger.debug('DashboardSequelizeRepository.getUserCount: Called');
    return this.userModel.count();
  }

  async getRecentApplications(limit: number, companyId?: string): Promise<any[]> {
    this.logger.debug('DashboardSequelizeRepository.getRecentApplications: Called');
    const where: any = {};
    
    if (companyId) {
      // Would need to join with vacancy to filter by company
    }

    return this.applicationModel.findAll({
      where,
      limit,
      order: [['created_at', 'DESC']],
    });
  }

  async getTopVacancies(limit: number, companyId?: string): Promise<any[]> {
    this.logger.debug('DashboardSequelizeRepository.getTopVacancies: Called');
    const where: any = {};
    
    if (companyId) {
      where.company_id = companyId;
    }

    return this.vacancyModel.findAll({
      where,
      limit,
      order: [['created_at', 'DESC']],
    });
  }

  async getApplicationsByStatus(companyId?: string): Promise<any[]> {
    this.logger.debug('DashboardSequelizeRepository.getApplicationsByStatus: Called');
    // This would need raw SQL or complex aggregation
    return [];
  }

  async getMonthlyApplications(months: number, companyId?: string): Promise<any[]> {
    this.logger.debug('DashboardSequelizeRepository.getMonthlyApplications: Called');
    // This would need raw SQL or complex aggregation
    return [];
  }
}
