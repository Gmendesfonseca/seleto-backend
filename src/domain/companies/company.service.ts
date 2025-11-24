import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CompanyServiceInterface } from './interfaces/company.service.interface';
import { CompanyRepository } from './repositories/company.repository.interface';
import {
  CompaniesOutputDto,
  CompanyOutputDto,
  CreateCompanyDto,
  UpdateCompanyDto,
} from './dto/company.dto';
import { PaginationParams, SearchParams } from '../../shared/interfaces/entities';

@Injectable()
export class CompanyService implements CompanyServiceInterface {
  private readonly logger = new Logger(CompanyService.name);

  constructor(private readonly repository: CompanyRepository) {}

  async create(request: CreateCompanyDto): Promise<CompanyOutputDto> {
    this.logger.debug('CompanyService.create: Called');
    const company = await this.repository.create({
      cnpj: request.cnpj,
      user_id: request.userId,
    });

    return this.toResponse(company);
  }

  async findById(id: string): Promise<CompanyOutputDto> {
    this.logger.debug('CompanyService.findById: Called');
    const company = await this.repository.findOne({ id });
    if (!company) {
      throw new NotFoundException(`Company with id ${id} not found`);
    }
    return this.toResponse(company);
  }

  async findByUserId(userId: string): Promise<CompanyOutputDto> {
    this.logger.debug('CompanyService.findByUserId: Called');
    const company = await this.repository.findOne({ user_id: userId });
    if (!company) {
      throw new NotFoundException(`Company with userId ${userId} not found`);
    }
    return this.toResponse(company);
  }

  async update(id: string, data: UpdateCompanyDto): Promise<CompanyOutputDto> {
    this.logger.debug('CompanyService.update: Called');
    const company = await this.repository.update(id, {
      cnpj: data.cnpj,
    });
    return this.toResponse(company);
  }

  async delete(id: string): Promise<void> {
    this.logger.debug('CompanyService.delete: Called');
    const company = await this.repository.findOne({ id });
    if (!company) {
      throw new NotFoundException(`Company with id ${id} not found`);
    }
    await this.repository.delete(id);
  }

  async findAll(pagination: PaginationParams, search?: SearchParams): Promise<CompaniesOutputDto> {
    this.logger.debug('CompanyService.findAll: Called');
    const result = await this.repository.findAll(pagination, search);
    return {
      data: result.data.map((company) => this.toResponse(company)),
      meta: result.meta,
    };
  }

  async count(_companyId: string): Promise<number> {
    this.logger.debug('CompanyService.count: Called');
    // This would need to be implemented with user repository
    return 0;
  }

  async setActiveStatus(_companyId: string, _isActive: boolean): Promise<void> {
    this.logger.debug('CompanyService.setActiveStatus: Called');
    // isActive field no longer exists in Company model
    throw new Error('setActiveStatus is no longer supported');
  }

  async statistics(_companyId: string): Promise<any> {
    this.logger.debug('CompanyService.statistics: Called');
    // Placeholder for statistics logic
    return { totalUsers: 0, totalVacancies: 0 };
  }

  async findUsers(
    _companyId: string,
    _filters?: { type?: string; status?: string; page?: number; limit?: number },
  ): Promise<any[]> {
    this.logger.debug('CompanyService.findUsers: Called');
    // This would need to be implemented with user repository
    return [];
  }

  async findVacancies(
    _companyId: string,
    _filters?: { status?: string; page?: number; limit?: number },
  ): Promise<any[]> {
    this.logger.debug('CompanyService.findVacancies: Called');
    // This would need to be implemented with vacancy repository
    return [];
  }

  private toResponse(company: any): CompanyOutputDto {
    return {
      id: company.id,
      cnpj: company.cnpj,
      createdAt: company.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: company.updatedAt?.toISOString() || new Date().toISOString(),
    };
  }
}
