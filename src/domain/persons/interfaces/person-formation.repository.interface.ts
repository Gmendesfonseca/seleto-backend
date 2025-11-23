import {
  CreatePersonFormationDto,
  PersonFormationFilters,
  UpdatePersonFormationDto,
} from '../dto/person-formation.dto';
import { PersonFormation } from '../person-formation.model';

export abstract class PersonFormationRepository {
  abstract create(dto: CreatePersonFormationDto): Promise<PersonFormation>;
  abstract findAll(filters?: PersonFormationFilters): Promise<PersonFormation[]>;
  abstract findOne(id: string): Promise<PersonFormation | null>;
  abstract update(id: string, dto: UpdatePersonFormationDto): Promise<PersonFormation>;
  abstract delete(id: string): Promise<void>;
}
