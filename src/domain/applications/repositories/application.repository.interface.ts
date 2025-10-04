import { CreateApplicationDto } from '../dto/create.dto';
import { UpdateApplicationDto } from '../dto/update.dto';
import { Application, ApplicationFilters } from '../interfaces/application.interface';

export abstract class ApplicationRepository {
  abstract create(createApplicationDto: CreateApplicationDto): Promise<Application>;
  abstract findAll(filters?: ApplicationFilters): Promise<Application[]>;
  abstract findOne(id: string): Promise<Application | null>;
  abstract update(id: string, updateApplicationDto: UpdateApplicationDto): Promise<Application>;
  abstract delete(id: string): Promise<void>;
  abstract findByApplicant(applicantId: string): Promise<Application[]>;
  abstract findByVacancy(vacancyId: string): Promise<Application[]>;
  abstract countByFilters(filters?: ApplicationFilters): Promise<number>;
}
