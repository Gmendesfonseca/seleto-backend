import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Person } from '../person.model';
import { PersonRepository } from '../interfaces/person.repository.interface';
import { Person as PersonInterface, PersonFilters } from '../interfaces/person.interface';
import { CreatePersonDto, UpdatePersonDto } from '../dto/person.dto';
import { Op, WhereOptions } from 'sequelize';
import { PersonExperience } from '../person-experience.model';
import { PersonCompetence } from '../person-competence.model';
import { PersonFormation } from '../person-formation.model';
import { User } from 'src/domain/users/user.model';
import { Phone } from 'src/domain/phones';
import { Address } from 'src/domain/addresses';
import { DateTime } from 'luxon';

@Injectable()
export class PersonSequelizeRepository implements PersonRepository {
  private readonly logger = new Logger(PersonSequelizeRepository.name);

  constructor(
    @InjectModel(Person)
    private readonly model: typeof Person,
  ) {}

  async create(createPersonDto: CreatePersonDto): Promise<PersonInterface> {
    this.logger.debug('PersonSequelizeRepository.create: Called');
    const person = await this.model.create({
      cpf: createPersonDto.cpf,
      user_id: createPersonDto.userId,
    } as Person);

    return this.toInterface(person);
  }

  async findAll(filters?: PersonFilters): Promise<PersonInterface[]> {
    this.logger.debug('PersonSequelizeRepository.findAll: Called');
    const where: WhereOptions<Person> = {};

    if (filters?.cpf) {
      where.cpf = { [Op.like]: `${filters.cpf}%` };
    }

    const persons = await this.model.findAll({ where });
    return persons.map((person) => this.toInterface(person));
  }

  async findOne({ id, user_id }: { id?: string; user_id?: string }): Promise<Person | null> {
    this.logger.debug('PersonSequelizeRepository.findOne: Called');
    const where: WhereOptions<Person> = {};
    if (id) {
      where.id = id;
    }
    if (user_id) {
      where.user_id = user_id;
    }
    return this.model.findOne({
      where,
      include: [
        {
          model: User,
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
          model: PersonExperience,
          as: 'experiences',
        },
        {
          model: PersonCompetence,
          as: 'competences',
        },
        {
          model: PersonFormation,
          as: 'formations',
        },
      ],
    });
  }
  async update(id: string, data: UpdatePersonDto): Promise<PersonInterface> {
    this.logger.debug('PersonSequelizeRepository.update: Called');
    const person = await this.model.findByPk(id);
    if (!person) {
      throw new Error('Person not found');
    }

    await person.update(data as Person);
    return this.toInterface(person);
  }

  async delete(id: string): Promise<void> {
    this.logger.debug('PersonSequelizeRepository.delete: Called');
    await this.model.destroy({ where: { id } });
  }

  async countByFilters(filters?: PersonFilters): Promise<number> {
    this.logger.debug('PersonSequelizeRepository.countByFilters: Called');
    const where: WhereOptions<Person> = {};

    if (filters?.cpf) {
      where.cpf = { [Op.like]: `${filters.cpf}%` };
    }

    return this.model.count({ where });
  }

  private toInterface(person: Person): PersonInterface {
    return {
      id: person.id,
      cpf: person.cpf,
      user_id: person.user_id,
      phone: undefined,
      dateOfBirth: undefined,
      address: undefined,
      bio: undefined,
      linkedinProfile: undefined,
      githubProfile: undefined,
      portfolioUrl: undefined,
      competences: [],
      experiences: [],
      education: [],
      createdAt: DateTime.now(),
      updatedAt: DateTime.now(),
    };
  }
}
