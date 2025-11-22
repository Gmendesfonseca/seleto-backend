import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { VacancyServiceInterface } from './interfaces/vacancy.service.interface';
import { VacancyRepository } from './repositories/vacancy.repository.interface';
import { CreateVacancyDto, UpdateVacancyDto } from './dto/vacancy.dto';
import { VacancyFilters, VacancyStatus } from './interfaces/vacancy.interface';
import { Vacancy } from './vacancy.model';
import { PaginatedList } from 'src/shared/interfaces';

@Injectable()
export class VacancyService implements VacancyServiceInterface {
  private readonly logger = new Logger(VacancyService.name);

  constructor(private readonly repository: VacancyRepository) {}

  async findAll(filters?: VacancyFilters): Promise<Vacancy[]> {
    this.logger.debug('VacancyService.findAll: Called');
    return this.repository.findAll(filters);
  }

  async findOne(id: string): Promise<Vacancy | null> {
    this.logger.debug('VacancyService.findOne: Called');
    return this.repository.findOne(id);
  }

  async create(createVacancyDto: CreateVacancyDto): Promise<Vacancy> {
    this.logger.debug('VacancyService.create: Called');
    return this.repository.create(createVacancyDto);
  }

  async update(id: string, updateVacancyDto: UpdateVacancyDto): Promise<Vacancy> {
    this.logger.debug('VacancyService.update: Called');
    const vacancy = await this.repository.findOne(id);
    if (!vacancy) {
      throw new NotFoundException(`Vacancy with id ${id} not found`);
    }
    return this.repository.update(id, updateVacancyDto);
  }

  async remove(id: string): Promise<void> {
    this.logger.debug('VacancyService.remove: Called');
    const vacancy = await this.repository.findOne(id);
    if (!vacancy) {
      throw new NotFoundException(`Vacancy with id ${id} not found`);
    }
    await this.repository.delete(id);
  }

  async findByCompany(companyId: string): Promise<Vacancy[]> {
    this.logger.debug('VacancyService.findByCompany: Called');
    return this.repository.findByCompany(companyId);
  }

  async findPublished(): Promise<PaginatedList<Vacancy>> {
    this.logger.debug('VacancyService.findPublished: Called');
    const models = await this.repository.findPublished();
    return {
      data: models,
      meta: { total: models.length, currentPage: 1, lastPage: 1, perPage: models.length },
    };
  }

  async publishVacancy(id: string): Promise<Vacancy> {
    this.logger.debug('VacancyService.publishVacancy: Called');
    return this.update(id, { status: VacancyStatus.PUBLISHED });
  }

  async closeVacancy(id: string): Promise<Vacancy> {
    this.logger.debug('VacancyService.closeVacancy: Called');
    return this.update(id, { status: VacancyStatus.CLOSED });
  }
}
