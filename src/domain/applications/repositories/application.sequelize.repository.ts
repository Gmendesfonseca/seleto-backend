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
import { User } from 'src/domain/users/user.model';
import { Phone } from 'src/domain/phones';
import { Address } from 'src/domain/addresses';
import { PersonCompetence } from 'src/domain/persons/person-competence.model';
import { PersonExperience } from 'src/domain/persons/person-experience.model';
import { PersonFormation } from 'src/domain/persons/person-formation.model';
import { CandidateVacancyMatch } from 'src/domain/matching';

@Injectable()
export class ApplicationSequelizeRepository implements ApplicationRepository {
  private readonly logger = new Logger(ApplicationSequelizeRepository.name);

  constructor(
    @InjectModel(Application)
    private readonly model: typeof Application,
  ) {}

  async findAll(filters?: ApplicationFilters): Promise<Application[]> {
    this.logger.debug('ApplicationSequelizeRepository.findAll: Called');
    const where: WhereOptions<Application> = {};

    if (filters?.applicantId) {
      where.applicantId = filters.applicantId;
    }
    if (filters?.vacancyId) {
      where.vacancyId = filters.vacancyId;
    }
    if (filters?.status) {
      where.status = filters.status;
    }
    if (filters?.dateFrom || filters?.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) {
        where.createdAt = {
          [Op.gte]: new Date(filters.dateFrom),
        };
      }
      if (filters.dateTo) {
        where.createdAt = {
          [Op.lte]: new Date(filters.dateTo),
        };
      }
    }

    return this.model.findAll({
      where,
      include: [
        {
          model: Person,
          attributes: ['id', 'cpf'],
          include: [
            {
              model: User,
              attributes: ['id', 'email', 'name'],
              include: [
                {
                  model: Phone,
                },
                {
                  model: Address,
                },
              ],
            },
            {
              model: PersonCompetence,
            },
            {
              model: PersonExperience,
            },
            {
              model: PersonFormation,
            },
          ],
        },
        {
          model: Vacancy,
          attributes: ['id', 'title', 'status'],
          include: [
            {
              model: CandidateVacancyMatch,
            },
          ],
        },
      ],
    });
  }

  async findOne(id: string): Promise<Application | null> {
    this.logger.debug('ApplicationSequelizeRepository.findOne: Called');
    return this.model.findOne({
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
    return this.model.findAll({
      where: { applicantId },
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
    return this.model.findAll({
      where: { vacancyId },
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
    return this.model.create({
      applicantId: createApplicationDto.applicantId,
      vacancyId: createApplicationDto.vacancyId,
      resume: createApplicationDto.resume,
      cover_letter: createApplicationDto.coverLetter,
    } as Application);
  }

  async update(id: string, updateApplicationDto: UpdateApplicationDto): Promise<Application> {
    this.logger.debug('ApplicationSequelizeRepository.update: Called');
    const application = await this.model.findByPk(id);
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
    await this.model.destroy({ where: { id } });
  }

  async countByFilters(filters?: ApplicationFilters): Promise<number> {
    this.logger.debug('ApplicationSequelizeRepository.countByFilters: Called');
    const where: WhereOptions<Application> = {};

    if (filters?.applicantId) {
      where.applicantId = filters.applicantId;
    }
    if (filters?.vacancyId) {
      where.vacancyId = filters.vacancyId;
    }
    if (filters?.status) {
      where.status = filters.status;
    }
    if (filters?.dateFrom || filters?.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) {
        where.createdAt = { [Op.gte]: new Date(filters.dateFrom) };
      }
      if (filters.dateTo) {
        where.createdAt = {
          ...where.createdAt,
          [Op.lte]: new Date(filters.dateTo),
        };
      }
    }

    return this.model.count({ where });
  }
}
