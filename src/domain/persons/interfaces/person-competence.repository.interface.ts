import {
  CreatePersonCompetenceDto,
  PersonCompetenceFilters,
  UpdatePersonCompetenceDto,
} from '../dto/person-competence.dto';
import { PersonCompetence } from '../person-competence.model';

export abstract class PersonCompetenceRepository {
  abstract create(dto: CreatePersonCompetenceDto): Promise<PersonCompetence>;
  abstract findAll(filters?: PersonCompetenceFilters): Promise<PersonCompetence[]>;
  abstract findOne(id: string): Promise<PersonCompetence | null>;
  abstract update(id: string, dto: UpdatePersonCompetenceDto): Promise<PersonCompetence>;
  abstract delete(id: string): Promise<void>;
}
