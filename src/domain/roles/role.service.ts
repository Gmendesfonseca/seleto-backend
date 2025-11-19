import { Injectable, Inject, Logger, NotFoundException } from '@nestjs/common';
import { RoleService } from './interfaces/role.service.interface';
import { RoleRepository } from './repositories/role.repository.interface';
import { CreateRoleDto, UpdateRoleDto } from './dto/role.dto';
import { Role, RoleFilters } from './interfaces/role.interface';

@Injectable()
export class RoleServiceImpl implements RoleService {
  private readonly logger = new Logger(RoleServiceImpl.name);

  constructor(
    @Inject(RoleRepository)
    private readonly roleRepository: RoleRepository,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    this.logger.debug('RoleService.create: Called');
    return this.roleRepository.create(createRoleDto);
  }

  async findAll(filters?: RoleFilters): Promise<Role[]> {
    this.logger.debug('RoleService.findAll: Called');
    return this.roleRepository.findAll(filters);
  }

  async findOne(id: string): Promise<Role | null> {
    this.logger.debug('RoleService.findOne: Called');
    return this.roleRepository.findOne(id);
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
    this.logger.debug('RoleService.update: Called');
    const role = await this.roleRepository.findOne(id);
    if (!role) {
      throw new NotFoundException(`Role with id ${id} not found`);
    }
    return this.roleRepository.update(id, updateRoleDto);
  }

  async remove(id: string): Promise<void> {
    this.logger.debug('RoleService.remove: Called');
    const role = await this.roleRepository.findOne(id);
    if (!role) {
      throw new NotFoundException(`Role with id ${id} not found`);
    }
    await this.roleRepository.delete(id);
  }

  async assignPermissions(roleId: string, permissionIds: string[]): Promise<Role> {
    this.logger.debug('RoleService.assignPermissions: Called');
    const role = await this.roleRepository.findOne(roleId);
    if (!role) {
      throw new NotFoundException(`Role with id ${roleId} not found`);
    }

    const currentPermissions = role.permissions || [];
    const updatedPermissions = [...new Set([...currentPermissions, ...permissionIds])];

    return this.roleRepository.update(roleId, { permissions: updatedPermissions });
  }

  async removePermissions(roleId: string, permissionIds: string[]): Promise<Role> {
    this.logger.debug('RoleService.removePermissions: Called');
    const role = await this.roleRepository.findOne(roleId);
    if (!role) {
      throw new NotFoundException(`Role with id ${roleId} not found`);
    }

    const updatedPermissions = (role.permissions || []).filter(
      (permId) => !permissionIds.includes(permId),
    );

    return this.roleRepository.update(roleId, { permissions: updatedPermissions });
  }
}
