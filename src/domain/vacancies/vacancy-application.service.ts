import { Injectable } from '@nestjs/common';
import { ApplicationServiceInterface } from '../applications/interfaces/application.service.interface';
import { Application } from '../applications/interfaces/application.interface';
import { PaginatedList } from '../../shared/interfaces/entities/pagination.interface';
import { VacancyRepository } from './interfaces/vacancy.repository.interface';
import { VacancyApplicationServiceInterface } from './interfaces/vacancy-application.service.interface';
import { VacancyStatsResponseDto } from './dto/vacancy-stats.dto';
import { assertVacancyBelongsTo } from './vacancy-ownership';

@Injectable()
export class VacancyApplicationService implements VacancyApplicationServiceInterface {
  constructor(
    private readonly vacancies: VacancyRepository,
    private readonly applications: ApplicationServiceInterface,
  ) {}

  async list(vacancyId: string, companyId: string | null): Promise<PaginatedList<Application>> {
    await assertVacancyBelongsTo(this.vacancies, vacancyId, companyId);
    return this.applications.findAll({ vacancyId });
  }

  async stats(vacancyId: string, companyId: string | null): Promise<VacancyStatsResponseDto> {
    await assertVacancyBelongsTo(this.vacancies, vacancyId, companyId);
    return { totalApplications: await this.applications.count({ vacancyId }) };
  }
}
