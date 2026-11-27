import { InjectModel } from '@nestjs/sequelize';
import { PersonCompetenceRepository } from '../interfaces/person-competence.repository.interface';
import { PersonCompetence } from '../person-competence.model';
import { Logger } from '@nestjs/common/services/logger.service';
import {
  CreatePersonCompetenceDto,
  PersonCompetenceFilters,
  UpdatePersonCompetenceDto,
} from '../dto/person-competence.dto';
import { WhereOptions } from 'sequelize';
import { Competence } from '../../competences/competence.model';

export class PersonCompetenceSequelizeRepository implements PersonCompetenceRepository {
  private readonly logger = new Logger(PersonCompetenceSequelizeRepository.name);

  constructor(
    @InjectModel(PersonCompetence)
    private readonly model: typeof PersonCompetence,
    @InjectModel(Competence)
    private readonly competenceModel: typeof Competence,
  ) {}

  async findAll(filters?: PersonCompetenceFilters): Promise<PersonCompetence[]> {
    this.logger.debug('PersonCompetenceSequelizeRepository.findAll: Called');
    const where: WhereOptions<PersonCompetence> = {};

    if (filters?.personId) {
      where.person_id = filters.personId;
    }

    return this.model.findAll({ where });
  }

  async findOne(id: string): Promise<PersonCompetence | null> {
    this.logger.debug('PersonCompetenceSequelizeRepository.findOne: Called');
    return this.model.findByPk(id);
  }

  async create(personId: string, dto: CreatePersonCompetenceDto): Promise<PersonCompetence> {
    this.logger.debug('PersonCompetenceSequelizeRepository.create: Called');
    return this.model.create({
      person_id: personId,
      competence_id: dto.competenceId,
      proficiency_level: dto.level,
      years_of_experience: dto.yearsOfExperience ?? null,
      description: dto.description ?? null,
    } as PersonCompetence);
  }

  async competenceExists(competenceId: string): Promise<boolean> {
    this.logger.debug('PersonCompetenceSequelizeRepository.competenceExists: Called');
    return (await this.competenceModel.count({ where: { id: competenceId } })) > 0;
  }

  async hasCompetence(personId: string, competenceId: string): Promise<boolean> {
    this.logger.debug('PersonCompetenceSequelizeRepository.hasCompetence: Called');
    const count = await this.model.count({
      where: { person_id: personId, competence_id: competenceId },
    });
    return count > 0;
  }

  async update(id: string, dto: UpdatePersonCompetenceDto): Promise<PersonCompetence> {
    this.logger.debug('PersonCompetenceSequelizeRepository.update: Called');
    const competence = await this.model.findByPk(id);
    if (!competence) {
      throw new Error(`PersonCompetence with id ${id} not found`);
    }
    await competence.update({
      ...(dto.level !== undefined && { proficiency_level: dto.level }),
      ...(dto.yearsOfExperience !== undefined && { years_of_experience: dto.yearsOfExperience }),
      ...(dto.description !== undefined && { description: dto.description }),
    });
    return competence;
  }

  async delete(id: string): Promise<void> {
    this.logger.debug('PersonCompetenceSequelizeRepository.delete: Called');
    const competence = await this.model.findByPk(id);
    if (!competence) {
      throw new Error(`PersonCompetence with id ${id} not found`);
    }
    await competence.destroy();
  }
}
