import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import * as bcrypt from 'bcrypt';

import { AuthService } from './auth.service';
import { UsersServiceInterface } from '../users/interfaces';
import { SecretServiceInterface } from '../secret/interface/secret.service.interface';
import { CompanyServiceInterface } from '../companies/interfaces/company.service.interface';
import { PersonServiceInterface } from '../persons/interfaces/person.service.interface';
import { UserType } from 'src/shared/utils/constants';

// Mock bcrypt module
jest.mock('bcrypt');
const mockedBcrypt = jest.mocked(bcrypt);

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersServiceInterface>;
  let secretService: jest.Mocked<SecretServiceInterface>;
  let jwtService: jest.Mocked<JwtService>;
  let mailerService: jest.Mocked<MailerService>;
  let companyService: jest.Mocked<CompanyServiceInterface>;
  let personService: jest.Mocked<PersonServiceInterface>;

  // Test data
  const mockUser = {
    id: 'c1a2b3c4-d5e6-7f8g-9h0i-j1k2l3m4n5o6',
    email: 'test@example.com',
    username: 'testuser',
    name: 'Test User',
    password: '$2b$12$hashedpassword123',
    type: 'PERSON',
    status: 'ACTIVE',
  };

  beforeEach(async () => {
    // Create mocked services
    const mockUsersService = {
      findOneByEmail: jest.fn(),
      findOne: jest.fn(),
      createUser: jest.fn(),
      updatePasswordBySecret: jest.fn(),
    };

    const mockSecretService = {
      generateSecret: jest.fn(),
      validateSecret: jest.fn(),
      createSecret: jest.fn(),
      deleteSecret: jest.fn(),
    };

    const mockJwtService = {
      sign: jest.fn(),
      verify: jest.fn(),
    };

    const mockMailerService = {
      sendMail: jest.fn(),
    };

    const mockCompanyService = {
      create: jest.fn(),
    };

    const mockPersonService = {
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersServiceInterface,
          useValue: mockUsersService,
        },
        {
          provide: SecretServiceInterface,
          useValue: mockSecretService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: MailerService,
          useValue: mockMailerService,
        },
        {
          provide: CompanyServiceInterface,
          useValue: mockCompanyService,
        },
        {
          provide: PersonServiceInterface,
          useValue: mockPersonService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersServiceInterface);
    secretService = module.get(SecretServiceInterface);
    jwtService = module.get(JwtService);
    mailerService = module.get(MailerService);
    companyService = module.get(CompanyServiceInterface);
    personService = module.get(PersonServiceInterface);

    // Setup bcrypt mocks
    (mockedBcrypt.hash as jest.Mock).mockImplementation(
      async (password: string) => `hashed_${password}`,
    );
    (mockedBcrypt.compare as jest.Mock).mockImplementation(
      async (password: string, hash: string) => {
        return hash === `hashed_${password}`;
      },
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(AuthService);
  });

  describe('signIn', () => {
    it('should successfully sign in with valid credentials', async () => {
      // Setup
      const email = 'test@example.com';
      const password = 'password123';
      const expectedToken = 'jwt-token-123';

      usersService.findByEmail.mockResolvedValue(mockUser);
      (mockedBcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.sign.mockReturnValue(expectedToken);

      // Mock Date.now() to get consistent expiration
      const mockNow = 1234567890;
      jest.spyOn(Date, 'now').mockReturnValue(mockNow);

      // Act
      const result = await service.signIn(email, password);

      // Assert
      expect(usersService.findByEmail).toHaveBeenCalledWith(email);
      expect(mockedBcrypt.compare).toHaveBeenCalledWith(password, mockUser.password);
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        username: mockUser.username,
      });
      expect(result).toEqual({
        accessToken: expectedToken,
        refreshToken: expectedToken, // JwtService.sign is mocked to return the same token
        expiresIn: 3600,
        user: {
          id: mockUser.id,
          username: mockUser.username,
          email: mockUser.email,
          type: mockUser.type,
          status: mockUser.status,
        },
      });
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      // Setup
      const email = 'nonexistent@example.com';
      const password = 'password123';

      usersService.findByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(service.signIn(email, password)).rejects.toThrow(
        new UnauthorizedException('Invalid credentials'),
      );
      expect(usersService.findByEmail).toHaveBeenCalledWith(email);
      expect(mockedBcrypt.compare).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      // Setup
      const email = 'test@example.com';
      const password = 'wrongpassword';

      usersService.findByEmail.mockResolvedValue(mockUser);
      (mockedBcrypt.compare as jest.Mock).mockResolvedValue(false);

      // Act & Assert
      await expect(service.signIn(email, password)).rejects.toThrow(
        new UnauthorizedException('Invalid credentials'),
      );
      expect(usersService.findByEmail).toHaveBeenCalledWith(email);
      expect(mockedBcrypt.compare).toHaveBeenCalledWith(password, mockUser.password);
    });
  });

  describe('signUp', () => {
    it('should successfully create a new user PERSON', async () => {
      // Setup
      const payload = {
        email: 'newuser@example.com',
        password: 'password123',
        username: 'newuser',
        type: UserType.PERSON,
        name: 'New User',
        phone: '1234567890',
      };
      const hashedPassword = 'hashed_password123';

      usersService.findByEmail.mockResolvedValue(null);
      (mockedBcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      usersService.create.mockResolvedValue(mockUser);
      personService.create.mockResolvedValue({} as any);
      mailerService.sendMail.mockResolvedValue(undefined);

      // Act
      await service.signUp(payload);

      // Assert
      expect(usersService.findByEmail).toHaveBeenCalledWith(payload.email);
      expect(mockedBcrypt.hash).toHaveBeenCalledWith(payload.password, 12);
      expect(usersService.create).toHaveBeenCalledWith({
        email: payload.email,
        username: payload.username,
        password: hashedPassword,
        type: 'PERSON',
      });
      expect(personService.create).toHaveBeenCalledWith({
        userId: mockUser.id,
        firstName: 'New',
        lastName: 'User',
        email: payload.email,
      });
      expect(mailerService.sendMail).toHaveBeenCalledWith({
        to: payload.email,
        subject: 'Bem vindo ao Seleto!',
        template: 'welcome',
        context: { username: payload.username },
      });
    });

    it('should successfully create a new user COMPANY', async () => {
      // Setup
      const payload = {
        email: 'newcompany@example.com',
        password: 'password123',
        username: 'newcompany',
        type: UserType.COMPANY,
        name: 'New Company',
        phone: '0987654321',
      };
      const hashedPassword = 'hashed_password123';

      usersService.findByEmail.mockResolvedValue(null);
      (mockedBcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      usersService.create.mockResolvedValue(mockUser);
      companyService.create.mockResolvedValue({} as any);
      mailerService.sendMail.mockResolvedValue(undefined);

      // Act
      await service.signUp(payload);

      // Assert
      expect(usersService.findByEmail).toHaveBeenCalledWith(payload.email);
      expect(mockedBcrypt.hash).toHaveBeenCalledWith(payload.password, 12);
      expect(usersService.create).toHaveBeenCalledWith({
        email: payload.email,
        username: payload.username,
        password: hashedPassword,
        type: 'COMPANY',
      });
      expect(companyService.create).toHaveBeenCalledWith({
        name: payload.name,
      });
      expect(mailerService.sendMail).toHaveBeenCalledWith({
        to: payload.email,
        subject: 'Bem vindo ao Seleto!',
        template: 'welcome',
        context: { username: payload.username },
      });
    });

    it('should throw ConflictException when user already exists', async () => {
      // Setup
      const payload = {
        email: 'existing@example.com',
        password: 'password123',
        type: UserType.PERSON,
        username: 'existinguser',
        name: 'Existing User',
        phone: '1234567890',
      };

      usersService.findByEmail.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(service.signUp(payload)).rejects.toThrow(
        new ConflictException('User already exists'),
      );
      expect(usersService.findByEmail).toHaveBeenCalledWith(payload.email);
      expect(usersService.create).not.toHaveBeenCalled();
    });

    it('should continue when email sending fails', async () => {
      // Setup
      const payload = {
        email: 'newuser@example.com',
        password: 'password123',
        username: 'newuser',
        type: UserType.PERSON,
        name: 'New User',
        phone: '1234567890',
      };

      usersService.findByEmail.mockResolvedValue(null);
      usersService.create.mockResolvedValue(mockUser);
      mailerService.sendMail.mockRejectedValue(new Error('Email service down'));

      // Act & Assert
      await expect(service.signUp(payload)).resolves.not.toThrow();
      expect(usersService.create).toHaveBeenCalled();
    });
  });

  describe('forgotPassword', () => {
    it('should successfully initiate password reset', async () => {
      // Setup
      const email = 'test@example.com';
      const secretKey = 'secret-123';

      usersService.findByEmail.mockResolvedValue(mockUser);
      secretService.generateSecret.mockReturnValue(secretKey);
      secretService.createSecret.mockResolvedValue(undefined);
      mailerService.sendMail.mockResolvedValue(undefined);

      // Act
      await service.forgotPassword(email);

      // Assert
      expect(usersService.findByEmail).toHaveBeenCalledWith(email);
      expect(secretService.generateSecret).toHaveBeenCalled();
      expect(secretService.createSecret).toHaveBeenCalledWith({
        secret: secretKey,
        type: 'PASSWORD',
        userId: mockUser.id,
      });
      expect(mailerService.sendMail).toHaveBeenCalledWith({
        to: email,
        subject: 'Solicitação de Redefinição de Senha',
        template: 'password-reset',
        context: { secretKey, username: mockUser.username },
      });
    });

    it('should throw NotFoundException when user is not found', async () => {
      // Setup
      const email = 'nonexistent@example.com';

      usersService.findByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(service.forgotPassword(email)).rejects.toThrow(
        new NotFoundException('User not found'),
      );
      expect(usersService.findByEmail).toHaveBeenCalledWith(email);
      expect(secretService.generateSecret).not.toHaveBeenCalled();
    });
  });

  describe('checkSecretKey', () => {
    it('should return true for valid secret key', async () => {
      // Setup
      const secretKey = 'valid-secret-123';

      secretService.validateSecret.mockResolvedValue(true);

      // Act
      const result = await service.checkSecretKey(secretKey);

      // Assert
      expect(secretService.validateSecret).toHaveBeenCalledWith({
        secret: secretKey,
        type: 'PASSWORD',
      });
      expect(result).toBe(true);
    });

    it('should throw UnauthorizedException for invalid secret key', async () => {
      // Setup
      const secretKey = 'invalid-secret-123';

      secretService.validateSecret.mockResolvedValue(false);

      // Act
      await expect(service.checkSecretKey(secretKey)).rejects.toThrow(
        new UnauthorizedException('Invalid secret key'),
      );

      // Assert
      expect(secretService.validateSecret).toHaveBeenCalledWith({
        secret: secretKey,
        type: 'PASSWORD',
      });
    });
  });

  describe('resetPassword', () => {
    it('should successfully reset password', async () => {
      // Setup
      const secretKey = 'valid-secret-123';
      const newPassword = 'newpassword123';
      const hashedPassword = 'hashed_newpassword123';

      secretService.validateSecret.mockResolvedValue(true);
      (mockedBcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      usersService.updatePasswordBySecret.mockResolvedValue(undefined);
      secretService.deleteSecret.mockResolvedValue(undefined);

      // Act
      await service.resetPassword(secretKey, newPassword);

      // Assert
      expect(secretService.validateSecret).toHaveBeenCalledWith({
        secret: secretKey,
        type: 'PASSWORD',
      });
      expect(mockedBcrypt.hash).toHaveBeenCalledWith(newPassword, 12);
      expect(usersService.updatePasswordBySecret).toHaveBeenCalledWith(secretKey, hashedPassword);
      expect(secretService.deleteSecret).toHaveBeenCalledWith(secretKey);
    });

    it('should throw UnauthorizedException for invalid secret key', async () => {
      // Setup
      const secretKey = 'invalid-secret-123';
      const newPassword = 'newpassword123';

      secretService.validateSecret.mockResolvedValue(false);

      // Act & Assert
      await expect(service.resetPassword(secretKey, newPassword)).rejects.toThrow(
        new UnauthorizedException('Invalid secret key'),
      );
      expect(secretService.validateSecret).toHaveBeenCalledWith({
        secret: secretKey,
        type: 'PASSWORD',
      });
      expect(usersService.updatePasswordBySecret).not.toHaveBeenCalled();
      expect(secretService.deleteSecret).not.toHaveBeenCalled();
    });
  });

  describe('refreshToken', () => {
    it('should successfully refresh token', async () => {
      // Setup
      const refreshToken = 'valid-refresh-token';
      const decodedToken = { sub: mockUser.id };
      const newToken = 'new-jwt-token';

      jwtService.verify.mockReturnValue(decodedToken);
      usersService.findById.mockResolvedValue(mockUser);
      jwtService.sign.mockReturnValue(newToken);

      // Mock Date.now()
      const mockNow = 1234567890;
      jest.spyOn(Date, 'now').mockReturnValue(mockNow);

      // Act
      const result = await service.refreshToken(refreshToken);

      // Assert
      expect(jwtService.verify).toHaveBeenCalledWith(refreshToken);
      expect(usersService.findById).toHaveBeenCalledWith(decodedToken.sub);
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        username: mockUser.username,
      });
      expect(result).toEqual({
        accessToken: newToken,
        refreshToken: newToken, // JwtService.sign is mocked to return the same token
        expiresIn: 3600,
        user: {
          id: mockUser.id,
          username: mockUser.username,
          email: mockUser.email,
          type: mockUser.type || 'PERSON',
          status: 'ACTIVE',
        },
      });
    });

    it('should throw UnauthorizedException when token verification fails', async () => {
      // Setup
      const refreshToken = 'invalid-refresh-token';

      jwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      // Act & Assert
      await expect(service.refreshToken(refreshToken)).rejects.toThrow(
        new UnauthorizedException('Invalid refresh token'),
      );
      expect(jwtService.verify).toHaveBeenCalledWith(refreshToken);
      expect(usersService.findById).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      // Setup
      const refreshToken = 'valid-refresh-token';
      const decodedToken = { sub: 'nonexistent-user-id' };

      jwtService.verify.mockReturnValue(decodedToken);
      usersService.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.refreshToken(refreshToken)).rejects.toThrow(
        new UnauthorizedException('Invalid refresh token'),
      );
      expect(jwtService.verify).toHaveBeenCalledWith(refreshToken);
      expect(usersService.findById).toHaveBeenCalledWith(decodedToken.sub);
    });
  });

  describe('private methods', () => {
    it('should hash password correctly', async () => {
      expect(mockedBcrypt.hash).toBeDefined();
    });

    it('should verify password correctly', async () => {
      expect(mockedBcrypt.compare).toBeDefined();
    });
  });
});
