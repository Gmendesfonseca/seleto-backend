import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { DashboardRepository } from './dashboard.repository.interface';
import { DashboardFilters } from '../interfaces/dashboard.interface';
import { Application } from '../../applications/application.model';
import { Vacancy } from '../../vacancies/vacancy.model';
import { Company } from '../../companies/company.model';
import { User } from '../../users/user.model';
import { Person } from '../../persons/person.model';
import { IncludeOptions, Op, WhereOptions } from 'sequelize';
import { ApplicationStatus } from 'src/domain/applications';

@Injectable()
export class DashboardSequelizeRepository implements DashboardRepository {
  private readonly logger = new Logger(DashboardSequelizeRepository.name);

  constructor(
    @InjectModel(User) private readonly userModel: typeof User,
    @InjectModel(Person) private readonly personModel: typeof Person,
    @InjectModel(Vacancy) private readonly vacancyModel: typeof Vacancy,
    @InjectModel(Company) private readonly companyModel: typeof Company,
    @InjectModel(Application) private readonly applicationModel: typeof Application,
  ) {}

  async getApplicationCount(filters?: DashboardFilters): Promise<number> {
    this.logger.debug('GetApplicationCount: Called');
    const where: WhereOptions<Application> = {};
    const include: IncludeOptions[] = [];

    if (filters?.companyId) {
      where['$vacancy.company_id$'] = filters.companyId;
      include.push({
        model: this.vacancyModel,
        as: 'vacancy',
        attributes: [],
        required: true,
      });
    }

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

    return this.applicationModel.count({
      where,
      ...(include.length > 0 && { include }),
      distinct: true,
    });
  }

  async getVacancyCount(filters?: DashboardFilters): Promise<number> {
    this.logger.debug('GetVacancyCount: Called');
    const where: WhereOptions<Vacancy> = {};

    if (filters?.companyId) {
      where.company_id = filters.companyId;
    }

    return this.vacancyModel.count({ where });
  }

  async getCompanyCount(filters?: DashboardFilters): Promise<number> {
    this.logger.debug('GetCompanyCount: Called');
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
    this.logger.debug('GetUserCount: Called');
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
    this.logger.debug('GetRecentApplications: Called');
    const where: WhereOptions<Application> = {};

    if (companyId) {
      where['$vacancy.company_id$'] = companyId;
    }

    return this.applicationModel.findAll({
      where,
      limit,
      order: [['createdAt', 'DESC']],
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
          required: !!companyId,
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
    this.logger.debug('GetTopVacancies: Called');
    const where: WhereOptions<Vacancy> = {};

    if (companyId) {
      where.company_id = companyId;
    }

    return this.vacancyModel.findAll({
      where,
      limit,
      order: [['createdAt', 'DESC']],
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

  async getApplicationsByStatus(companyId?: string): Promise<
    {
      status: ApplicationStatus;
      count: number;
      percentage: number;
    }[]
  > {
    this.logger.debug('GetApplicationsByStatus: Called');
    const results = [];
    for (const status of Object.values(ApplicationStatus)) {
      const include: IncludeOptions[] = [];
      const where: WhereOptions<Application> = { status };

      if (companyId) {
        where['$vacancy.company_id$'] = companyId;
        include.push({
          model: this.vacancyModel,
          as: 'vacancy',
          required: true,
        });
      }
      const totalApplications = await this.applicationModel.count({
        where: companyId
          ? {
              ['$vacancy.company_id$']: companyId,
            }
          : {},
        ...(include.length > 0 && { include }),
      });

      const statusCount = await this.applicationModel.count({
        where,
        ...(include.length > 0 && { include }),
      });

      const percentage = totalApplications
        ? Number.parseFloat(((statusCount / totalApplications) * 100).toFixed(2))
        : 0;

      results.push({
        status,
        count: statusCount,
        percentage,
      });
    }
    return results;
  }

  async getMonthlyApplications(
    months: number,
    companyId?: string,
  ): Promise<
    {
      month: string;
      year: number;
      count: number;
    }[]
  > {
    this.logger.debug('GetMonthlyApplications: Called');
    const results = [];
    const currentDate = new Date();

    for (let i = 0; i < months; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const month = date.toLocaleString('default', { month: 'long' });
      const year = date.getFullYear();

      const where: WhereOptions<Application> = {
        createdAt: {
          [Op.gte]: new Date(year, date.getMonth(), 1),
          [Op.lt]: new Date(year, date.getMonth() + 1, 1),
        },
      };

      const include: IncludeOptions[] = [];

      if (companyId) {
        where['$vacancy.company_id$'] = companyId;
        include.push({
          model: this.vacancyModel,
          as: 'vacancy',
          required: true,
        });
      }

      const count = await this.applicationModel.count({
        where,
        ...(include.length > 0 && { include }),
      });

      results.push({
        month,
        year,
        count,
      });
    }

    return results;
  }
}
