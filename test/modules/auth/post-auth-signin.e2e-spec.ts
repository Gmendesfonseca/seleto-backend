import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { faker } from '@faker-js/faker';
import {
  AuthHelper,
  expectUnauthorizedResponse,
  createMockServices,
} from '../../helpers/auth-helper';
import { AuthController } from '../../../src/domain/auth/auth.controller';
import { AuthServiceInterface } from '../../../src/domain/auth/interfaces/auth-service.interface';

describe('Auth Controller - POST /auth/signin (e2e)', () => {
  let app: INestApplication;
  let authHelper: AuthHelper;
  let mockAuthService: any;

  const validSignInData = {
    username: faker.internet.username(),
    password: faker.internet.password({ length: 12 }),
  };

  const mockSignInResponse = {
    accessToken: faker.string.alphanumeric(64),
    refreshToken: faker.string.alphanumeric(64),
    expiresIn: 3600,
    user: {
      id: faker.string.uuid(),
      username: validSignInData.username,
      email: faker.internet.email(),
      type: 'PERSON',
      status: 'ACTIVE',
    },
  };

  beforeAll(async () => {
    const { mockAuthService: mockService } = createMockServices();
    mockAuthService = mockService;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: 'test-secret',
          signOptions: { expiresIn: '1h' },
        }),
      ],
      controllers: [AuthController],
      providers: [
        {
          provide: AuthServiceInterface,
          useValue: mockAuthService,
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
    it('should sign in user when authenticated with valid credentials', async () => {
      // Arrange
      mockAuthService.signIn.mockResolvedValue(mockSignInResponse);
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedPost(
        '/auth/signin',
        validSignInData,
        testUser,
      );

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockSignInResponse);
      expect(mockAuthService.signIn).toHaveBeenCalledWith(
        validSignInData.username,
        validSignInData.password,
      );
    });

    it('should return 401 when not authenticated', async () => {
      const response = await authHelper
        .unauthenticatedRequest('post', '/auth/signin')
        .send(validSignInData);
      expectUnauthorizedResponse(response);
      expect(mockAuthService.signIn).not.toHaveBeenCalled();
    });

    it('should return 401 with invalid token', async () => {
      const response = await authHelper
        .invalidTokenRequest('post', '/auth/signin')
        .send(validSignInData);
      expectUnauthorizedResponse(response);
      expect(mockAuthService.signIn).not.toHaveBeenCalled();
    });

    it('should return 401 with expired token', async () => {
      const response = await authHelper
        .expiredTokenRequest('post', '/auth/signin')
        .send(validSignInData);
      expectUnauthorizedResponse(response);
      expect(mockAuthService.signIn).not.toHaveBeenCalled();
    });
  });

  describe('Validation Tests', () => {
    it('should validate required username field', async () => {
      // Arrange
      const testUser = authHelper.createTestUser();
      const incompleteData = {
        password: validSignInData.password,
        // Missing username
      };

      // Act
      const { response } = await authHelper.authenticatedPost(
        '/auth/signin',
        incompleteData,
        testUser,
      );

      // Assert
      expect(response.status).toBe(400);
      expect(mockAuthService.signIn).not.toHaveBeenCalled();
    });

    it('should validate required password field', async () => {
      // Arrange
      const testUser = authHelper.createTestUser();
      const incompleteData = {
        username: validSignInData.username,
        // Missing password
      };

      // Act
      const { response } = await authHelper.authenticatedPost(
        '/auth/signin',
        incompleteData,
        testUser,
      );

      // Assert
      expect(response.status).toBe(400);
      expect(mockAuthService.signIn).not.toHaveBeenCalled();
    });

    it('should validate username is not empty', async () => {
      // Arrange
      const testUser = authHelper.createTestUser();
      const invalidData = {
        username: '',
        password: validSignInData.password,
      };

      // Act
      const { response } = await authHelper.authenticatedPost(
        '/auth/signin',
        invalidData,
        testUser,
      );

      // Assert
      expect(response.status).toBe(400);
      expect(mockAuthService.signIn).not.toHaveBeenCalled();
    });

    it('should validate password is not empty', async () => {
      // Arrange
      const testUser = authHelper.createTestUser();
      const invalidData = {
        username: validSignInData.username,
        password: '',
      };

      // Act
      const { response } = await authHelper.authenticatedPost(
        '/auth/signin',
        invalidData,
        testUser,
      );

      // Assert
      expect(response.status).toBe(400);
      expect(mockAuthService.signIn).not.toHaveBeenCalled();
    });

    it('should validate username is string', async () => {
      // Arrange
      const testUser = authHelper.createTestUser();
      const invalidData = {
        username: 12345,
        password: validSignInData.password,
      };

      // Act
      const { response } = await authHelper.authenticatedPost(
        '/auth/signin',
        invalidData,
        testUser,
      );

      // Assert
      expect(response.status).toBe(400);
      expect(mockAuthService.signIn).not.toHaveBeenCalled();
    });

    it('should validate password is string', async () => {
      // Arrange
      const testUser = authHelper.createTestUser();
      const invalidData = {
        username: validSignInData.username,
        password: 12345,
      };

      // Act
      const { response } = await authHelper.authenticatedPost(
        '/auth/signin',
        invalidData,
        testUser,
      );

      // Assert
      expect(response.status).toBe(400);
      expect(mockAuthService.signIn).not.toHaveBeenCalled();
    });
  });

  describe('User Context Tests', () => {
    it('should work with person user', async () => {
      // Arrange
      mockAuthService.signIn.mockResolvedValue(mockSignInResponse);
      const personUser = authHelper.createPersonUser();

      // Act
      const { response } = await authHelper.authenticatedPost(
        '/auth/signin',
        validSignInData,
        personUser,
      );

      // Assert
      expect(response.status).toBe(200);
      expect(mockAuthService.signIn).toHaveBeenCalled();
    });

    it('should work with company user', async () => {
      // Arrange
      mockAuthService.signIn.mockResolvedValue(mockSignInResponse);
      const companyUser = authHelper.createCompanyUser();

      // Act
      const { response } = await authHelper.authenticatedPost(
        '/auth/signin',
        validSignInData,
        companyUser,
      );

      // Assert
      expect(response.status).toBe(200);
      expect(mockAuthService.signIn).toHaveBeenCalled();
    });
  });

  describe('Error Handling Tests', () => {
    it('should handle invalid credentials error', async () => {
      // Arrange
      const unauthorizedError = new Error('Invalid credentials');
      unauthorizedError.name = 'UnauthorizedException';
      mockAuthService.signIn.mockRejectedValue(unauthorizedError);
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedPost(
        '/auth/signin',
        validSignInData,
        testUser,
      );

      // Assert
      expect(response.status).toBe(401);
    });

    it('should handle user not found error', async () => {
      // Arrange
      const notFoundError = new Error('User not found');
      notFoundError.name = 'NotFoundException';
      mockAuthService.signIn.mockRejectedValue(notFoundError);
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedPost(
        '/auth/signin',
        validSignInData,
        testUser,
      );

      // Assert
      expect(response.status).toBe(404);
    });

    it('should handle inactive user error', async () => {
      // Arrange
      const forbiddenError = new Error('User account is inactive');
      forbiddenError.name = 'ForbiddenException';
      mockAuthService.signIn.mockRejectedValue(forbiddenError);
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedPost(
        '/auth/signin',
        validSignInData,
        testUser,
      );

      // Assert
      expect(response.status).toBe(403);
    });

    it('should handle generic service errors', async () => {
      // Arrange
      mockAuthService.signIn.mockRejectedValue(new Error('Database connection error'));
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedPost(
        '/auth/signin',
        validSignInData,
        testUser,
      );

      // Assert
      expect(response.status).toBe(500);
    });
  });

  describe('Response Structure Tests', () => {
    it('should return signin response with correct structure', async () => {
      // Arrange
      mockAuthService.signIn.mockResolvedValue(mockSignInResponse);
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedPost(
        '/auth/signin',
        validSignInData,
        testUser,
      );

      // Assert
      expect(response.body).toMatchObject({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
        expiresIn: expect.any(Number),
        user: expect.objectContaining({
          id: expect.any(String),
          username: expect.any(String),
          email: expect.any(String),
          type: expect.any(String),
          status: expect.any(String),
        }),
      });
    });

    it('should not expose password in response', async () => {
      // Arrange
      const responseWithPassword = {
        ...mockSignInResponse,
        user: { ...mockSignInResponse.user, password: 'secret123' },
      };
      mockAuthService.signIn.mockResolvedValue(responseWithPassword);
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedPost(
        '/auth/signin',
        validSignInData,
        testUser,
      );

      // Assert
      expect(response.body.user).not.toHaveProperty('password');
    });
  });

  describe('Service Integration Tests', () => {
    it('should call service with correct parameters', async () => {
      // Arrange
      mockAuthService.signIn.mockResolvedValue(mockSignInResponse);
      const testUser = authHelper.createTestUser();

      // Act
      await authHelper.authenticatedPost('/auth/signin', validSignInData, testUser);

      // Assert
      expect(mockAuthService.signIn).toHaveBeenCalledWith(
        validSignInData.username,
        validSignInData.password,
      );
      expect(mockAuthService.signIn).toHaveBeenCalledTimes(1);
    });

    it('should handle various username formats', async () => {
      // Arrange
      const usernameFormats = [
        'john_doe',
        'johndoe123',
        'john.doe@example.com',
        'JohnDoe',
        'user-name',
      ];
      mockAuthService.signIn.mockResolvedValue(mockSignInResponse);
      const testUser = authHelper.createTestUser();

      // Act & Assert
      for (const username of usernameFormats) {
        const data = { ...validSignInData, username };
        const { response } = await authHelper.authenticatedPost('/auth/signin', data, testUser);
        expect(response.status).toBe(200);
        expect(mockAuthService.signIn).toHaveBeenCalledWith(username, validSignInData.password);
        jest.clearAllMocks();
      }
    });
  });

  describe('Security Tests', () => {
    it('should handle long password gracefully', async () => {
      // Arrange
      const longPassword = 'a'.repeat(1000);
      mockAuthService.signIn.mockResolvedValue(mockSignInResponse);
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedPost(
        '/auth/signin',
        { ...validSignInData, password: longPassword },
        testUser,
      );

      // Assert
      expect(response.status).toBe(200);
      expect(mockAuthService.signIn).toHaveBeenCalledWith(validSignInData.username, longPassword);
    });

    it('should handle special characters in credentials', async () => {
      // Arrange
      const specialCredentials = {
        username: 'user@domain.com',
        password: 'P@ssw0rd!@#$%^&*()',
      };
      mockAuthService.signIn.mockResolvedValue(mockSignInResponse);
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedPost(
        '/auth/signin',
        specialCredentials,
        testUser,
      );

      // Assert
      expect(response.status).toBe(200);
      expect(mockAuthService.signIn).toHaveBeenCalledWith(
        specialCredentials.username,
        specialCredentials.password,
      );
    });
  });
});
