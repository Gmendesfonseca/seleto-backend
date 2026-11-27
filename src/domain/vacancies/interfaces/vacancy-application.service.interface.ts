import { Application } from '../../applications/interfaces/application.interface';
import { PaginatedList } from '../../../shared/interfaces/entities/pagination.interface';
import { VacancyStatsResponseDto } from '../dto/vacancy-stats.dto';

export abstract class VacancyApplicationServiceInterface {
  abstract list(vacancyId: string, companyId: string | null): Promise<PaginatedList<Application>>;
  abstract stats(vacancyId: string, companyId: string | null): Promise<VacancyStatsResponseDto>;
}
