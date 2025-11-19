import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CompetenceServiceInterface } from './interfaces/competence.service.interface';
import { CompetenceRepository } from './repositories/competence.repository.interface';
import { CreateCompetenceDto, UpdateCompetenceDto } from './dto/competence.dto';
import {
  Competence,
  CompetenceCategory,
  CompetenceFilters,
} from './interfaces/competence.interface';

@Injectable()
export class CompetenceService implements CompetenceServiceInterface {
  private readonly logger = new Logger(CompetenceService.name);

  constructor(private readonly repository: CompetenceRepository) {}

  async findOne(id: string): Promise<Competence | null> {
    this.logger.debug('FindOne: Called');
    return this.repository.findOne(id);
  }

  async findAll(filters?: CompetenceFilters): Promise<Competence[]> {
    this.logger.debug('FindAll: Called');
    return this.repository.findAll(filters);
  }

  async create(createCompetenceDto: CreateCompetenceDto): Promise<Competence> {
    this.logger.debug('Create: Called');
    return this.repository.create(createCompetenceDto);
  }

  async update(id: string, updateCompetenceDto: UpdateCompetenceDto): Promise<Competence> {
    this.logger.debug('Update: Called');
    const competence = await this.repository.findOne(id);
    if (!competence) {
      throw new NotFoundException(`Competence with id ${id} not found`);
    }
    return this.repository.update(id, updateCompetenceDto);
  }

  async remove(id: string): Promise<void> {
    this.logger.debug('Remove: Called');
    const competence = await this.repository.findOne(id);
    if (!competence) {
      throw new NotFoundException(`Competence with id ${id} not found`);
    }
    await this.repository.delete(id);
  }

  async findByCategory(category: CompetenceCategory): Promise<Competence[]> {
    this.logger.debug('FindByCategory: Called');
    return this.repository.findByCategory(category);
  }

  async searchByName(name: string): Promise<Competence[]> {
    this.logger.debug('SearchByName: Called');
    return this.repository.searchByName(name);
  }
}
