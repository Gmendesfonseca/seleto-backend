import { User } from '../user.model';
import {
  UsersRepositoryInterface,
  CreateUserInputRepository,
  GetByCredentialsInputRepository,
  UpdateUsernameInputRepository,
  UpdatePasswordInputRepository,
  UpdateEmailInputRepository,
  CreatePersonInputRepository,
  ActivateInputRepository,
  ValidateEmailInput,
  CreateCompanyInputRepository,
} from '../interfaces/user.repository.interface';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Company } from '../user.model';
import { Person } from '../user.model';

@Injectable()
export class UserSequelizeRepository implements UsersRepositoryInterface {
  private readonly logger = new Logger(UserSequelizeRepository.name);

  constructor(
    @InjectModel(User) private userModel: typeof User,
    @InjectModel(Person) private personModel: typeof Person,
    @InjectModel(Company) private companyModel: typeof Company,
  ) {}

  public async findOne(id: string): Promise<User | null> {
    this.logger.debug('UserSequelizeRepository.findOne: Called');
    return this.userModel.findOne({
      where: { id },
      include: [
        {
          model: Person,
          attributes: ['id', 'name', 'avatar'],
        },
        {
          model: Company,
          attributes: ['id', 'name', 'avatar'],
        },
      ],
    });
  }

  public async findAll(filters?: any): Promise<{ users: User[]; total: number }> {
    this.logger.debug('UserSequelizeRepository.findAll: Called');
    const where: any = {};

    if (filters?.email) {
      where.email = filters.email;
    }
    if (filters?.username) {
      where.username = filters.username;
    }
    if (filters?.status) {
      where.status = filters.status;
    }
    if (filters?.type) {
      where.type = filters.type;
    }
    if (filters?.isVerified !== undefined) {
      where.isVerified = filters.isVerified;
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await this.userModel.findAndCountAll({
      where,
      limit,
      offset,
      include: [
        {
          model: Person,
          attributes: ['id', 'name', 'avatar'],
        },
        {
          model: Company,
          attributes: ['id', 'name', 'avatar'],
        },
      ],
    });

    return {
      users: rows,
      total: count,
    };
  }

  public async findOneByCredentials({
    email,
    password,
  }: GetByCredentialsInputRepository): Promise<User | null> {
    this.logger.debug('UserSequelizeRepository.findOneByCredentials: Called');
    return this.userModel.findOne({
      where: { email: email, password: password },
      include: {
        model: Company,
      },
    });
  }

  public async findOneByEmail(email: string): Promise<User | null> {
    this.logger.debug('UserSequelizeRepository.findOneByEmail: Called');
    return this.userModel.findOne({ where: { email } });
  }

  public async validateEmail({ email }: ValidateEmailInput): Promise<boolean> {
    this.logger.debug('UserSequelizeRepository.validateEmail: Called');
    const user = await this.userModel.findOne({ where: { email } });
    return !user;
  }

  public async activate(input: ActivateInputRepository): Promise<void> {
    this.logger.debug('UserSequelizeRepository.activate: Called');
    await this.userModel.update(
      { status: 'ACTIVE' },
      {
        where: { id: input.id },
        returning: true,
      },
    );
  }

  public async createUser(newUser: CreateUserInputRepository): Promise<User> {
    this.logger.debug('UserSequelizeRepository.create: Called');
    return this.userModel.create(newUser as User);
  }

  public async createPerson(input: CreatePersonInputRepository): Promise<Person> {
    this.logger.debug('UserSequelizeRepository.createPerson: Called');
    return await this.personModel.create(input);
  }

  public async createCompany(input: CreateCompanyInputRepository): Promise<Company> {
    this.logger.debug('UserSequelizeRepository.createCompany: Called');
    return await this.companyModel.create(input);
  }

  public async updateUsername({ id, ...input }: UpdateUsernameInputRepository): Promise<User> {
    this.logger.debug('UserSequelizeRepository.update: Called');
    const [, [updateUser]] = await this.userModel.update(
      { ...input },
      {
        where: { id },
        returning: true,
      },
    );
    return updateUser;
  }

  public async updatePassword({ id, ...input }: UpdatePasswordInputRepository): Promise<void> {
    await this.userModel.update(
      { ...input },
      {
        where: { id },
        returning: true,
      },
    );
  }

  public async updateEmail({ id, ...input }: UpdateEmailInputRepository): Promise<void> {
    await this.userModel.update(
      { ...input },
      {
        where: { id },
        returning: true,
      },
    );
  }

  public async update(id: string, data: Partial<User>): Promise<User> {
    this.logger.debug('UserSequelizeRepository.update: Called');
    const [, [updatedUser]] = await this.userModel.update(data, {
      where: { id },
      returning: true,
    });
    return updatedUser;
  }

  public async delete(id: string): Promise<void> {
    this.logger.debug('UserSequelizeRepository.delete: Called');
    await this.userModel.destroy({ where: { id } });
  }
}
