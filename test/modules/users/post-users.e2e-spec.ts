import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { faker } from '@faker-js/faker';
import {
  AuthHelper,
  expectUnauthorizedResponse,
  createMockServices,
} from '../../helpers/auth-helper';
import { UsersController } from '../../../src/domain/users/users.controller';
import { UsersServiceInterface } from '../../../src/domain/users/interfaces/user.service.interface';

describe('Users Controller - POST /users (e2e)', () => {
  let app: INestApplication;
  let authHelper: AuthHelper;
  let mockUsersService: any;

  const validActivationData = {
    userId: faker.string.uuid(),
    username: faker.internet.username(),
    password: faker.internet.password({ length: 12 }),
    confirmPassword: faker.internet.password({ length: 12 }),
  };

  beforeAll(async () => {
    validActivationData.confirmPassword = validActivationData.password;

    const { mockUsersService: mockService } = createMockServices();
    mockUsersService = mockService;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: 'test-secret',
          signOptions: { expiresIn: '1h' },
        }),
      ],
      controllers: [UsersController],
      providers: [
        {
          provide: UsersServiceInterface,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    authHelper = new AuthHelper(app);
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Authentication Tests', () => {
    it('should activate user when authenticated', async () => {
      // Arrange
      mockUsersService.activate.mockResolvedValue(undefined);
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedPost(
        '/users',
        validActivationData,
        testUser,
      );

      // Assert
      expect(response.status).toBe(201);
      expect(response.body.message).toBe('User activated successfully');
      expect(mockUsersService.activate).toHaveBeenCalledWith(validActivationData);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await authHelper
        .unauthenticatedRequest('post', '/users')
        .send(validActivationData);
      expectUnauthorizedResponse(response);
      expect(mockUsersService.activate).not.toHaveBeenCalled();
    });

    it('should return 401 with invalid token', async () => {
      const response = await authHelper
        .invalidTokenRequest('post', '/users')
        .send(validActivationData);
      expectUnauthorizedResponse(response);
      expect(mockUsersService.activate).not.toHaveBeenCalled();
    });

    it('should return 401 with expired token', async () => {
      const response = await authHelper
        .expiredTokenRequest('post', '/users')
        .send(validActivationData);
      expectUnauthorizedResponse(response);
      expect(mockUsersService.activate).not.toHaveBeenCalled();
    });
  });

  describe('Validation Tests', () => {
    it('should validate required fields', async () => {
      // Arrange
      const testUser = authHelper.createTestUser();
      const incompleteData = {
        userId: faker.string.uuid(),
        // Missing username, password, confirmPassword
      };

      // Act
      const { response } = await authHelper.authenticatedPost('/users', incompleteData, testUser);

      // Assert
      expect(response.status).toBe(400);
      expect(mockUsersService.activate).not.toHaveBeenCalled();
    });

    it('should validate userId format', async () => {
      // Arrange
      const testUser = authHelper.createTestUser();
      const invalidData = {
        ...validActivationData,
        userId: 'invalid-uuid',
      };

      // Act
      const { response } = await authHelper.authenticatedPost('/users', invalidData, testUser);

      // Assert
      expect(response.status).toBe(400);
    });

    it('should validate password requirements', async () => {
      // Arrange
      const testUser = authHelper.createTestUser();
      const weakPasswordData = {
        ...validActivationData,
        password: '123',
        confirmPassword: '123',
      };

      // Act
      const { response } = await authHelper.authenticatedPost('/users', weakPasswordData, testUser);

      // Assert
      expect(response.status).toBe(400);
    });

    it('should validate password confirmation match', async () => {
      // Arrange
      const testUser = authHelper.createTestUser();
      const mismatchData = {
        ...validActivationData,
        password: 'strongPassword123!',
        confirmPassword: 'differentPassword456!',
      };

      // Act
      const { response } = await authHelper.authenticatedPost('/users', mismatchData, testUser);

      // Assert
      expect(response.status).toBe(400);
    });

    it('should validate username requirements', async () => {
      // Arrange
      const testUser = authHelper.createTestUser();
      const invalidUsernameData = {
        ...validActivationData,
        username: 'ab', // Too short
      };

      // Act
      const { response } = await authHelper.authenticatedPost(
        '/users',
        invalidUsernameData,
        testUser,
      );

      // Assert
      expect(response.status).toBe(400);
    });
  });

  describe('User Context Tests', () => {
    it('should work with person user', async () => {
      // Arrange
      mockUsersService.activate.mockResolvedValue(undefined);
      const personUser = authHelper.createPersonUser();

      // Act
      const { response } = await authHelper.authenticatedPost(
        '/users',
        validActivationData,
        personUser,
      );

      // Assert
      expect(response.status).toBe(201);
      expect(mockUsersService.activate).toHaveBeenCalled();
    });

    it('should work with company user', async () => {
      // Arrange
      mockUsersService.activate.mockResolvedValue(undefined);
      const companyUser = authHelper.createCompanyUser();

      // Act
      const { response } = await authHelper.authenticatedPost(
        '/users',
        validActivationData,
        companyUser,
      );

      // Assert
      expect(response.status).toBe(201);
      expect(mockUsersService.activate).toHaveBeenCalled();
    });
  });

  describe('Error Handling Tests', () => {
    it('should handle service activation errors', async () => {
      // Arrange
      mockUsersService.activate.mockRejectedValue(new Error('User already activated'));
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedPost(
        '/users',
        validActivationData,
        testUser,
      );

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Failed to activate user');
    });

    it('should handle user not found during activation', async () => {
      // Arrange
      const notFoundError = new Error('User not found');
      notFoundError.name = 'NotFoundException';
      mockUsersService.activate.mockRejectedValue(notFoundError);
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedPost(
        '/users',
        validActivationData,
        testUser,
      );

      // Assert
      expect(response.status).toBe(400);
    });

    it('should handle duplicate username errors', async () => {
      // Arrange
      const duplicateError = new Error('Username already exists');
      duplicateError.name = 'ConflictException';
      mockUsersService.activate.mockRejectedValue(duplicateError);
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedPost(
        '/users',
        validActivationData,
        testUser,
      );

      // Assert
      expect(response.status).toBe(400);
    });
  });

  describe('Success Response Tests', () => {
    it('should return success message on successful activation', async () => {
      // Arrange
      mockUsersService.activate.mockResolvedValue(undefined);
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedPost(
        '/users',
        validActivationData,
        testUser,
      );

      // Assert
      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        message: 'User activated successfully',
      });
    });

    it('should call service with correct parameters', async () => {
      // Arrange
      mockUsersService.activate.mockResolvedValue(undefined);
      const testUser = authHelper.createTestUser();

      // Act
      await authHelper.authenticatedPost('/users', validActivationData, testUser);

      // Assert
      expect(mockUsersService.activate).toHaveBeenCalledWith({
        userId: validActivationData.userId,
        username: validActivationData.username,
        password: validActivationData.password,
        confirmPassword: validActivationData.confirmPassword,
      });
    });
  });

  describe('Data Integrity Tests', () => {
    it('should handle various valid username formats', async () => {
      // Arrange
      mockUsersService.activate.mockResolvedValue(undefined);
      const testUser = authHelper.createTestUser();
      const usernameVariations = ['john_doe', 'johndoe123', 'john.doe', 'JohnDoe', 'john-doe'];

      // Act & Assert
      for (const username of usernameVariations) {
        const data = { ...validActivationData, username };
        const { response } = await authHelper.authenticatedPost('/users', data, testUser);
        expect(response.status).toBe(201);
        jest.clearAllMocks();
      }
    });

    it('should handle various valid password formats', async () => {
      // Arrange
      mockUsersService.activate.mockResolvedValue(undefined);
      const testUser = authHelper.createTestUser();
      const strongPasswords = [
        'StrongPass123!',
        'MySecureP@ssw0rd',
        'Complex!Pass123',
        'Secure#Password456',
      ];

      // Act & Assert
      for (const password of strongPasswords) {
        const data = {
          ...validActivationData,
          password,
          confirmPassword: password,
        };
        const { response } = await authHelper.authenticatedPost('/users', data, testUser);
        expect(response.status).toBe(201);
        jest.clearAllMocks();
      }
    });
  });
});
