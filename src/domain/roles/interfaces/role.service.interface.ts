import { Role, Permission, RoleFilters, PermissionFilters } from './role.interface';
import {
  CreateRoleDto,
  UpdateRoleDto,
  CreatePermissionDto,
  UpdatePermissionDto,
} from '../dto/role.dto';

export abstract class RoleService {
  abstract create(createRoleDto: CreateRoleDto): Promise<Role>;
  abstract findAll(filters?: RoleFilters): Promise<Role[]>;
  abstract findOne(id: string): Promise<Role | null>;
  abstract update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role>;
  abstract remove(id: string): Promise<void>;
  abstract assignPermissions(roleId: string, permissionIds: string[]): Promise<Role>;
  abstract removePermissions(roleId: string, permissionIds: string[]): Promise<Role>;
}

export abstract class PermissionService {
  abstract createPermission(createPermissionDto: CreatePermissionDto): Promise<Permission>;
  abstract findAllPermissions(filters?: PermissionFilters): Promise<Permission[]>;
  abstract findOnePermission(id: string): Promise<Permission | null>;
  abstract updatePermission(
    id: string,
    updatePermissionDto: UpdatePermissionDto,
  ): Promise<Permission>;
  abstract removePermission(id: string): Promise<void>;
  abstract findByResource(resource: string): Promise<Permission[]>;
}
