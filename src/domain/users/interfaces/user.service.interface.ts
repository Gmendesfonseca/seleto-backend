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
  abstract activate(input: ActivateInput): Promise<void>;
  abstract updateUsername(input: UpdateUsernameInput): Promise<void>;
  abstract changeEmail(input: ChangeEmailInput): Promise<void>;
  abstract requestChangeEmail(input: RequestChangeEmailInput): Promise<void>;
  abstract delete(id: string): Promise<void>;
}
