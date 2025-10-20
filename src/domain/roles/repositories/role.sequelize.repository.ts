import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Role } from '../role.model';
import { RoleRepository } from './role.repository.interface';
import { CreateRoleDto, UpdateRoleDto } from '../dto/role.dto';
import { RoleFilters } from '../interfaces/role.interface';
import { Company } from '../../users/user.model';
import { Op } from 'sequelize';

@Injectable()
export class RoleSequelizeRepository implements RoleRepository {
  private readonly logger = new Logger(RoleSequelizeRepository.name);

  constructor(
    @InjectModel(Role)
    private readonly roleModel: typeof Role,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    this.logger.debug('RoleSequelizeRepository.create: Called');
    return this.roleModel.create(createRoleDto as Role);
  }

  async findAll(filters?: RoleFilters): Promise<Role[]> {
    this.logger.debug('RoleSequelizeRepository.findAll: Called');
    const where: any = {};

    if (filters?.name) {
      where.name = { [Op.like]: `%${filters.name}%` };
    }
    if (filters?.isActive !== undefined) {
      where.is_active = filters.isActive;
    }
    if (filters?.isDefault !== undefined) {
      where.is_default = filters.isDefault;
    }

    return this.roleModel.findAll({
      where,
      include: [
        {
          model: Company,
          attributes: ['id', 'name'],
        },
      ],
    });
  }

  async findOne(id: string): Promise<Role | null> {
    this.logger.debug('RoleSequelizeRepository.findOne: Called');
    return this.roleModel.findOne({
      where: { id },
      include: [
        {
          model: Company,
          attributes: ['id', 'name'],
        },
      ],
    });
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
    this.logger.debug('RoleSequelizeRepository.update: Called');
    const role = await this.roleModel.findByPk(id);
    if (!role) {
      throw new Error('Role not found');
    }

    await role.update(updateRoleDto as any);
    return role;
  }

  async delete(id: string): Promise<void> {
    this.logger.debug('RoleSequelizeRepository.delete: Called');
    await this.roleModel.destroy({ where: { id } });
  }

  async findByName(name: string): Promise<Role | null> {
    this.logger.debug('RoleSequelizeRepository.findByName: Called');
    return this.roleModel.findOne({
      where: { name },
    });
  }

  async countByFilters(filters?: RoleFilters): Promise<number> {
    this.logger.debug('RoleSequelizeRepository.countByFilters: Called');
    const where: any = {};

    if (filters?.name) {
      where.name = { [Op.like]: `%${filters.name}%` };
    }
    if (filters?.isActive !== undefined) {
      where.is_active = filters.isActive;
    }
    if (filters?.isDefault !== undefined) {
      where.is_default = filters.isDefault;
    }

    return this.roleModel.count({ where });
  }
}
