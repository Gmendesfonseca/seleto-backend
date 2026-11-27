import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CompetenceServiceInterface } from './interfaces/competence.service.interface';
import { CompetenceRepository } from './repositories/competence.repository.interface';
import { CreateCompetenceDto, UpdateCompetenceDto } from './dto/competence.dto';
import { Competence, CompetenceFilters } from './interfaces/competence.interface';

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
    await this.assertNameAvailable(createCompetenceDto.name);
    return this.repository.create(createCompetenceDto);
  }

  async update(id: string, updateCompetenceDto: UpdateCompetenceDto): Promise<Competence> {
    this.logger.debug('Update: Called');
    const competence = await this.repository.findOne(id);
    if (!competence) {
      throw new NotFoundException(`Competence with id ${id} not found`);
    }
    await this.assertNameAvailable(updateCompetenceDto.name, id);
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

  async searchByName(name: string): Promise<Competence[]> {
    this.logger.debug('SearchByName: Called');
    return this.repository.searchByName(name);
  }

  private async assertNameAvailable(name: string, ownId?: string): Promise<void> {
    const existing = await this.repository.findByName(name);
    if (existing && existing.id !== ownId) {
      throw new ConflictException(`A competence named "${existing.name}" already exists`);
    }
  }
}
