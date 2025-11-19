import { Person, PersonFilters } from './person.interface';
import {
  CreatePersonDto,
  UpdatePersonDto,
  AddCompetenceDto,
  AddWorkExperienceDto,
  AddEducationDto,
} from '../dto/person.dto';

export abstract class PersonServiceInterface {
  abstract create(createPersonDto: CreatePersonDto): Promise<Person>;
  abstract findAll(filters?: PersonFilters): Promise<Person[]>;
  abstract findOne(id: string): Promise<Person | null>;
  abstract update(id: string, updatePersonDto: UpdatePersonDto): Promise<Person>;
  abstract remove(id: string): Promise<void>;
  abstract addCompetence(personId: string, addCompetenceDto: AddCompetenceDto): Promise<Person>;
  abstract removeCompetence(personId: string, competenceId: string): Promise<Person>;
  abstract addWorkExperience(
    personId: string,
    addWorkExperienceDto: AddWorkExperienceDto,
  ): Promise<Person>;
  abstract removeWorkExperience(personId: string, experienceId: string): Promise<Person>;
  abstract addEducation(personId: string, addEducationDto: AddEducationDto): Promise<Person>;
  abstract removeEducation(personId: string, educationId: string): Promise<Person>;
}
