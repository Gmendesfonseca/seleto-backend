import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Vacancy } from '../vacancy.model';
import { VacancyRepository } from './vacancy.repository.interface';
import { CreateVacancyDto, UpdateVacancyDto } from '../dto/vacancy.dto';
import { VacancyFilters, VacancyStatus } from '../interfaces/vacancy.interface';
import { Company } from '../../users/user.model';
import { Application } from '../../applications/application.model';
import { Op } from 'sequelize';

@Injectable()
export class VacancySequelizeRepository implements VacancyRepository {
  private readonly logger = new Logger(VacancySequelizeRepository.name);

  constructor(
    @InjectModel(Vacancy)
    private readonly vacancyModel: typeof Vacancy,
  ) {}

  async create(createVacancyDto: CreateVacancyDto): Promise<Vacancy> {
    this.logger.debug('VacancySequelizeRepository.create: Called');
    return this.vacancyModel.create({
      title: createVacancyDto.title,
      description: createVacancyDto.description,
      company_id: createVacancyDto.companyId,
      area: createVacancyDto.location,
      status: VacancyStatus.DRAFT,
    } as any);
  }

  async findAll(filters?: VacancyFilters): Promise<Vacancy[]> {
    this.logger.debug('VacancySequelizeRepository.findAll: Called');
    const where: any = {};

    if (filters?.companyId) {
      where.company_id = filters.companyId;
    }
    if (filters?.title) {
      where.title = { [Op.like]: `%${filters.title}%` };
    }
    if (filters?.location) {
      where.area = { [Op.like]: `%${filters.location}%` };
    }
    if (filters?.status) {
      where.status = filters.status;
    }

    return this.vacancyModel.findAll({
      where,
      include: [
        {
          model: Company,
          attributes: ['id', 'name', 'avatar'],
        },
      ],
    });
  }

  async findOne(id: string): Promise<Vacancy | null> {
    this.logger.debug('VacancySequelizeRepository.findOne: Called');
    return this.vacancyModel.findOne({
      where: { id },
      include: [
        {
          model: Company,
          attributes: ['id', 'name', 'avatar'],
        },
        {
          model: Application,
        },
      ],
    });
  }

  async update(id: string, updateVacancyDto: UpdateVacancyDto): Promise<Vacancy> {
    this.logger.debug('VacancySequelizeRepository.update: Called');
    const vacancy = await this.vacancyModel.findByPk(id);
    if (!vacancy) {
      throw new Error('Vacancy not found');
    }

    const updateData: any = {};
    if (updateVacancyDto.title !== undefined) {
      updateData.title = updateVacancyDto.title;
    }
    if (updateVacancyDto.description !== undefined) {
      updateData.description = updateVacancyDto.description;
    }
    if (updateVacancyDto.location !== undefined) {
      updateData.area = updateVacancyDto.location;
    }
    if (updateVacancyDto.status !== undefined) {
      updateData.status = updateVacancyDto.status;
    }

    await vacancy.update(updateData);
    return vacancy;
  }

  async delete(id: string): Promise<void> {
    this.logger.debug('VacancySequelizeRepository.delete: Called');
    await this.vacancyModel.destroy({ where: { id } });
  }

  async findByCompany(companyId: string): Promise<Vacancy[]> {
    this.logger.debug('VacancySequelizeRepository.findByCompany: Called');
    return this.vacancyModel.findAll({
      where: { company_id: companyId },
    });
  }

  async findPublished(): Promise<Vacancy[]> {
    this.logger.debug('VacancySequelizeRepository.findPublished: Called');
    return this.vacancyModel.findAll({
      where: { status: VacancyStatus.PUBLISHED },
      include: [
        {
          model: Company,
          attributes: ['id', 'name', 'avatar'],
        },
      ],
    });
  }

  async countByFilters(filters?: VacancyFilters): Promise<number> {
    this.logger.debug('VacancySequelizeRepository.countByFilters: Called');
    const where: any = {};

    if (filters?.companyId) {
      where.company_id = filters.companyId;
    }
    if (filters?.title) {
      where.title = { [Op.like]: `%${filters.title}%` };
    }
    if (filters?.location) {
      where.area = { [Op.like]: `%${filters.location}%` };
    }
    if (filters?.status) {
      where.status = filters.status;
    }

    return this.vacancyModel.count({ where });
  }
}
