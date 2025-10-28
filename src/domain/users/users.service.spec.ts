import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UsersService } from './users.service';
import {
  UsersRepositoryInterface,
  UserInterface,
  UpdateUsernameInput,
  ActivateInput,
  ChangeEmailInput,
  RequestChangeEmailInput,
} from './interfaces';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import { SecretServiceInterface } from '../secret/interface/secret.service.interface';

describe('UsersService', () => {
  let service: UsersService;
  let usersRepository: jest.Mocked<UsersRepositoryInterface>;
  let configService: jest.Mocked<ConfigService>;
  let mailerService: jest.Mocked<MailerService>;
  let secretService: jest.Mocked<SecretServiceInterface>;

  const mockUser: UserInterface = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    username: 'johndoe',
    email: 'john.doe@example.com',
    password: 'hashedPassword123',
    status: 'ACTIVE',
    type: 'PERSON',
  };

  beforeEach(async () => {
    const mockUsersRepository = {
      findOne: jest.fn(),
      findAll: jest.fn(),
      findOneByEmail: jest.fn(),
      findOneByCredentials: jest.fn(),
      activate: jest.fn(),
      createUser: jest.fn(),
      createPerson: jest.fn(),
      createCompany: jest.fn(),
      updateUsername: jest.fn(),
      updatePassword: jest.fn(),
      updateEmail: jest.fn(),
      update: jest.fn(),
      validateEmail: jest.fn(),
      delete: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn(),
    };

    const mockMailerService = {
      sendMail: jest.fn(),
    };

    const mockSecretService = {
      generateSecret: jest.fn(),
      createSecret: jest.fn(),
      validateSecret: jest.fn(),
      deleteSecret: jest.fn(),
      getUserIdBySecret: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepositoryInterface,
          useValue: mockUsersRepository,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: MailerService,
          useValue: mockMailerService,
        },
        {
          provide: SecretServiceInterface,
          useValue: mockSecretService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    usersRepository = module.get(UsersRepositoryInterface);
    configService = module.get(ConfigService);
    mailerService = module.get(MailerService);
    secretService = module.get(SecretServiceInterface);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(UsersService);
  });

  describe('findOne', () => {
    it('should return user when found', async () => {
      // Arrange
      const userId = mockUser.id;
      usersRepository.findOne.mockResolvedValue(mockUser as any);

      // Act
      const result = await service.findOne(userId);

      // Assert
      expect(usersRepository.findOne).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      // Arrange
      const userId = 'non-existent-id';
      usersRepository.findOne.mockResolvedValue(null);

      // Act
      const result = await service.findOne(userId);

      // Assert
      expect(usersRepository.findOne).toHaveBeenCalledWith(userId);
      expect(result).toBeNull();
    });
  });
  describe('findAll', () => {
    it('should return all users with pagination', async () => {
      // Arrange
      const mockResult = { users: [mockUser as any], total: 1 };
      usersRepository.findAll.mockResolvedValue(mockResult);

      // Act
      const result = await service.findAll();

      // Assert
      expect(usersRepository.findAll).toHaveBeenCalledWith(undefined);
      expect(result).toEqual(mockResult);
    });

    it('should return filtered users', async () => {
      // Arrange
      const filters = { status: 'ACTIVE' };
      const mockResult = { users: [mockUser as any], total: 1 };
      usersRepository.findAll.mockResolvedValue(mockResult);

      // Act
      const result = await service.findAll(filters);

      // Assert
      expect(usersRepository.findAll).toHaveBeenCalledWith(filters);
      expect(result).toEqual(mockResult);
    });
  });

  describe('findOneByEmail', () => {
    it('should return user when found by email', async () => {
      // Arrange
      const email = mockUser.email;
      usersRepository.findOneByEmail.mockResolvedValue(mockUser as any);

      // Act
      const result = await service.findOneByEmail(email);

      // Assert
      expect(usersRepository.findOneByEmail).toHaveBeenCalledWith(email);
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found by email', async () => {
      // Arrange
      const email = 'nonexistent@example.com';
      usersRepository.findOneByEmail.mockResolvedValue(null);

      // Act
      const result = await service.findOneByEmail(email);

      // Assert
      expect(usersRepository.findOneByEmail).toHaveBeenCalledWith(email);
      expect(result).toBeNull();
    });
  });

  describe('updateUsername', () => {
    it('should update username successfully', async () => {
      // Arrange
      const updateInput: UpdateUsernameInput = { id: mockUser.id, username: 'newusername' };
      usersRepository.findOne.mockResolvedValue(mockUser as any);
      usersRepository.updateUsername.mockResolvedValue(mockUser as any);

      // Act
      await service.updateUsername(updateInput);

      // Assert
      expect(usersRepository.findOne).toHaveBeenCalledWith(mockUser.id);
      expect(usersRepository.updateUsername).toHaveBeenCalledWith(updateInput);
    });

    it('should throw NotFoundException when user not found', async () => {
      // Arrange
      const updateInput: UpdateUsernameInput = { id: 'non-existent-id', username: 'newusername' };
      usersRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.updateUsername(updateInput)).rejects.toThrow(
        new NotFoundException('User not found'),
      );
      expect(usersRepository.findOne).toHaveBeenCalledWith('non-existent-id');
      expect(usersRepository.updateUsername).not.toHaveBeenCalled();
    });
  });

  describe('createUser', () => {
    it('should create user successfully', async () => {
      // Arrange
      const createInput = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'hashedpassword',
        type: 'PERSON',
        company: null,
        person: null,
      };

      usersRepository.createUser.mockResolvedValue(mockUser as any);

      // Act
      const result = await service.createUser(createInput);

      // Assert
      expect(usersRepository.createUser).toHaveBeenCalledWith(createInput);
      expect(result).toEqual(mockUser);
    });
  });

  describe('delete', () => {
    it('should delete user successfully', async () => {
      // Arrange
      const userId = mockUser.id;
      usersRepository.delete.mockResolvedValue(undefined);

      // Act
      await service.delete(userId);

      // Assert
      expect(usersRepository.delete).toHaveBeenCalledWith(userId);
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      // Arrange
      const userId = mockUser.id;
      const updateData = { username: 'newusername' };
      const updatedUser = { ...mockUser, username: 'newusername' };

      usersRepository.findOne.mockResolvedValue(mockUser as any);
      usersRepository.update.mockResolvedValue(updatedUser as any);

      // Act
      const result = await service.updateUser(userId, updateData);

      // Assert
      expect(usersRepository.findOne).toHaveBeenCalledWith(userId);
      expect(usersRepository.update).toHaveBeenCalledWith(userId, updateData);
      expect(result).toEqual(updatedUser);
    });

    it('should throw NotFoundException when user not found', async () => {
      // Arrange
      const userId = 'non-existent-id';
      const updateData = { username: 'newusername' };

      usersRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.updateUser(userId, updateData)).rejects.toThrow(
        new NotFoundException('User not found'),
      );
      expect(usersRepository.findOne).toHaveBeenCalledWith(userId);
    });

    it('should return user unchanged when no update data provided', async () => {
      // Arrange
      const userId = mockUser.id;
      const updateData = { username: undefined };

      usersRepository.findOne.mockResolvedValue(mockUser as any);

      // Act
      const result = await service.updateUser(userId, updateData);

      // Assert
      expect(usersRepository.findOne).toHaveBeenCalledWith(userId);
      expect(usersRepository.update).not.toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });
  });
});
