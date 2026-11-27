import { DateTime } from 'luxon';
export class CreateRoleDto {
  name: string;
  description?: string;
  permissions: string[];
  isActive: boolean;
  isDefault?: boolean;
}

export class UpdateRoleDto {
  name?: string;
  description?: string;
  permissions?: string[];
  isActive?: boolean;
  isDefault?: boolean;
}

export class RoleQueryDto {
  name?: string;
  isActive?: boolean;
  isDefault?: boolean;
}

export class RoleResponseDto {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
  isActive: boolean;
  isDefault: boolean;
  createdAt: DateTime;
  updatedAt: DateTime;
}

export class CreatePermissionDto {
  name: string;
  resource: string;
  action: string;
  description?: string;
  isActive: boolean;
}

export class UpdatePermissionDto {
  name?: string;
  resource?: string;
  action?: string;
  description?: string;
  isActive?: boolean;
}

export class PermissionQueryDto {
  name?: string;
  resource?: string;
  action?: string;
  isActive?: boolean;
}

export class PermissionResponseDto {
  id: string;
  name: string;
  resource: string;
  action: string;
  description?: string;
  isActive: boolean;
  createdAt: DateTime;
  updatedAt: DateTime;
}
