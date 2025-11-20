import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Vacancy } from '../vacancy.model';
import { VacancyRepository } from './vacancy.repository.interface';
import { CreateVacancyDto, UpdateVacancyDto } from '../dto/vacancy.dto';
import { VacancyFilters, VacancyStatus } from '../interfaces/vacancy.interface';
import { Company } from '../../companies/company.model';
import { Application } from '../../applications/application.model';
import { Op } from 'sequelize';

@Injectable()
export class VacancySequelizeRepository implements VacancyRepository {
  private readonly logger = new Logger(VacancySequelizeRepository.name);

  constructor(
    @InjectModel(Vacancy)
    private readonly model: typeof Vacancy,
  ) {}

  async create(createVacancyDto: CreateVacancyDto): Promise<Vacancy> {
    this.logger.debug('VacancySequelizeRepository.create: Called');
    return this.model.create(createVacancyDto);
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

    return this.model.findAll({
      where,
      include: [
        {
          model: Company,
          attributes: ['id', 'cnpj'],
        },
      ],
    });
  }

  async findOne(id: string): Promise<Vacancy | null> {
    this.logger.debug('VacancySequelizeRepository.findOne: Called');
    return this.model.findOne({
      where: { id },
      include: [
        {
          model: Company,
          attributes: ['id', 'cnpj'],
        },
        {
          model: Application,
        },
      ],
    });
  }

  async update(id: string, updateVacancyDto: UpdateVacancyDto): Promise<Vacancy> {
    this.logger.debug('VacancySequelizeRepository.update: Called');
    const vacancy = await this.model.findByPk(id);
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
    await this.model.destroy({ where: { id } });
  }

  async findByCompany(companyId: string): Promise<Vacancy[]> {
    this.logger.debug('VacancySequelizeRepository.findByCompany: Called');
    return this.model.findAll({
      where: { company_id: companyId },
    });
  }

  async findPublished(): Promise<Vacancy[]> {
    this.logger.debug('VacancySequelizeRepository.findPublished: Called');
    return this.model.findAll({
      where: { status: VacancyStatus.PUBLISHED },
      include: [
        {
          model: Company,
          attributes: ['id', 'cnpj'],
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

    return this.model.count({ where });
  }
}
