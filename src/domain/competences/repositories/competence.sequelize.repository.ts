import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Competence } from '../competence.model';
import { CompetenceRepository } from './competence.repository.interface';
import { CreateCompetenceDto, UpdateCompetenceDto } from '../dto/competence.dto';
import { CompetenceFilters } from '../interfaces/competence.interface';
import { Op, WhereOptions } from 'sequelize';
import { Company } from 'src/domain/companies/company.model';

@Injectable()
export class CompetenceSequelizeRepository implements CompetenceRepository {
  private readonly logger = new Logger(CompetenceSequelizeRepository.name);

  constructor(
    @InjectModel(Competence)
    private readonly model: typeof Competence,
  ) {}

  async create(dto: CreateCompetenceDto): Promise<Competence> {
    this.logger.debug('CompetenceSequelizeRepository.create: Called');
    return this.model.create(dto as Competence);
  }

  async findAll(filters?: CompetenceFilters): Promise<Competence[]> {
    this.logger.debug('CompetenceSequelizeRepository.findAll: Called');
    const where: WhereOptions<Competence> = {};

    if (filters?.name) {
      where.name = { [Op.iLike]: `%${filters.name}%` };
    }
    if (filters?.category) {
      where.category = filters.category;
    }
    if (filters?.level) {
      where.level = filters.level;
    }

    return this.model.findAll({
      where,
      include: [
        {
          model: Company,
          attributes: ['id', 'name'],
        },
      ],
    });
  }

  async findOne(id: string): Promise<Competence | null> {
    this.logger.debug('CompetenceSequelizeRepository.findOne: Called');
    return this.model.findOne({
      where: { id },
      include: [
        {
          model: Company,
          attributes: ['id', 'name'],
        },
      ],
    });
  }

  async update(id: string, updateCompetenceDto: UpdateCompetenceDto): Promise<Competence> {
    this.logger.debug('CompetenceSequelizeRepository.update: Called');
    const competence = await this.model.findByPk(id);
    if (!competence) {
      throw new Error('Competence not found');
    }

    await competence.update(updateCompetenceDto as any);
    return competence;
  }

  async delete(id: string): Promise<void> {
    this.logger.debug('CompetenceSequelizeRepository.delete: Called');
    await this.model.destroy({ where: { id } });
  }

  async findByCategory(category: string): Promise<Competence[]> {
    this.logger.debug('CompetenceSequelizeRepository.findByCategory: Called');
    return this.model.findAll({
      where: { category },
    });
  }

  async searchByName(name: string): Promise<Competence[]> {
    this.logger.debug('CompetenceSequelizeRepository.searchByName: Called');
    return this.model.findAll({
      where: {
        name: { [Op.iLike]: `%${name}%` },
      },
    });
  }

  async countByFilters(filters?: CompetenceFilters): Promise<number> {
    this.logger.debug('CompetenceSequelizeRepository.countByFilters: Called');
    const where: WhereOptions<Competence> = {};

    if (filters?.name) {
      where.name = { [Op.iLike]: `%${filters.name}%` };
    }
    if (filters?.category) {
      where.category = filters.category;
    }
    if (filters?.level) {
      where.level = filters.level;
    }

    return this.model.count({ where });
  }
}
