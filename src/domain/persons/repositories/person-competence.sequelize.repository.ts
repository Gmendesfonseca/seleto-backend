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

export class PersonCompetenceSequelizeRepository implements PersonCompetenceRepository {
  private readonly logger = new Logger(PersonCompetenceSequelizeRepository.name);

  constructor(
    @InjectModel(PersonCompetence)
    private readonly model: typeof PersonCompetence,
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

  async create(dto: CreatePersonCompetenceDto): Promise<PersonCompetence> {
    this.logger.debug('PersonCompetenceSequelizeRepository.create: Called');
    return this.model.create({
      personId: dto.personId,
      competenceName: dto.competenceName,
      proficiencyLevel: dto.proficiencyLevel,
      yearsOfExperience: dto.yearsOfExperience,
    } as unknown as PersonCompetence);
  }

  async update(id: string, dto: UpdatePersonCompetenceDto): Promise<PersonCompetence> {
    this.logger.debug('PersonCompetenceSequelizeRepository.update: Called');
    const competence = await this.model.findByPk(id);
    if (!competence) {
      throw new Error(`PersonCompetence with id ${id} not found`);
    }
    await competence.update(dto as unknown as PersonCompetence);
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
