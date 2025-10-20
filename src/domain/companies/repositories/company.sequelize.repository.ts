import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Company } from '../../users/user.model';
import { CompanyRepository } from './company.repository.interface';
import {
  PaginationParams,
  PaginatedList,
  SearchParams,
} from '../../../shared/interfaces/pagination.interface';
import { Op } from 'sequelize';

@Injectable()
export class CompanySequelizeRepository implements CompanyRepository {
  private readonly logger = new Logger(CompanySequelizeRepository.name);

  constructor(
    @InjectModel(Company)
    private readonly companyModel: typeof Company,
  ) {}

  async create(company: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>): Promise<Company> {
    this.logger.debug('CompanySequelizeRepository.create: Called');
    return this.companyModel.create(company as Company);
  }

  async findById(id: string): Promise<Company | null> {
    this.logger.debug('CompanySequelizeRepository.findById: Called');
    return this.companyModel.findByPk(id);
  }

  async findByName(name: string): Promise<Company | null> {
    this.logger.debug('CompanySequelizeRepository.findByName: Called');
    return this.companyModel.findOne({ where: { name } });
  }

  async update(id: string, company: Partial<Company>): Promise<Company> {
    this.logger.debug('CompanySequelizeRepository.update: Called');
    const existingCompany = await this.companyModel.findByPk(id);
    if (!existingCompany) {
      throw new Error('Company not found');
    }
    await existingCompany.update(company);
    return existingCompany;
  }

  async delete(id: string): Promise<void> {
    this.logger.debug('CompanySequelizeRepository.delete: Called');
    await this.companyModel.destroy({ where: { id } });
  }

  async findAll(
    pagination: PaginationParams,
    search?: SearchParams,
    filters?: { isActive?: boolean },
  ): Promise<PaginatedList<Company>> {
    this.logger.debug('CompanySequelizeRepository.findAll: Called');
    const where: any = {};

    if (filters?.isActive !== undefined) {
      where.is_active = filters.isActive;
    }

    if (search?.query) {
      where.name = { [Op.like]: `%${search.query}%` };
    }

    const { rows: items, count: totalCount } = await this.companyModel.findAndCountAll({
      where,
      limit: pagination.pageSize,
      offset: (pagination.page - 1) * pagination.pageSize,
    });

    return {
      items,
      totalCount,
      page: pagination.page,
      pageSize: pagination.pageSize,
      totalPages: Math.ceil(totalCount / pagination.pageSize),
    };
  }

  async existsByName(name: string): Promise<boolean> {
    this.logger.debug('CompanySequelizeRepository.existsByName: Called');
    const count = await this.companyModel.count({ where: { name } });
    return count > 0;
  }

  async count(): Promise<number> {
    this.logger.debug('CompanySequelizeRepository.count: Called');
    return this.companyModel.count();
  }

  async findActive(pagination?: PaginationParams): Promise<PaginatedList<Company>> {
    this.logger.debug('CompanySequelizeRepository.findActive: Called');
    const defaultPagination: PaginationParams = pagination || { page: 1, pageSize: 10 };

    const { rows: items, count: totalCount } = await this.companyModel.findAndCountAll({
      where: { is_active: true },
      limit: defaultPagination.pageSize,
      offset: (defaultPagination.page - 1) * defaultPagination.pageSize,
    });

    return {
      items,
      totalCount,
      page: defaultPagination.page,
      pageSize: defaultPagination.pageSize,
      totalPages: Math.ceil(totalCount / defaultPagination.pageSize),
    };
  }
}
