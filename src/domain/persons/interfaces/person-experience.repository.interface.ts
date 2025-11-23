import {
  CreatePersonExperienceDto,
  PersonExperienceFilters,
  UpdatePersonExperienceDto,
} from '../dto/person-experience.dto';
import { PersonExperience } from '../person-experience.model';

export abstract class PersonExperienceRepository {
  abstract create(dto: CreatePersonExperienceDto): Promise<PersonExperience>;
  abstract findAll(filters?: PersonExperienceFilters): Promise<PersonExperience[]>;
  abstract findOne(id: string): Promise<PersonExperience | null>;
  abstract update(id: string, dto: UpdatePersonExperienceDto): Promise<PersonExperience>;
  abstract delete(id: string): Promise<void>;
}
