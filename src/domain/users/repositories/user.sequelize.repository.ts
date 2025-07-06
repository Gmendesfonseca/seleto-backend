import { User } from '../user.model';
import {
  UsersRepositoryInterface,
  CreateUserInputRepository,
  GetByCredentialsInputRepository,
  UpdateUsernameInputRepository,
  UpdatePasswordInputRepository,
  UpdateEmailInputRepository,
  CreatePersonInputRepository,
  ActivateInput,
  ValidateEmailInput,
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

  public async activate(input: ActivateInput): Promise<void> {
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
    return await this.userModel.create(newUser as User);
  }

  public async createPerson(input: CreatePersonInputRepository): Promise<Person> {
    this.logger.debug('UserSequelizeRepository.createPerson: Called');
    return await this.personModel.create(input as Person);
  }

  public async createCompany(input: CreatePersonInputRepository): Promise<Company> {
    this.logger.debug('UserSequelizeRepository.createCompany: Called');
    return await this.companyModel.create(input as Company);
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

  public async delete(id: string): Promise<void> {
    this.logger.debug('UserSequelizeRepository.delete: Called');
    await this.userModel.destroy({ where: { id } });
  }
}
