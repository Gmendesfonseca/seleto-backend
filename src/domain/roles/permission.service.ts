import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PermissionService } from './interfaces/role.service.interface';
import { PermissionRepository } from './repositories/role.repository.interface';
import { CreatePermissionDto, UpdatePermissionDto } from './dto/role.dto';
import { Permission, PermissionFilters } from './interfaces/role.interface';

@Injectable()
export class PermissionServiceImpl implements PermissionService {
  private readonly logger = new Logger(PermissionServiceImpl.name);

  constructor(private readonly permissionRepository: PermissionRepository) {}

  async createPermission(createPermissionDto: CreatePermissionDto): Promise<Permission> {
    this.logger.debug('PermissionService.createPermission: Called');
    return this.permissionRepository.create(createPermissionDto);
  }

  async findAllPermissions(filters?: PermissionFilters): Promise<Permission[]> {
    this.logger.debug('PermissionService.findAllPermissions: Called');
    return this.permissionRepository.findAll(filters);
  }

  async findOnePermission(id: string): Promise<Permission | null> {
    this.logger.debug('PermissionService.findOnePermission: Called');
    return this.permissionRepository.findOne(id);
  }

  async updatePermission(
    id: string,
    updatePermissionDto: UpdatePermissionDto,
  ): Promise<Permission> {
    this.logger.debug('PermissionService.updatePermission: Called');
    const permission = await this.permissionRepository.findOne(id);
    if (!permission) {
      throw new NotFoundException(`Permission with id ${id} not found`);
    }
    return this.permissionRepository.update(id, updatePermissionDto);
  }

  async removePermission(id: string): Promise<void> {
    this.logger.debug('PermissionService.removePermission: Called');
    const permission = await this.permissionRepository.findOne(id);
    if (!permission) {
      throw new NotFoundException(`Permission with id ${id} not found`);
    }
    await this.permissionRepository.delete(id);
  }

  async findByResource(resource: string): Promise<Permission[]> {
    this.logger.debug('PermissionService.findByResource: Called');
    return this.permissionRepository.findByResource(resource);
  }
}
