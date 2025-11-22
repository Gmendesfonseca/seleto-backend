import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Application } from '../application.model';
import { ApplicationRepository } from './application.repository.interface';
import { CreateApplicationDto } from '../dto/create.dto';
import { UpdateApplicationDto } from '../dto/update.dto';
import { ApplicationFilters } from '../interfaces/application.interface';
import { Vacancy } from '../../vacancies/vacancy.model';
import { Op, WhereOptions } from 'sequelize';
import { Person } from 'src/domain/persons/person.model';

@Injectable()
export class ApplicationSequelizeRepository implements ApplicationRepository {
  private readonly logger = new Logger(ApplicationSequelizeRepository.name);

  constructor(
    @InjectModel(Application)
    private readonly applicationModel: typeof Application,
  ) {}

  async findAll(filters?: ApplicationFilters): Promise<Application[]> {
    this.logger.debug('ApplicationSequelizeRepository.findAll: Called');
    const where: WhereOptions<Application> = {};

    if (filters?.applicantId) {
      where.applicant_id = filters.applicantId;
    }
    if (filters?.vacancyId) {
      where.vacancy_id = filters.vacancyId;
    }
    if (filters?.status) {
      where.status = filters.status;
    }
    if (filters?.dateFrom || filters?.dateTo) {
      where.created_at = {};
      if (filters.dateFrom) {
        where.created_at = {
          [Op.gte]: new Date(filters.dateFrom),
        };
      }
      if (filters.dateTo) {
        where.created_at = {
          [Op.lte]: new Date(filters.dateTo),
        };
      }
    }

    return this.applicationModel.findAll({
      where,
      include: [
        {
          model: Person,
          attributes: ['id', 'cpf'],
        },
        {
          model: Vacancy,
          attributes: ['id', 'title', 'status'],
        },
      ],
    });
  }

  async findOne(id: string): Promise<Application | null> {
    this.logger.debug('ApplicationSequelizeRepository.findOne: Called');
    return this.applicationModel.findOne({
      where: { id },
      include: [
        {
          model: Person,
          attributes: ['id', 'cpf'],
        },
        {
          model: Vacancy,
          attributes: ['id', 'title', 'status'],
        },
      ],
    });
  }

  async findByApplicant(applicantId: string): Promise<Application[]> {
    this.logger.debug('ApplicationSequelizeRepository.findByApplicant: Called');
    return this.applicationModel.findAll({
      where: { applicant_id: applicantId },
      include: [
        {
          model: Vacancy,
          attributes: ['id', 'title', 'status'],
        },
      ],
    });
  }

  async findByVacancy(vacancyId: string): Promise<Application[]> {
    this.logger.debug('ApplicationSequelizeRepository.findByVacancy: Called');
    return this.applicationModel.findAll({
      where: { vacancy_id: vacancyId },
      include: [
        {
          model: Person,
          attributes: ['id', 'cpf'],
        },
      ],
    });
  }

  async create(createApplicationDto: CreateApplicationDto): Promise<Application> {
    this.logger.debug('ApplicationSequelizeRepository.create: Called');
    return this.applicationModel.create({
      applicant_id: createApplicationDto.applicantId,
      vacancy_id: createApplicationDto.vacancyId,
      resume: createApplicationDto.resume,
      cover_letter: createApplicationDto.coverLetter,
    } as Application);
  }

  async update(id: string, updateApplicationDto: UpdateApplicationDto): Promise<Application> {
    this.logger.debug('ApplicationSequelizeRepository.update: Called');
    const application = await this.applicationModel.findByPk(id);
    if (!application) {
      throw new Error('Application not found');
    }

    const updateData: any = {};
    if (updateApplicationDto.status !== undefined) {
      updateData.status = updateApplicationDto.status;
    }
    if (updateApplicationDto.resume !== undefined) {
      updateData.resume = updateApplicationDto.resume;
    }
    if (updateApplicationDto.coverLetter !== undefined) {
      updateData.cover_letter = updateApplicationDto.coverLetter;
    }

    await application.update(updateData);
    return application;
  }

  async delete(id: string): Promise<void> {
    this.logger.debug('ApplicationSequelizeRepository.delete: Called');
    await this.applicationModel.destroy({ where: { id } });
  }

  async countByFilters(filters?: ApplicationFilters): Promise<number> {
    this.logger.debug('ApplicationSequelizeRepository.countByFilters: Called');
    const where: WhereOptions<Application> = {};

    if (filters?.applicantId) {
      where.applicant_id = filters.applicantId;
    }
    if (filters?.vacancyId) {
      where.vacancy_id = filters.vacancyId;
    }
    if (filters?.status) {
      where.status = filters.status;
    }
    if (filters?.dateFrom || filters?.dateTo) {
      where.created_at = {};
      if (filters.dateFrom) {
        where.created_at[Op.gte] = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        where.created_at[Op.lte] = new Date(filters.dateTo);
      }
    }

    return this.applicationModel.count({ where });
  }
}
