import { Injectable, Logger, NotFoundException, Inject } from '@nestjs/common';
import { PersonServiceInterface } from './interfaces/person.service.interface';
import { PersonRepository } from './repositories/person.repository.interface';
import { Person, PersonFilters } from './interfaces/person.interface';
import {
  CreatePersonDto,
  UpdatePersonDto,
  AddCompetenceDto,
  AddWorkExperienceDto,
  AddEducationDto,
} from './dto/person.dto';

@Injectable()
export class PersonService implements PersonServiceInterface {
  private readonly logger = new Logger(PersonService.name);

  constructor(
    @Inject(PersonRepository)
    private readonly personRepository: PersonRepository,
  ) {}

  async create(createPersonDto: CreatePersonDto): Promise<Person> {
    this.logger.debug('PersonService.create: Called');
    return this.personRepository.create(createPersonDto);
  }

  async findAll(filters?: PersonFilters): Promise<Person[]> {
    this.logger.debug('PersonService.findAll: Called');
    return this.personRepository.findAll(filters);
  }

  async findOne(id: string): Promise<Person | null> {
    this.logger.debug('PersonService.findOne: Called');
    return this.personRepository.findOne(id);
  }

  async update(id: string, updatePersonDto: UpdatePersonDto): Promise<Person> {
    this.logger.debug('PersonService.update: Called');
    const person = await this.personRepository.findOne(id);
    if (!person) {
      throw new NotFoundException(`Person with id ${id} not found`);
    }
    return this.personRepository.update(id, updatePersonDto);
  }

  async remove(id: string): Promise<void> {
    this.logger.debug('PersonService.remove: Called');
    const person = await this.personRepository.findOne(id);
    if (!person) {
      throw new NotFoundException(`Person with id ${id} not found`);
    }
    await this.personRepository.delete(id);
  }

  async addCompetence(personId: string, _addCompetenceDto: AddCompetenceDto): Promise<Person> {
    this.logger.debug('PersonService.addCompetence: Called');
    const person = await this.personRepository.findOne(personId);
    if (!person) {
      throw new NotFoundException(`Person with id ${personId} not found`);
    }
    // This would need to be implemented with a junction table
    // For now, return the person as-is
    return person;
  }

  async removeCompetence(personId: string, _competenceId: string): Promise<Person> {
    this.logger.debug('PersonService.removeCompetence: Called');
    const person = await this.personRepository.findOne(personId);
    if (!person) {
      throw new NotFoundException(`Person with id ${personId} not found`);
    }
    // This would need to be implemented with a junction table
    // For now, return the person as-is
    return person;
  }

  async addWorkExperience(
    personId: string,
    _addWorkExperienceDto: AddWorkExperienceDto,
  ): Promise<Person> {
    this.logger.debug('PersonService.addWorkExperience: Called');
    const person = await this.personRepository.findOne(personId);
    if (!person) {
      throw new NotFoundException(`Person with id ${personId} not found`);
    }
    // This would need to be implemented with a separate work_experiences table
    // For now, return the person as-is
    return person;
  }

  async removeWorkExperience(personId: string, _experienceId: string): Promise<Person> {
    this.logger.debug('PersonService.removeWorkExperience: Called');
    const person = await this.personRepository.findOne(personId);
    if (!person) {
      throw new NotFoundException(`Person with id ${personId} not found`);
    }
    // This would need to be implemented with a separate work_experiences table
    // For now, return the person as-is
    return person;
  }

  async addEducation(personId: string, _addEducationDto: AddEducationDto): Promise<Person> {
    this.logger.debug('PersonService.addEducation: Called');
    const person = await this.personRepository.findOne(personId);
    if (!person) {
      throw new NotFoundException(`Person with id ${personId} not found`);
    }
    // This would need to be implemented with a separate education table
    // For now, return the person as-is
    return person;
  }

  async removeEducation(personId: string, _educationId: string): Promise<Person> {
    this.logger.debug('PersonService.removeEducation: Called');
    const person = await this.personRepository.findOne(personId);
    if (!person) {
      throw new NotFoundException(`Person with id ${personId} not found`);
    }
    // This would need to be implemented with a separate education table
    // For now, return the person as-is
    return person;
  }
}
