import { Logger } from '@nestjs/common';
import { PersonFormation } from '../person-formation.model';
import { InjectModel } from '@nestjs/sequelize/dist/common/sequelize.decorators';
import { CreatePersonFormationDto } from '../dto/person-formation.dto';
import { PersonFormationRepository } from '../interfaces/person-formation.repository.interface';

export class PersonFormationSequelizeRepository implements PersonFormationRepository {
  private readonly logger = new Logger(PersonFormationSequelizeRepository.name);

  constructor(
    @InjectModel(PersonFormation)
    private readonly model: typeof PersonFormation,
  ) {}

  async findAll(): Promise<PersonFormation[]> {
    this.logger.debug('PersonFormationSequelizeRepository.findAll: Called');
    return this.model.findAll();
  }

  async findOne(id: string): Promise<PersonFormation | null> {
    this.logger.debug('PersonFormationSequelizeRepository.findOne: Called');
    return this.model.findByPk(id);
  }

  async create(dto: CreatePersonFormationDto): Promise<PersonFormation> {
    this.logger.debug('PersonFormationSequelizeRepository.create: Called');
    return this.model.create({
      personId: dto.personId,
      institutionName: dto.institutionName,
      degree: dto.degree,
      fieldOfStudy: dto.fieldOfStudy,
      startDate: dto.startDate,
      endDate: dto.endDate,
      grade: dto.grade,
      description: dto.description,
    } as unknown as PersonFormation);
  }

  async update(id: string, dto: Partial<CreatePersonFormationDto>): Promise<PersonFormation> {
    this.logger.debug('PersonFormationSequelizeRepository.update: Called');
    const formation = await this.model.findByPk(id);
    if (!formation) {
      throw new Error(`PersonFormation with id ${id} not found`);
    }
    await formation.update(dto as unknown as PersonFormation);
    return formation;
  }

  async delete(id: string): Promise<void> {
    this.logger.debug('PersonFormationSequelizeRepository.delete: Called');
    const formation = await this.model.findByPk(id);
    if (!formation) {
      throw new Error(`PersonFormation with id ${id} not found`);
    }
    await formation.destroy();
  }
}
