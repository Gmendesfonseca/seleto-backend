import {
  CreatePersonCompetenceDto,
  PersonCompetenceFilters,
  UpdatePersonCompetenceDto,
} from '../dto/person-competence.dto';
import { PersonCompetence } from '../person-competence.model';

export abstract class PersonCompetenceRepository {
  abstract create(personId: string, dto: CreatePersonCompetenceDto): Promise<PersonCompetence>;
  abstract competenceExists(competenceId: string): Promise<boolean>;
  abstract hasCompetence(personId: string, competenceId: string): Promise<boolean>;
  abstract findAll(filters?: PersonCompetenceFilters): Promise<PersonCompetence[]>;
  abstract findOne(id: string): Promise<PersonCompetence | null>;
  abstract update(id: string, dto: UpdatePersonCompetenceDto): Promise<PersonCompetence>;
  abstract delete(id: string): Promise<void>;
}
