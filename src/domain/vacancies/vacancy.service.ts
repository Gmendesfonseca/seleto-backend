import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { VacancyService } from './interfaces/vacancy.service.interface';
import { VacancyRepository } from './repositories/vacancy.repository.interface';
import { CreateVacancyDto, UpdateVacancyDto } from './dto/vacancy.dto';
import { Vacancy, VacancyFilters, VacancyStatus } from './interfaces/vacancy.interface';

@Injectable()
export class VacancyServiceImpl implements VacancyService {
  private readonly logger = new Logger(VacancyServiceImpl.name);

  constructor(private readonly vacancyRepository: VacancyRepository) {}

  async create(createVacancyDto: CreateVacancyDto): Promise<Vacancy> {
    this.logger.debug('VacancyService.create: Called');
    return this.vacancyRepository.create(createVacancyDto);
  }

  async findAll(filters?: VacancyFilters): Promise<Vacancy[]> {
    this.logger.debug('VacancyService.findAll: Called');
    return this.vacancyRepository.findAll(filters);
  }

  async findOne(id: string): Promise<Vacancy | null> {
    this.logger.debug('VacancyService.findOne: Called');
    return this.vacancyRepository.findOne(id);
  }

  async update(id: string, updateVacancyDto: UpdateVacancyDto): Promise<Vacancy> {
    this.logger.debug('VacancyService.update: Called');
    const vacancy = await this.vacancyRepository.findOne(id);
    if (!vacancy) {
      throw new NotFoundException(`Vacancy with id ${id} not found`);
    }
    return this.vacancyRepository.update(id, updateVacancyDto);
  }

  async remove(id: string): Promise<void> {
    this.logger.debug('VacancyService.remove: Called');
    const vacancy = await this.vacancyRepository.findOne(id);
    if (!vacancy) {
      throw new NotFoundException(`Vacancy with id ${id} not found`);
    }
    await this.vacancyRepository.delete(id);
  }

  async findByCompany(companyId: string): Promise<Vacancy[]> {
    this.logger.debug('VacancyService.findByCompany: Called');
    return this.vacancyRepository.findByCompany(companyId);
  }

  async findPublished(): Promise<Vacancy[]> {
    this.logger.debug('VacancyService.findPublished: Called');
    return this.vacancyRepository.findPublished();
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
