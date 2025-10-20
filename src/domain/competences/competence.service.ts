import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CompetenceServiceInterface } from './interfaces/competence.service.interface';
import { CompetenceRepository } from './repositories/competence.repository.interface';
import { CreateCompetenceDto, UpdateCompetenceDto } from './dto/competence.dto';
import { Competence, CompetenceCategory, CompetenceFilters } from './interfaces/competence.interface';

@Injectable()
export class CompetenceService implements CompetenceServiceInterface {
  private readonly logger = new Logger(CompetenceService.name);

  constructor(private readonly competenceRepository: CompetenceRepository) {}

  async create(createCompetenceDto: CreateCompetenceDto): Promise<Competence> {
    this.logger.debug('CompetenceService.create: Called');
    return this.competenceRepository.create(createCompetenceDto);
  }

  async findAll(filters?: CompetenceFilters): Promise<Competence[]> {
    this.logger.debug('CompetenceService.findAll: Called');
    return this.competenceRepository.findAll(filters);
  }

  async findOne(id: string): Promise<Competence | null> {
    this.logger.debug('CompetenceService.findOne: Called');
    return this.competenceRepository.findOne(id);
  }

  async update(id: string, updateCompetenceDto: UpdateCompetenceDto): Promise<Competence> {
    this.logger.debug('CompetenceService.update: Called');
    const competence = await this.competenceRepository.findOne(id);
    if (!competence) {
      throw new NotFoundException(`Competence with id ${id} not found`);
    }
    return this.competenceRepository.update(id, updateCompetenceDto);
  }

  async remove(id: string): Promise<void> {
    this.logger.debug('CompetenceService.remove: Called');
    const competence = await this.competenceRepository.findOne(id);
    if (!competence) {
      throw new NotFoundException(`Competence with id ${id} not found`);
    }
    await this.competenceRepository.delete(id);
  }

  async findByCategory(category: CompetenceCategory): Promise<Competence[]> {
    this.logger.debug('CompetenceService.findByCategory: Called');
    return this.competenceRepository.findByCategory(category);
  }

  async searchByName(name: string): Promise<Competence[]> {
    this.logger.debug('CompetenceService.searchByName: Called');
    return this.competenceRepository.searchByName(name);
  }
}
