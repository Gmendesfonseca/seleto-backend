import { User } from '../user.model';
import {
  UserRepositoryInterface,
  CreateUserDto,
  FindUserDto,
  FindUsersDto,
  UpdateUserDto,
  UserOutputDto,
  UsersOutputDto,
} from '../interfaces/user.repository.interface';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { WhereOptions } from 'sequelize';

@Injectable()
export class UserSequelizeRepository implements UserRepositoryInterface {
  private readonly logger = new Logger(UserSequelizeRepository.name);
  private readonly excludeAttributes = [
    'password',
    'createdAt',
    'updatedAt',
    'status',
    'isVerified',
    'deletedAt',
  ];

  constructor(@InjectModel(User) private readonly model: typeof User) {}

  public async findOne(data: FindUserDto): Promise<UserOutputDto | null> {
    this.logger.debug('UserSequelizeRepository.findOne: Called');
    const where: WhereOptions<User> = {};

    if (data.id) {
      where.id = data.id;
    }
    if (data.email) {
      where.email = data.email;
    }
    if (data.username) {
      where.username = data.username;
    }
    if (data.password) {
      where.password = data.password;
    }

    return this.model.findOne({
      where,
      attributes: { exclude: this.excludeAttributes },
    });
  }

  public async findAll(data?: FindUsersDto): Promise<UsersOutputDto> {
    this.logger.debug('UserSequelizeRepository.findAll: Called');
    const where: WhereOptions<User> = {};

    if (data?.email) {
      where.email = data.email;
    }
    if (data?.username) {
      where.username = data.username;
    }
    if (data?.status) {
      where.status = data.status;
    }
    if (data?.type) {
      where.type = data.type;
    }
    if (data?.isVerified !== undefined) {
      where.isVerified = data.isVerified;
    }

    const page = data?.page || 1;
    const limit = data?.limit || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await this.model.findAndCountAll({
      where,
      limit,
      offset,
      attributes: { exclude: this.excludeAttributes },
    });

    return {
      users: rows,
      total: count,
    };
  }

  public async create(user: CreateUserDto): Promise<User> {
    this.logger.debug('UserSequelizeRepository.create: Called');
    return this.model.create(user as User);
  }

  public async update(id: string, data: UpdateUserDto): Promise<User> {
    this.logger.debug('UserSequelizeRepository.update: Called');
    const [, [model]] = await this.model.update(data, {
      where: { id },
      returning: true,
    });
    return model;
  }

  public async delete(id: string): Promise<void> {
    this.logger.debug('UserSequelizeRepository.delete: Called');
    await this.model.destroy({ where: { id } });
  }
}
