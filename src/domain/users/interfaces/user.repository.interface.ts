import { User, Person, Company } from '../user.model';

export interface GetByCredentialsInputRepository {
  email: string;
  password: string;
}

export interface CreateUserInputRepository {
  email: string;
  password: string;
  username: string;
  type: string;
  company: Company | null;
  person: Person | null;
}

export interface CreatePersonInputRepository {
  userId: string;
  name: string;
  avatar: string | null;
}

export interface CreateCompanyInputRepository {
  userId: string;
  name: string;
  avatar: string | null;
}

export interface UpdateUsernameInputRepository {
  id: string;
  username: string;
}

export interface UpdatePasswordInputRepository {
  id: string;
  password: string;
}

export interface UpdateEmailInputRepository {
  id: string;
  email: string;
}

export interface ActivateInput {
  id: string;
}

export interface ValidateEmailInput {
  email: string;
}

export abstract class UsersRepositoryInterface {
  abstract findOne(id: string): Promise<User | null>;
  abstract findOneByEmail(email: string): Promise<User | null>;
  abstract findOneByCredentials(input: GetByCredentialsInputRepository): Promise<User | null>;
  abstract activate(input: ActivateInput): Promise<void>;
  abstract createUser(input: CreateUserInputRepository): Promise<User>;
  abstract createPerson(input: CreatePersonInputRepository): Promise<Person>;
  abstract createCompany(input: CreateCompanyInputRepository): Promise<Company>;
  abstract updateUsername(input: UpdateUsernameInputRepository): Promise<User>;
  abstract updatePassword(input: UpdatePasswordInputRepository): Promise<void>;
  abstract updateEmail(input: UpdateEmailInputRepository): Promise<void>;
  abstract validateEmail(input: ValidateEmailInput): Promise<boolean>;
  abstract delete(id: string): Promise<void>;
}
