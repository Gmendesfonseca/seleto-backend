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

    if (search?.search) {
      where.cnpj = { [Op.like]: `${search.search}%` };
    }

    const page = Number(pagination?.page) || 1;
    const perPage = Number(pagination?.perPage) || 10;

    const { rows, count } = await this.model.findAndCountAll({
      where,
      limit: perPage,
      offset: (page - 1) * perPage,
    });

    return {
      data: rows,
      meta: {
        total: count,
        currentPage: page,
        perPage,
        lastPage: Math.ceil(count / perPage),
      },
    };
  }

  async count(): Promise<number> {
    this.logger.debug('Count: Called');
    return this.model.count();
  }
}
