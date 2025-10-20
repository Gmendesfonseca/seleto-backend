import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Permission } from '../../permissions/permission.model';
import { PermissionRepository } from './role.repository.interface';
import { CreatePermissionDto, UpdatePermissionDto } from '../dto/role.dto';
import { PermissionFilters } from '../interfaces/role.interface';
import { Op } from 'sequelize';

@Injectable()
export class PermissionSequelizeRepository implements PermissionRepository {
  private readonly logger = new Logger(PermissionSequelizeRepository.name);

  constructor(
    @InjectModel(Permission)
    private readonly permissionModel: typeof Permission,
  ) {}

  async create(createPermissionDto: CreatePermissionDto): Promise<Permission> {
    this.logger.debug('PermissionSequelizeRepository.create: Called');
    return this.permissionModel.create({
      name: createPermissionDto.name,
      description: createPermissionDto.description,
      module: createPermissionDto.resource,
    } as Permission);
  }

  async findAll(filters?: PermissionFilters): Promise<Permission[]> {
    this.logger.debug('PermissionSequelizeRepository.findAll: Called');
    const where: any = {};

    if (filters?.name) {
      where.name = { [Op.like]: `%${filters.name}%` };
    }
    if (filters?.resource) {
      where.module = filters.resource;
    }

    return this.permissionModel.findAll({ where });
  }

  async findOne(id: string): Promise<Permission | null> {
    this.logger.debug('PermissionSequelizeRepository.findOne: Called');
    return this.permissionModel.findOne({ where: { id } });
  }

  async update(id: string, updatePermissionDto: UpdatePermissionDto): Promise<Permission> {
    this.logger.debug('PermissionSequelizeRepository.update: Called');
    const permission = await this.permissionModel.findByPk(id);
    if (!permission) {
      throw new Error('Permission not found');
    }

    const updateData: any = {};
    if (updatePermissionDto.name !== undefined) {
      updateData.name = updatePermissionDto.name;
    }
    if (updatePermissionDto.description !== undefined) {
      updateData.description = updatePermissionDto.description;
    }
    if (updatePermissionDto.resource !== undefined) {
      updateData.module = updatePermissionDto.resource;
    }

    await permission.update(updateData);
    return permission;
  }

  async delete(id: string): Promise<void> {
    this.logger.debug('PermissionSequelizeRepository.delete: Called');
    await this.permissionModel.destroy({ where: { id } });
  }

  async findByResource(resource: string): Promise<Permission[]> {
    this.logger.debug('PermissionSequelizeRepository.findByResource: Called');
    return this.permissionModel.findAll({
      where: { module: resource },
    });
  }

  async countByFilters(filters?: PermissionFilters): Promise<number> {
    this.logger.debug('PermissionSequelizeRepository.countByFilters: Called');
    const where: any = {};

    if (filters?.name) {
      where.name = { [Op.like]: `%${filters.name}%` };
    }
    if (filters?.resource) {
      where.module = filters.resource;
    }

    return this.permissionModel.count({ where });
  }
}
