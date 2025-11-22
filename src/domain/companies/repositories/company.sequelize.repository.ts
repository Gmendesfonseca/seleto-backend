import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Company } from '../company.model';
import { CompanyRepository } from './company.repository.interface';
import { Op, WhereOptions } from 'sequelize';
import { PaginatedList, PaginationParams, SearchParams } from 'src/shared/interfaces';

@Injectable()
export class CompanySequelizeRepository implements CompanyRepository {
  private readonly logger = new Logger(CompanySequelizeRepository.name);

  constructor(
    @InjectModel(Company)
    private readonly model: typeof Company,
  ) {}

  async create(company: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>): Promise<Company> {
    this.logger.debug('Create: Called');
    return this.model.create(company as Company);
  }

  async findById(id: string): Promise<Company | null> {
    this.logger.debug('FindById: Called');
    return this.model.findByPk(id);
  }

  async findOne(data: { id?: string; cnpj?: string; user_id?: string }): Promise<Company | null> {
    this.logger.debug('FindOne: Called');
    const where: WhereOptions<Company> = {};

    if (data.id) {
      where.id = data.id;
    }

    if (data.cnpj) {
      where.cnpj = data.cnpj;
    }

    if (data.user_id) {
      where.user_id = data.user_id;
    }

    return this.model.findOne({ where });
  }

  async update(id: string, company: Partial<Company>): Promise<Company> {
    this.logger.debug('Update: Called');
    const existingCompany = await this.model.findByPk(id);
    if (!existingCompany) {
      throw new Error('Company not found');
    }
    await existingCompany.update(company);
    return existingCompany;
  }

  async delete(id: string): Promise<void> {
    this.logger.debug('Delete: Called');
    await this.model.destroy({ where: { id } });
  }

  async findAll(
    pagination: PaginationParams,
    search?: SearchParams,
  ): Promise<PaginatedList<Company>> {
    this.logger.debug('FindAll: Called');
    const where: WhereOptions<Company> = {};

    if (search?.query) {
      where.name = { [Op.like]: `%${search.query}%` };
    }

    const { rows: items, count: totalCount } = await this.model.findAndCountAll({
      where,
      limit: pagination.perPage,
      offset: ((pagination?.page ?? 1) - 1) * (pagination?.perPage || 10),
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
    this.logger.debug('ExistsByName: Called');
    const count = await this.model.count({ where: { name } });
    return count > 0;
  }

  async count(): Promise<number> {
    this.logger.debug('Count: Called');
    return this.model.count();
  }
}
