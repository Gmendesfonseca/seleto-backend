import { Injectable, Inject, Logger, NotFoundException } from '@nestjs/common';
import { ApplicationServiceInterface } from './interfaces/application.service.interface';
import { ApplicationRepository } from './repositories/application.repository.interface';
import { CreateApplicationDto } from './dto/create.dto';
import { UpdateApplicationDto } from './dto/update.dto';
import { Application, ApplicationFilters } from './interfaces/application.interface';
import { PaginatedList } from '../../shared/interfaces/entities/pagination.interface';
import { MatchingService } from '../matching/matching.service';

@Injectable()
export class ApplicationService implements ApplicationServiceInterface {
  private readonly logger = new Logger(ApplicationService.name);

  constructor(
    @Inject(ApplicationRepository)
    private readonly repository: ApplicationRepository,
    private readonly matchingService: MatchingService,
  ) {}

  async findOne(id: string): Promise<Application | null> {
    this.logger.debug('ApplicationService.findOne: Called');
    return this.repository.findOne(id);
  }

  async findAll(filters?: ApplicationFilters): Promise<PaginatedList<Application>> {
    this.logger.debug('ApplicationService.findAll: Called');
    const [items, _] = await Promise.all([
      this.repository.findAll(filters),
      this.repository.countByFilters(filters),
    ]);

    return {
      data: items,
      meta: {
        currentPage: 1,
        lastPage: 1,
        perPage: items.length,
        total: items.length,
      },
    };
  }

  async create(createApplicationDto: CreateApplicationDto): Promise<Application> {
    this.logger.debug('ApplicationService.create: Called');
    const application = await this.repository.create(createApplicationDto);

    // Calculate candidate-vacancy match asynchronously
    this.matchingService
      .calculateMatch(createApplicationDto.applicantId, createApplicationDto.vacancyId)
      .catch((error) => {
        this.logger.error('Failed to calculate match for application', error);
      });

    return application;
  }

  async update(id: string, updateApplicationDto: UpdateApplicationDto): Promise<Application> {
    this.logger.debug('ApplicationService.update: Called');
    const application = await this.repository.findOne(id);
    if (!application) {
      throw new NotFoundException(`Application with id ${id} not found`);
    }
    return this.repository.update(id, updateApplicationDto);
  }

  async updateStatus(id: string, status: string): Promise<Application> {
    this.logger.debug('ApplicationService.updateStatus: Called');
    return this.update(id, { status: status as any });
  }

  async remove(id: string): Promise<void> {
    this.logger.debug('ApplicationService.remove: Called');
    const application = await this.repository.findOne(id);
    if (!application) {
      throw new NotFoundException(`Application with id ${id} not found`);
    }
    await this.repository.delete(id);
  }
}
