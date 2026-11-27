import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, WhereOptions, fn, col, where as whereFn } from 'sequelize';
import { Competence as CompetenceModel } from '../competence.model';
import { CompetenceRepository } from './competence.repository.interface';
import { CreateCompetenceDto, UpdateCompetenceDto } from '../dto/competence.dto';
import { Competence, CompetenceFilters } from '../interfaces/competence.interface';

const toCompetence = (row: CompetenceModel): Competence => ({
  id: row.id,
  name: row.name,
  description: row.description ?? null,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});

const nameFilter = (filters?: CompetenceFilters): WhereOptions =>
  filters?.name ? { name: { [Op.iLike]: `%${filters.name}%` } } : {};

@Injectable()
export class CompetenceSequelizeRepository implements CompetenceRepository {
  private readonly logger = new Logger(CompetenceSequelizeRepository.name);

  constructor(
    @InjectModel(CompetenceModel)
    private readonly model: typeof CompetenceModel,
  ) {}

  async create(dto: CreateCompetenceDto): Promise<Competence> {
    this.logger.debug('CompetenceSequelizeRepository.create: Called');
    const row = await this.model.create({
      name: dto.name,
      description: dto.description ?? null,
      company_id: null,
    } as CompetenceModel);
    return toCompetence(row);
  }

  async findAll(filters?: CompetenceFilters): Promise<Competence[]> {
    this.logger.debug('CompetenceSequelizeRepository.findAll: Called');
    const rows = await this.model.findAll({ where: nameFilter(filters), order: [['name', 'ASC']] });
    return rows.map(toCompetence);
  }

  async findOne(id: string): Promise<Competence | null> {
    this.logger.debug('CompetenceSequelizeRepository.findOne: Called');
    const row = await this.model.findByPk(id);
    return row && toCompetence(row);
  }

  async findByName(name: string): Promise<Competence | null> {
    this.logger.debug('CompetenceSequelizeRepository.findByName: Called');
    const row = await this.model.findOne({
      where: {
        [Op.and]: [whereFn(fn('lower', col('name')), name.toLowerCase()), { company_id: null }],
      },
    });
    return row && toCompetence(row);
  }

  async update(id: string, dto: UpdateCompetenceDto): Promise<Competence> {
    this.logger.debug('CompetenceSequelizeRepository.update: Called');
    const row = await this.model.findByPk(id);
    if (!row) {
      throw new Error('Competence not found');
    }
    await row.update({ name: dto.name, description: dto.description ?? null });
    return toCompetence(row);
  }

  async delete(id: string): Promise<void> {
    this.logger.debug('CompetenceSequelizeRepository.delete: Called');
    await this.model.destroy({ where: { id } });
  }

  async searchByName(name: string): Promise<Competence[]> {
    this.logger.debug('CompetenceSequelizeRepository.searchByName: Called');
    const rows = await this.model.findAll({ where: nameFilter({ name }) });
    return rows.map(toCompetence);
  }

  async countByFilters(filters?: CompetenceFilters): Promise<number> {
    this.logger.debug('CompetenceSequelizeRepository.countByFilters: Called');
    return this.model.count({ where: nameFilter(filters) });
  }
}
