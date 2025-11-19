import { CreateApplicationDto } from '../dto/create.dto';
import { UpdateApplicationDto } from '../dto/update.dto';
import { Application, ApplicationFilters } from '../interfaces/application.interface';

export abstract class ApplicationRepository {
  abstract findOne(id: string): Promise<Application | null>;
  abstract findAll(filters?: ApplicationFilters): Promise<Application[]>;
  abstract create(createApplicationDto: CreateApplicationDto): Promise<Application>;
  abstract update(id: string, updateApplicationDto: UpdateApplicationDto): Promise<Application>;
  abstract delete(id: string): Promise<void>;
  abstract countByFilters(filters?: ApplicationFilters): Promise<number>;
}
