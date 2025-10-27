import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CompanyService } from './interfaces/company.service.interface';
import { CompanyRepository } from './repositories/company.repository.interface';
import {
  CreateCompanyRequest,
  UpdateCompanyRequest,
  CompanyResponse,
  CompanyListResponse,
} from './dto/company.dto';
import { PaginationParams, SearchParams } from '../../shared/interfaces/entities';

@Injectable()
export class CompanyServiceImpl implements CompanyService {
  private readonly logger = new Logger(CompanyServiceImpl.name);

  constructor(private readonly companyRepository: CompanyRepository) {}

  async create(request: CreateCompanyRequest): Promise<CompanyResponse> {
    this.logger.debug('CompanyService.create: Called');
    const company = await this.companyRepository.create({
      name: request.name,
      address: request.address || null,
      isActive: true,
    });

    return this.toResponse(company);
  }

  async findById(companyId: string): Promise<CompanyResponse> {
    this.logger.debug('CompanyService.findById: Called');
    const company = await this.companyRepository.findById(companyId);
    if (!company) {
      throw new NotFoundException(`Company with id ${companyId} not found`);
    }
    return this.toResponse(company);
  }

  async update(companyId: string, request: UpdateCompanyRequest): Promise<CompanyResponse> {
    this.logger.debug('CompanyService.update: Called');
    const company = await this.companyRepository.update(companyId, {
      name: request.name,
      address: request.address || null,
    });
    return this.toResponse(company);
  }

  async delete(companyId: string): Promise<void> {
    this.logger.debug('CompanyService.delete: Called');
    const company = await this.companyRepository.findById(companyId);
    if (!company) {
      throw new NotFoundException(`Company with id ${companyId} not found`);
    }
    await this.companyRepository.delete(companyId);
  }

  async findAll(pagination: PaginationParams, search?: SearchParams): Promise<CompanyListResponse> {
    this.logger.debug('CompanyService.findAll: Called');
    const result = await this.companyRepository.findAll(pagination, search);
    return {
      ...result,
      items: result.items.map((company) => this.toResponse(company)),
    };
  }

  async existsByName(name: string): Promise<boolean> {
    this.logger.debug('CompanyService.existsByName: Called');
    return this.companyRepository.existsByName(name);
  }

  async getUsersCount(companyId: string): Promise<number> {
    this.logger.debug('CompanyService.getUsersCount: Called');
    // This would need to be implemented with user repository
    return 0;
  }

  async setActiveStatus(companyId: string, isActive: boolean): Promise<void> {
    this.logger.debug('CompanyService.setActiveStatus: Called');
    await this.companyRepository.update(companyId, { isActive });
  }

  async getStatistics(companyId: string): Promise<any> {
    this.logger.debug('CompanyService.getStatistics: Called');
    // Placeholder for statistics logic
    return Promise.resolve({ totalUsers: 0, totalVacancies: 0 });
  }

  async getUsers(
    companyId: string,
    filters?: { type?: string; status?: string; page?: number; limit?: number },
  ): Promise<any[]> {
    this.logger.debug('CompanyService.getUsers: Called');
    // This would need to be implemented with user repository
    return [];
  }

  async getVacancies(
    companyId: string,
    filters?: { status?: string; page?: number; limit?: number },
  ): Promise<any[]> {
    this.logger.debug('CompanyService.getVacancies: Called');
    // This would need to be implemented with vacancy repository
    return [];
  }

  private toResponse(company: any): CompanyResponse {
    return {
      id: company.id,
      name: company.name,
      address: company.avatar,
      isActive: true,
      createdAt: company.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: company.updatedAt?.toISOString() || new Date().toISOString(),
    };
  }
}
