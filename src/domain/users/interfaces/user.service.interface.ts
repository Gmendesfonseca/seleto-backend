import { UserInterface } from './user.interface';

export interface ActivateInput {
  id: string;
  secret: string;
}

export interface CreateUserInput {
  email: string;
  password: string;
  username: string;
  type: string;
}

export interface UpdateUsernameInput {
  id: string;
  username: string;
}

export interface UpdateUserInput {
  username?: string;
  email?: string;
  status?: string;
  isVerified?: boolean;
}

export interface UserFilters {
  email?: string;
  username?: string;
  status?: string;
  type?: string;
  isVerified?: boolean;
  page?: number;
  limit?: number;
}

export interface RequestChangeEmailInput {
  id: string;
  email: string;
}

export interface ChangeEmailInput {
  id: string;
  secret: string;
  email: string;
}

export abstract class UsersServiceInterface {
  abstract findOne(id: string): Promise<UserInterface | null>;
  abstract findAll(filters?: UserFilters): Promise<{ users: UserInterface[]; total: number }>;
  abstract findOneByEmail(email: string): Promise<UserInterface | null>;
  abstract findOneByCredentials(credentials: {
    email: string;
    password: string;
  }): Promise<UserInterface | null>;
  abstract createUser(input: CreateUserInput): Promise<UserInterface>;
  abstract activate(input: ActivateInput): Promise<void>;
  abstract updateUsername(input: UpdateUsernameInput): Promise<void>;
  abstract updateUser(id: string, input: UpdateUserInput): Promise<UserInterface>;
  abstract changeEmail(input: ChangeEmailInput): Promise<void>;
  abstract requestChangeEmail(input: RequestChangeEmailInput): Promise<void>;
  abstract delete(id: string): Promise<void>;
  abstract updatePasswordBySecret(secretKey: string, hashedPassword: string): Promise<void>;
}
