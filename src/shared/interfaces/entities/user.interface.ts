export interface User {
  id: string;
  name: string;
  email: string;
  username?: string;
  createdAt: Date;
  updatedAt: Date;
  companyId?: string;
  roleId?: string;
  isActive: boolean;
}

export interface UserActivation {
  secret: string;
  email: string;
}

export interface UserEmailUpdate {
  email: string;
  secret: string;
}

export interface UserUpdate {
  username: string;
}
