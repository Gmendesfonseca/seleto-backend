import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Permission } from '../../permissions/permission.model';
import { PermissionRepository } from './role.repository.interface';
import { CreatePermissionDto, UpdatePermissionDto } from '../dto/role.dto';
import { Permission as PermissionEntity, PermissionFilters } from '../interfaces/role.interface';
import { Op, WhereOptions } from 'sequelize';

// The persisted rows are returned as is: the model stores module instead of resource/action/isActive,
// so the casts below only align the declared domain type.
@Injectable()
export class PermissionSequelizeRepository implements PermissionRepository {
  private readonly logger = new Logger(PermissionSequelizeRepository.name);

  constructor(
    @InjectModel(Permission)
    private readonly permissionModel: typeof Permission,
  ) {}

  async create(createPermissionDto: CreatePermissionDto): Promise<PermissionEntity> {
    this.logger.debug('PermissionSequelizeRepository.create: Called');
    const row = await this.permissionModel.create({
      name: createPermissionDto.name,
      description: createPermissionDto.description,
      module: createPermissionDto.resource,
    } as Permission);
    return row as unknown as PermissionEntity;
  }

  async findAll(filters?: PermissionFilters): Promise<PermissionEntity[]> {
    this.logger.debug('PermissionSequelizeRepository.findAll: Called');
    const where: WhereOptions<Permission> = {};

    if (filters?.name) {
      where.name = { [Op.iLike]: `%${filters.name}%` };
    }
    if (filters?.resource) {
      where.module = filters.resource;
    }

    const rows = await this.permissionModel.findAll({ where });
    return rows as unknown as PermissionEntity[];
  }

  async findOne(id: string): Promise<PermissionEntity | null> {
    this.logger.debug('PermissionSequelizeRepository.findOne: Called');
    const row = await this.permissionModel.findOne({ where: { id } });
    return row as unknown as PermissionEntity | null;
  }

  async update(id: string, updatePermissionDto: UpdatePermissionDto): Promise<PermissionEntity> {
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
    return permission as unknown as PermissionEntity;
  }

  async delete(id: string): Promise<void> {
    this.logger.debug('PermissionSequelizeRepository.delete: Called');
    await this.permissionModel.destroy({ where: { id } });
  }

  async findByResource(resource: string): Promise<PermissionEntity[]> {
    this.logger.debug('PermissionSequelizeRepository.findByResource: Called');
    const rows = await this.permissionModel.findAll({
      where: { module: resource },
    });
    return rows as unknown as PermissionEntity[];
  }

  async countByFilters(filters?: PermissionFilters): Promise<number> {
    this.logger.debug('PermissionSequelizeRepository.countByFilters: Called');
    const where: WhereOptions<Permission> = {};

    if (filters?.name) {
      where.name = { [Op.iLike]: `%${filters.name}%` };
    }
    if (filters?.resource) {
      where.module = filters.resource;
    }

    return this.permissionModel.count({ where });
  }
}
