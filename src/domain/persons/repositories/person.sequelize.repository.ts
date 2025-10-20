import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Person } from '../../users/user.model';
import { PersonRepository } from './person.repository.interface';
import { Person as PersonInterface, PersonFilters } from '../interfaces/person.interface';
import { CreatePersonDto, UpdatePersonDto } from '../dto/person.dto';
import { Op } from 'sequelize';

@Injectable()
export class PersonSequelizeRepository implements PersonRepository {
  private readonly logger = new Logger(PersonSequelizeRepository.name);

  constructor(
    @InjectModel(Person)
    private readonly personModel: typeof Person,
  ) {}

  async create(createPersonDto: CreatePersonDto): Promise<PersonInterface> {
    this.logger.debug('PersonSequelizeRepository.create: Called');
    const person = await this.personModel.create({
      id: undefined,
      userId: createPersonDto.userId,
      name: `${createPersonDto.firstName} ${createPersonDto.lastName}`,
      avatar: createPersonDto.profilePicture || null,
    } as any);

    return this.toInterface(person);
  }

  async findAll(filters?: PersonFilters): Promise<PersonInterface[]> {
    this.logger.debug('PersonSequelizeRepository.findAll: Called');
    const where: any = {};

    if (filters?.firstName) {
      where.name = { [Op.like]: `${filters.firstName}%` };
    }

    if (filters?.lastName) {
      where.name = { [Op.like]: `%${filters.lastName}` };
    }

    const persons = await this.personModel.findAll({ where });
    return persons.map((person) => this.toInterface(person));
  }

  async findOne(id: string): Promise<PersonInterface | null> {
    this.logger.debug('PersonSequelizeRepository.findOne: Called');
    const person = await this.personModel.findByPk(id);
    return person ? this.toInterface(person) : null;
  }

  async update(id: string, updatePersonDto: UpdatePersonDto): Promise<PersonInterface> {
    this.logger.debug('PersonSequelizeRepository.update: Called');
    const person = await this.personModel.findByPk(id);
    if (!person) {
      throw new Error('Person not found');
    }

    const updates: any = {};
    if (updatePersonDto.firstName || updatePersonDto.lastName) {
      const currentName = person.name.split(' ');
      const firstName = updatePersonDto.firstName || currentName[0];
      const lastName = updatePersonDto.lastName || currentName.slice(1).join(' ');
      updates.name = `${firstName} ${lastName}`;
    }

    if (updatePersonDto.profilePicture !== undefined) {
      updates.avatar = updatePersonDto.profilePicture;
    }

    await person.update(updates);
    return this.toInterface(person);
  }

  async delete(id: string): Promise<void> {
    this.logger.debug('PersonSequelizeRepository.delete: Called');
    await this.personModel.destroy({ where: { id } });
  }

  async findByUser(userId: string): Promise<PersonInterface | null> {
    this.logger.debug('PersonSequelizeRepository.findByUser: Called');
    const person = await this.personModel.findOne({ where: { userId } });
    return person ? this.toInterface(person) : null;
  }

  async findByEmail(_email: string): Promise<PersonInterface | null> {
    this.logger.debug('PersonSequelizeRepository.findByEmail: Called');
    // Email is not stored in the current Person model
    // This would need to be added to the model or fetched from related User
    return null;
  }

  async countByFilters(filters?: PersonFilters): Promise<number> {
    this.logger.debug('PersonSequelizeRepository.countByFilters: Called');
    const where: any = {};

    if (filters?.firstName) {
      where.name = { [Op.like]: `${filters.firstName}%` };
    }

    if (filters?.lastName) {
      where.name = { [Op.like]: `%${filters.lastName}` };
    }

    return this.personModel.count({ where });
  }

  private toInterface(person: Person): PersonInterface {
    const nameParts = person.name.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    return {
      id: person.id,
      userId: person.userId,
      firstName,
      lastName,
      email: '', // Not available in current model
      phone: undefined,
      dateOfBirth: undefined,
      address: undefined,
      profilePicture: person.avatar || undefined,
      bio: undefined,
      linkedinProfile: undefined,
      githubProfile: undefined,
      portfolioUrl: undefined,
      competences: [],
      experiences: [],
      education: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}
