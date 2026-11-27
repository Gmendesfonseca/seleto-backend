import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Competence as CompetenceModel } from '../competence.model';
import { CompetenceRepository } from './competence.repository.interface';
import { CreateCompetenceDto, UpdateCompetenceDto } from '../dto/competence.dto';
import { Competence, CompetenceFilters } from '../interfaces/competence.interface';
import { Op, WhereOptions } from 'sequelize';
import { Company } from 'src/domain/companies/company.model';

// The persistence model does not declare category/level, so rows are exposed through the domain interface.
const toCompetence = (row: CompetenceModel) => row as unknown as Competence;
const toCompetences = (rows: CompetenceModel[]) => rows as unknown as Competence[];

@Injectable()
export class CompetenceSequelizeRepository implements CompetenceRepository {
  private readonly logger = new Logger(CompetenceSequelizeRepository.name);

  constructor(
    @InjectModel(CompetenceModel)
    private readonly model: typeof CompetenceModel,
  ) {}

  async create(dto: CreateCompetenceDto): Promise<Competence> {
    this.logger.debug('CompetenceSequelizeRepository.create: Called');
    return toCompetence(await this.model.create(dto as never));
  }

  async findAll(filters?: CompetenceFilters): Promise<Competence[]> {
    this.logger.debug('CompetenceSequelizeRepository.findAll: Called');
    const where: WhereOptions = {};

    if (filters?.name) {
      where.name = { [Op.iLike]: `%${filters.name}%` };
    }

    return toCompetences(
      await this.model.findAll({
        where,
        include: [
          {
            model: Company,
            attributes: ['id', 'name'],
          },
        ],
      }),
    );
  }

  async findOne(id: string): Promise<Competence | null> {
    this.logger.debug('CompetenceSequelizeRepository.findOne: Called');
    const competence = await this.model.findOne({
      where: { id },
      include: [
        {
          model: Company,
          attributes: ['id', 'name'],
        },
      ],
    });
    return competence && toCompetence(competence);
  }

  async update(id: string, updateCompetenceDto: UpdateCompetenceDto): Promise<Competence> {
    this.logger.debug('CompetenceSequelizeRepository.update: Called');
    const competence = await this.model.findByPk(id);
    if (!competence) {
      throw new Error('Competence not found');
    }

    await competence.update(updateCompetenceDto as any);
    return toCompetence(competence);
  }

  async delete(id: string): Promise<void> {
    this.logger.debug('CompetenceSequelizeRepository.delete: Called');
    await this.model.destroy({ where: { id } });
  }

  async searchByName(name: string): Promise<Competence[]> {
    this.logger.debug('CompetenceSequelizeRepository.searchByName: Called');
    return toCompetences(
      await this.model.findAll({
        where: {
          name: { [Op.iLike]: `%${name}%` },
        },
      }),
    );
  }

  async countByFilters(filters?: CompetenceFilters): Promise<number> {
    this.logger.debug('CompetenceSequelizeRepository.countByFilters: Called');
    const where: WhereOptions = {};

    if (filters?.name) {
      where.name = { [Op.iLike]: `%${filters.name}%` };
    }

    return this.model.count({ where });
  }
}
