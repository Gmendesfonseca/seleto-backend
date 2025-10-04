import { Application, ApplicationFilters } from './application.interface';
import { CreateApplicationDto } from '../dto/create.dto';
import { PaginatedList } from '../../../shared/interfaces/pagination.interface';
import { UpdateApplicationDto } from '../dto/update.dto';

export abstract class ApplicationServiceInterface {
  abstract create(createApplicationDto: CreateApplicationDto): Promise<Application>;
  abstract findAll(filters?: ApplicationFilters): Promise<PaginatedList<Application>>;
  abstract findOne(id: string): Promise<Application | null>;
  abstract update(id: string, updateApplicationDto: UpdateApplicationDto): Promise<Application>;
  abstract remove(id: string): Promise<void>;
  abstract findByApplicant(applicantId: string): Promise<Application[]>;
  abstract findByVacancy(vacancyId: string): Promise<Application[]>;
  abstract updateStatus(id: string, status: string): Promise<Application>;
}
