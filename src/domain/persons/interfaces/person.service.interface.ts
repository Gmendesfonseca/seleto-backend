import { Person, PersonFilters } from './person.interface';
import { CreatePersonDto, UpdatePersonDto } from '../dto/person.dto';
import { CandidateVacancyMatch } from '../../matching/interfaces/candidate-vacancy-match.interface';
import { CreatePersonExperienceDto } from '../dto/person-experience.dto';
import { CreatePersonCompetenceDto } from '../dto/person-competence.dto';
import { CreatePersonFormationDto } from '../dto/person-formation.dto';

export abstract class PersonServiceInterface {
  abstract findAll(filters?: PersonFilters): Promise<Person[]>;
  abstract findOne(id: string): Promise<Person | null>;
  abstract findByUserId(userId: string): Promise<Person | null>;
  abstract create(createPersonDto: CreatePersonDto): Promise<Person>;
  abstract update(id: string, updatePersonDto: UpdatePersonDto): Promise<Person>;
  abstract remove(id: string): Promise<void>;
  abstract addCompetence(
    personId: string,
    addCompetenceDto: CreatePersonCompetenceDto,
  ): Promise<Person>;
  abstract removeCompetence(personId: string, competenceId: string): Promise<Person>;
  abstract addWorkExperience(
    personId: string,
    addWorkExperienceDto: CreatePersonExperienceDto,
  ): Promise<Person>;
  abstract removeWorkExperience(personId: string, experienceId: string): Promise<Person>;
  abstract addEducation(
    personId: string,
    addEducationDto: CreatePersonFormationDto,
  ): Promise<Person>;
  abstract removeEducation(personId: string, educationId: string): Promise<Person>;
  abstract findMatchingVacancies(
    personId: string,
    minScore?: number,
    limit?: number,
  ): Promise<CandidateVacancyMatch[]>;
}
