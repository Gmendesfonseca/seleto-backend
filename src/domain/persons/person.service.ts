import { Injectable, Logger, NotFoundException, Inject } from '@nestjs/common';
import { PersonServiceInterface } from './interfaces/person.service.interface';
import { PersonRepository } from './interfaces/person.repository.interface';
import { Person, PersonFilters } from './interfaces/person.interface';
import {
  CreatePersonDto,
  UpdatePersonDto,
  AddCompetenceDto,
  AddWorkExperienceDto,
  AddEducationDto,
} from './dto/person.dto';
import { PersonExperienceRepository } from './interfaces/person-experience.repository.interface';
import { PersonFormationRepository } from './interfaces/person-formation.repository.interface';
import { PersonCompetenceRepository } from './interfaces/person-competence.repository.interface';
import { MatchingService } from '../matching/matching.service';
import { CandidateVacancyMatch } from '../matching/interfaces/candidate-vacancy-match.interface';

@Injectable()
export class PersonService implements PersonServiceInterface {
  private readonly logger = new Logger(PersonService.name);

  constructor(
    @Inject(PersonRepository)
    private readonly repository: PersonRepository,
    @Inject(PersonExperienceRepository)
    private readonly experienceRepository: PersonExperienceRepository,
    @Inject(PersonFormationRepository)
    private readonly formationRepository: PersonFormationRepository,
    @Inject(PersonCompetenceRepository)
    private readonly competenceRepository: PersonCompetenceRepository,
    private readonly matchingService: MatchingService,
  ) {}

  async create(createPersonDto: CreatePersonDto): Promise<Person> {
    this.logger.debug('PersonService.create: Called');
    return this.repository.create(createPersonDto);
  }

  async findAll(filters?: PersonFilters): Promise<Person[]> {
    this.logger.debug('PersonService.findAll: Called');
    return this.repository.findAll(filters);
  }

  async findOne(id: string): Promise<Person | null> {
    this.logger.debug('PersonService.findOne: Called');
    return this.repository.findOne({ id });
  }

  async findByUserId(userId: string): Promise<Person | null> {
    this.logger.debug('PersonService.findByUserId: Called');
    const person = await this.repository.findOne({ user_id: userId });
    if (!person) {
      throw new NotFoundException(`Person with userId ${userId} not found`);
    }
    return person;
  }

  async update(id: string, updatePersonDto: UpdatePersonDto): Promise<Person> {
    this.logger.debug('PersonService.update: Called');
    const person = await this.repository.findOne({ id });
    if (!person) {
      throw new NotFoundException(`Person with id ${id} not found`);
    }
    return this.repository.update(id, updatePersonDto);
  }

  async remove(id: string): Promise<void> {
    this.logger.debug('PersonService.remove: Called');
    const person = await this.repository.findOne({ id });
    if (!person) {
      throw new NotFoundException(`Person with id ${id} not found`);
    }
    await this.repository.delete(id);
  }

  async addCompetence(id: string, dto: AddCompetenceDto): Promise<Person> {
    this.logger.debug('PersonService.addCompetence: Called');
    const person = await this.repository.findOne({ id });
    if (!person) {
      throw new NotFoundException(`Person with id ${id} not found`);
    }
    await this.competenceRepository.create(dto);
    return person;
  }

  async removeCompetence(id: string, competenceId: string): Promise<Person> {
    this.logger.debug('PersonService.removeCompetence: Called');
    const person = await this.repository.findOne({ id });
    if (!person) {
      throw new NotFoundException(`Person with id ${id} not found`);
    }
    await this.competenceRepository.delete(competenceId);
    return person;
  }

  async addWorkExperience(id: string, dto: AddWorkExperienceDto): Promise<Person> {
    this.logger.debug('PersonService.addWorkExperience: Called');
    const person = await this.repository.findOne({ id });
    if (!person) {
      throw new NotFoundException(`Person with id ${id} not found`);
    }
    await this.experienceRepository.create(dto);
    return person;
  }

  async removeWorkExperience(id: string, experienceId: string): Promise<Person> {
    this.logger.debug('PersonService.removeWorkExperience: Called');
    const person = await this.repository.findOne({ id });
    if (!person) {
      throw new NotFoundException(`Person with id ${id} not found`);
    }
    await this.experienceRepository.delete(experienceId);
    return person;
  }

  async addEducation(id: string, dto: AddEducationDto): Promise<Person> {
    this.logger.debug('PersonService.addEducation: Called');
    const person = await this.repository.findOne({ id });
    if (!person) {
      throw new NotFoundException(`Person with id ${id} not found`);
    }
    await this.formationRepository.create(dto);
    return person;
  }

  async removeEducation(id: string, educationId: string): Promise<Person> {
    this.logger.debug('PersonService.removeEducation: Called');
    const person = await this.repository.findOne({ id });
    if (!person) {
      throw new NotFoundException(`Person with id ${id} not found`);
    }
    await this.formationRepository.delete(educationId);
    return person;
  }

  async findMatchingVacancies(
    personId: string,
    minScore?: number,
    limit?: number,
  ): Promise<CandidateVacancyMatch[]> {
    this.logger.debug('PersonService.findMatchingVacancies: Called');
    const person = await this.repository.findOne({ id: personId });
    if (!person) {
      throw new NotFoundException(`Person with id ${personId} not found`);
    }
    return this.matchingService.findMatchesForPerson(personId, minScore, limit);
  }
}
