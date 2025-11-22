import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { DashboardRepository } from './dashboard.repository.interface';
import { DashboardFilters } from '../interfaces/dashboard.interface';
import { Application } from '../../applications/application.model';
import { Vacancy } from '../../vacancies/vacancy.model';
import { Company } from '../../companies/company.model';
import { User } from '../../users/user.model';
import { Person } from '../../persons/person.model';
import { Op, WhereOptions } from 'sequelize';
import { ApplicationStatus } from 'src/domain/applications';

@Injectable()
export class DashboardSequelizeRepository implements DashboardRepository {
  private readonly logger = new Logger(DashboardSequelizeRepository.name);

  constructor(
    @InjectModel(User) private readonly userModel: typeof User,
    @InjectModel(Vacancy) private readonly vacancyModel: typeof Vacancy,
    @InjectModel(Company) private readonly companyModel: typeof Company,
    @InjectModel(Person) private readonly personModel: typeof Person,
    @InjectModel(Application) private readonly applicationModel: typeof Application,
  ) {}

  async getApplicationCount(filters?: DashboardFilters): Promise<number> {
    this.logger.debug('DashboardSequelizeRepository.getApplicationCount: Called');
    const where: WhereOptions<Application> = {};

    if (filters?.companyId) {
      where['$vacancy.company_id$'] = filters.companyId;
    }

    if (filters?.dateFrom || filters?.dateTo) {
      where.created_at = {};
      if (filters.dateFrom) {
        where.created_at = {
          [Op.gte]: new Date(filters.dateFrom),
        };
      }
      if (filters.dateTo) {
        where.created_at = {
          ...(where.created_at as object),
          [Op.lte]: new Date(filters.dateTo),
        };
      }
    }

    return this.applicationModel.count({
      where,
      include: filters?.companyId
        ? [
            {
              model: this.vacancyModel,
              as: 'vacancy',
              attributes: [],
            },
          ]
        : undefined,
    });
  }

  async getVacancyCount(filters?: DashboardFilters): Promise<number> {
    this.logger.debug('DashboardSequelizeRepository.getVacancyCount: Called');
    const where: WhereOptions<Vacancy> = {};

    if (filters?.companyId) {
      where.company_id = filters.companyId;
    }

    return this.vacancyModel.count({ where });
  }

  async getCompanyCount(filters?: DashboardFilters): Promise<number> {
    this.logger.debug('DashboardSequelizeRepository.getCompanyCount: Called');
    const where: WhereOptions<Company> = {};

    if (filters?.dateFrom || filters?.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) {
        where.createdAt = {
          [Op.gte]: new Date(filters.dateFrom),
        };
      }
      if (filters.dateTo) {
        where.createdAt = {
          ...(where.createdAt as object),
          [Op.lte]: new Date(filters.dateTo),
        };
      }
    }
    return this.companyModel.count({ where });
  }

  async getUserCount(filters?: DashboardFilters): Promise<number> {
    this.logger.debug('DashboardSequelizeRepository.getUserCount: Called');
    const where: WhereOptions<User> = {};

    if (filters?.dateFrom || filters?.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) {
        where.createdAt = {
          [Op.gte]: new Date(filters.dateFrom),
        };
      }
      if (filters.dateTo) {
        where.createdAt = {
          ...(where.createdAt as object),
          [Op.lte]: new Date(filters.dateTo),
        };
      }
    }

    return this.userModel.count({ where });
  }

  async getRecentApplications(limit: number, companyId?: string): Promise<Application[]> {
    this.logger.debug('DashboardSequelizeRepository.getRecentApplications: Called');
    const where: WhereOptions<Application> = {};

    if (companyId) {
      where['$vacancy.company_id$'] = companyId;
    }

    return this.applicationModel.findAll({
      where,
      limit,
      order: [['created_at', 'DESC']],
      include: [
        {
          model: this.personModel,
          as: 'applicant',
          include: [
            {
              model: this.userModel,
              as: 'user',
            },
          ],
        },
        {
          model: this.vacancyModel,
          as: 'vacancy',
          include: [
            {
              model: this.companyModel,
              as: 'company',
              include: [
                {
                  model: this.userModel,
                  as: 'user',
                },
              ],
            },
          ],
        },
      ],
    });
  }

  async getTopVacancies(limit: number, companyId?: string): Promise<Vacancy[]> {
    this.logger.debug('DashboardSequelizeRepository.getTopVacancies: Called');
    const where: WhereOptions<Vacancy> = {};

    if (companyId) {
      where.company_id = companyId;
    }

    return this.vacancyModel.findAll({
      where,
      limit,
      order: [['created_at', 'DESC']],
      include: [
        {
          model: this.companyModel,
          as: 'company',
          include: [
            {
              model: this.userModel,
              as: 'user',
            },
          ],
        },
        {
          model: this.applicationModel,
          as: 'applications',
          attributes: [],
        },
      ],
    });
  }

  async getApplicationsByStatus(
    status: ApplicationStatus,
    companyId: string,
  ): Promise<Application[]> {
    this.logger.debug('DashboardSequelizeRepository.getApplicationsByStatus: Called');
    const where: WhereOptions<Application> = { status };

    if (companyId) {
      where['$vacancy.company_id$'] = companyId;
    }

    return this.applicationModel.findAll({
      where,
      include: companyId
        ? [
            {
              model: this.vacancyModel,
              as: 'vacancy',
              attributes: [],
            },
          ]
        : undefined,
    });
  }

  async getMonthlyApplications(months: number, companyId?: string): Promise<Application[]> {
    this.logger.debug('DashboardSequelizeRepository.getMonthlyApplications: Called');
    const where: WhereOptions<Application> = {
      created_at: {
        [Op.gte]: new Date(new Date().setMonth(new Date().getMonth() - months)),
      },
    };

    if (companyId) {
      where['$vacancy.company_id$'] = companyId;
    }

    return this.applicationModel.findAll({
      where,
      include: companyId
        ? [
            {
              model: this.vacancyModel,
              as: 'vacancy',
              attributes: [],
            },
          ]
        : undefined,
    });
  }
}
