import { Role, Permission, RoleFilters, PermissionFilters } from '../interfaces/role.interface';
import {
  CreateRoleDto,
  UpdateRoleDto,
  CreatePermissionDto,
  UpdatePermissionDto,
} from '../dto/role.dto';

export abstract class RoleRepository {
  abstract create(createRoleDto: CreateRoleDto): Promise<Role>;
  abstract findAll(filters?: RoleFilters): Promise<Role[]>;
  abstract findOne(id: string): Promise<Role | null>;
  abstract update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role>;
  abstract delete(id: string): Promise<void>;
  abstract findByName(name: string): Promise<Role | null>;
  abstract countByFilters(filters?: RoleFilters): Promise<number>;
}

export abstract class PermissionRepository {
  abstract create(createPermissionDto: CreatePermissionDto): Promise<Permission>;
  abstract findAll(filters?: PermissionFilters): Promise<Permission[]>;
  abstract findOne(id: string): Promise<Permission | null>;
  abstract update(id: string, updatePermissionDto: UpdatePermissionDto): Promise<Permission>;
  abstract delete(id: string): Promise<void>;
  abstract findByResource(resource: string): Promise<Permission[]>;
  abstract countByFilters(filters?: PermissionFilters): Promise<number>;
}
