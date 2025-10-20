import { CreateApplicationDto } from '../dto/create.dto';
import { UpdateApplicationDto } from '../dto/update.dto';
import { Application, ApplicationFilters } from './application.interface';
import { PaginatedList } from '../../../shared/interfaces/entities/pagination.interface';

export abstract class ApplicationServiceInterface {
  abstract findOne(id: string): Promise<Application | null>;
  abstract findAll(filters?: ApplicationFilters): Promise<PaginatedList<Application>>;
  abstract create(createApplicationDto: CreateApplicationDto): Promise<Application>;
  abstract update(id: string, updateApplicationDto: UpdateApplicationDto): Promise<Application>;
  abstract updateStatus(id: string, status: string): Promise<Application>;
  abstract remove(id: string): Promise<void>;
  abstract findByApplicant(applicantId: string): Promise<Application[]>;
  abstract findByVacancy(vacancyId: string): Promise<Application[]>;
}
