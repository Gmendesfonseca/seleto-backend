import { User } from '../user.model';

type FindAllDto = {
  email?: string;
  username?: string;
  status?: string;
  type?: string;
  isVerified?: boolean;
  page?: number;
  limit?: number;
};

type FindOneDto = {
  id?: string;
  email?: string;
  username?: string;
  password?: string;
};

type CreateDto = {
  email: string;
  password: string;
  username: string;
  name: string;
  type: string;
};

type UpdateDto = Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>;

type UserDto = User | null;

type UsersDto = { users: User[]; total: number };

export abstract class UserRepositoryInterface {
  abstract findOne(data: FindOneDto): Promise<UserDto>;
  abstract findAll(data?: FindAllDto): Promise<UsersDto>;
  abstract create(input: CreateDto): Promise<User>;
  abstract update(id: string, data: UpdateDto): Promise<User>;
  abstract delete(id: string): Promise<void>;
}

export {
  FindOneDto as FindUserDto,
  CreateDto as CreateUserDto,
  UpdateDto as UpdateUserDto,
  FindAllDto as FindUsersDto,
  UserDto as UserOutputDto,
  UsersDto as UsersOutputDto,
};
