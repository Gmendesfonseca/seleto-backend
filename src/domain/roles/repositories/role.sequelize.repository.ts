import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Role } from '../role.model';
import { RoleRepository } from './role.repository.interface';
import { CreateRoleDto, UpdateRoleDto } from '../dto/role.dto';
import { Role as RoleEntity, RoleFilters } from '../interfaces/role.interface';
import { Company } from '../../companies/company.model';
import { Op, WhereOptions } from 'sequelize';

// The persisted rows are returned as is: the model has no permissions/isActive/isDefault,
// so the casts below only align the declared domain type.
@Injectable()
export class RoleSequelizeRepository implements RoleRepository {
  private readonly logger = new Logger(RoleSequelizeRepository.name);

  constructor(
    @InjectModel(Role)
    private readonly roleModel: typeof Role,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<RoleEntity> {
    this.logger.debug('RoleSequelizeRepository.create: Called');
    const row = await this.roleModel.create(createRoleDto as unknown as Role);
    return row as unknown as RoleEntity;
  }

  async findAll(filters?: RoleFilters): Promise<RoleEntity[]> {
    this.logger.debug('RoleSequelizeRepository.findAll: Called');
    const where: WhereOptions<Role> = {};

    if (filters?.name) {
      where.name = { [Op.iLike]: `%${filters.name}%` };
    }

    if (filters?.isDefault !== undefined) {
      where.is_system = filters.isDefault;
    }

    const rows = await this.roleModel.findAll({
      where,
      include: [
        {
          model: Company,
          attributes: ['id', 'name'],
        },
      ],
    });
    return rows as unknown as RoleEntity[];
  }

  async findOne(id: string): Promise<RoleEntity | null> {
    this.logger.debug('RoleSequelizeRepository.findOne: Called');
    const row = await this.roleModel.findOne({
      where: { id },
      include: [
        {
          model: Company,
          attributes: ['id', 'name'],
        },
      ],
    });
    return row as unknown as RoleEntity | null;
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<RoleEntity> {
    this.logger.debug('RoleSequelizeRepository.update: Called');
    const role = await this.roleModel.findByPk(id);
    if (!role) {
      throw new Error('Role not found');
    }

    await role.update(updateRoleDto as any);
    return role as unknown as RoleEntity;
  }

  async delete(id: string): Promise<void> {
    this.logger.debug('RoleSequelizeRepository.delete: Called');
    await this.roleModel.destroy({ where: { id } });
  }

  async findByName(name: string): Promise<RoleEntity | null> {
    this.logger.debug('RoleSequelizeRepository.findByName: Called');
    const row = await this.roleModel.findOne({
      where: { name },
    });
    return row as unknown as RoleEntity | null;
  }

  async countByFilters(filters?: RoleFilters): Promise<number> {
    this.logger.debug('RoleSequelizeRepository.countByFilters: Called');
    const where: WhereOptions<Role> = {};

    if (filters?.name) {
      where.name = { [Op.iLike]: `%${filters.name}%` };
    }
    if (filters?.isDefault !== undefined) {
      where.is_system = filters.isDefault;
    }

    return this.roleModel.count({ where });
  }
}
