import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Competence } from '../competence.model';
import { CompetenceRepository } from './competence.repository.interface';
import { CreateCompetenceDto, UpdateCompetenceDto } from '../dto/competence.dto';
import { CompetenceFilters } from '../interfaces/competence.interface';
import { Company } from '../../users/user.model';
import { Op } from 'sequelize';

@Injectable()
export class CompetenceSequelizeRepository implements CompetenceRepository {
  private readonly logger = new Logger(CompetenceSequelizeRepository.name);

  constructor(
    @InjectModel(Competence)
    private readonly competenceModel: typeof Competence,
  ) {}

  async create(createCompetenceDto: CreateCompetenceDto): Promise<Competence> {
    this.logger.debug('CompetenceSequelizeRepository.create: Called');
    return this.competenceModel.create(createCompetenceDto as Competence);
  }

  async findAll(filters?: CompetenceFilters): Promise<Competence[]> {
    this.logger.debug('CompetenceSequelizeRepository.findAll: Called');
    const where: any = {};

    if (filters?.name) {
      where.name = { [Op.like]: `%${filters.name}%` };
    }
    if (filters?.category) {
      where.category = filters.category;
    }
    if (filters?.level) {
      where.level = filters.level;
    }

    return this.competenceModel.findAll({
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
    return this.competenceModel.findOne({
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
    const competence = await this.competenceModel.findByPk(id);
    if (!competence) {
      throw new Error('Competence not found');
    }

    await competence.update(updateCompetenceDto as any);
    return competence;
  }

  async delete(id: string): Promise<void> {
    this.logger.debug('CompetenceSequelizeRepository.delete: Called');
    await this.competenceModel.destroy({ where: { id } });
  }

  async findByCategory(category: string): Promise<Competence[]> {
    this.logger.debug('CompetenceSequelizeRepository.findByCategory: Called');
    return this.competenceModel.findAll({
      where: { category },
    });
  }

  async searchByName(name: string): Promise<Competence[]> {
    this.logger.debug('CompetenceSequelizeRepository.searchByName: Called');
    return this.competenceModel.findAll({
      where: {
        name: { [Op.like]: `%${name}%` },
      },
    });
  }

  async countByFilters(filters?: CompetenceFilters): Promise<number> {
    this.logger.debug('CompetenceSequelizeRepository.countByFilters: Called');
    const where: any = {};

    if (filters?.name) {
      where.name = { [Op.like]: `%${filters.name}%` };
    }
    if (filters?.category) {
      where.category = filters.category;
    }
    if (filters?.level) {
      where.level = filters.level;
    }

    return this.competenceModel.count({ where });
  }
}
