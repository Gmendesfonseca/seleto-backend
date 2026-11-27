import { DateTime } from 'luxon';
export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
  isActive: boolean;
  isDefault: boolean;
  createdAt: DateTime;
  updatedAt: DateTime;
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description?: string;
  isActive: boolean;
  createdAt: DateTime;
  updatedAt: DateTime;
}

export interface RoleFilters {
  name?: string;
  isDefault?: boolean;
}

export interface PermissionFilters {
  name?: string;
  resource?: string;
  action?: string;
  isActive?: boolean;
}
