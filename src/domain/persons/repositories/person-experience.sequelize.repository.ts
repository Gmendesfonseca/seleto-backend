import { InjectModel } from '@nestjs/sequelize';
import { PersonExperienceRepository } from '../interfaces/person-experience.repository.interface';
import { PersonExperience } from '../person-experience.model';
import { Logger } from '@nestjs/common/services/logger.service';
import { CreatePersonExperienceDto, PersonExperienceFilters } from '../dto/person-experience.dto';
import { WhereOptions } from 'sequelize';

export class PersonExperienceSequelizeRepository implements PersonExperienceRepository {
  private readonly logger = new Logger(PersonExperienceSequelizeRepository.name);

  constructor(
    @InjectModel(PersonExperience)
    private readonly model: typeof PersonExperience,
  ) {}

  async findAll(filters?: PersonExperienceFilters): Promise<PersonExperience[]> {
    this.logger.debug('PersonExperienceSequelizeRepository.findAll: Called');
    const where: WhereOptions<PersonExperience> = {};

    if (filters?.personId) {
      where.personId = filters.personId;
    }

    return this.model.findAll({ where });
  }

  async create(dto: CreatePersonExperienceDto): Promise<PersonExperience> {
    this.logger.debug('PersonExperienceSequelizeRepository.create: Called');
    return this.model.create({
      personId: dto.personId,
      startDate: dto.startDate,
      endDate: dto.endDate,
      description: dto.description,
      companyName: dto.companyName,
      position: dto.position,
      isCurrent: dto.isCurrent,
      location: dto.location,
    } as unknown as PersonExperience);
  }

  async findOne(id: string): Promise<PersonExperience | null> {
    this.logger.debug('PersonExperienceSequelizeRepository.findOne: Called');
    return this.model.findByPk(id);
  }

  async update(id: string, dto: Partial<CreatePersonExperienceDto>): Promise<PersonExperience> {
    this.logger.debug('PersonExperienceSequelizeRepository.update: Called');
    const experience = await this.model.findByPk(id);
    if (!experience) {
      throw new Error(`PersonExperience with id ${id} not found`);
    }
    await experience.update(dto as unknown as PersonExperience);
    return experience;
  }

  async delete(id: string): Promise<void> {
    this.logger.debug('PersonExperienceSequelizeRepository.delete: Called');
    const experience = await this.model.findByPk(id);
    if (!experience) {
      throw new Error(`PersonExperience with id ${id} not found`);
    }
    await experience.destroy();
  }
}
