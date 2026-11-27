import { authGuardProvider } from '../../helpers/auth-guard.provider';
import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  ValidationPipe,
  UnauthorizedException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { faker } from '@faker-js/faker';
import { AuthHelper, createMockServices } from '../../helpers/auth-helper';
import { AuthController } from '../../../src/domain/auth/auth.controller';
import { AuthServiceInterface } from '../../../src/domain/auth/interfaces/auth-service.interface';

describe('Auth Controller - POST /auth/signin (e2e)', () => {
  let app: INestApplication;
  let authHelper: AuthHelper;
  let mockAuthService: any;

  const validSignInData = {
    email: faker.internet.email(),
    password: faker.internet.password({ length: 12 }),
  };

  const mockSignInResponse = {
    accessToken: faker.string.alphanumeric(64),
    refreshToken: faker.string.alphanumeric(64),
    expiresIn: 3600,
    user: {
      id: faker.string.uuid(),
      username: faker.internet.username(),
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
        authGuardProvider,
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

  describe('Public Access Tests', () => {
    it('should sign in user with valid credentials (no auth required)', async () => {
      // Arrange
      mockAuthService.signIn.mockResolvedValue(mockSignInResponse);

      // Act
      const response = await authHelper
        .unauthenticatedRequest('post', '/auth/signin')
        .send(validSignInData);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockSignInResponse);
      expect(mockAuthService.signIn).toHaveBeenCalledWith(
        validSignInData.email,
        validSignInData.password,
      );
    });

    it('should work when authenticated as well', async () => {
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
        validSignInData.email,
        validSignInData.password,
      );
    });
  });

  describe('Validation Tests', () => {
    it('should validate required email field', async () => {
      // Arrange
      const testUser = authHelper.createTestUser();
      const incompleteData = {
        password: validSignInData.password,
        // Missing email
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
        email: validSignInData.email,
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

    it('should validate email is not empty', async () => {
      // Arrange
      const testUser = authHelper.createTestUser();
      const invalidData = {
        email: '',
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
        email: validSignInData.email,
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

    it('should validate email is string', async () => {
      // Arrange
      const testUser = authHelper.createTestUser();
      const invalidData = {
        email: 12345,
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
        email: validSignInData.email,
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
      const unauthorizedError = new UnauthorizedException('Invalid credentials');
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
      const notFoundError = new NotFoundException('User not found');
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
      const forbiddenError = new ForbiddenException('User account is inactive');
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
      mockAuthService.signIn.mockResolvedValue(mockSignInResponse);
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
        validSignInData.email,
        validSignInData.password,
      );
      expect(mockAuthService.signIn).toHaveBeenCalledTimes(1);
    });

    it('should handle various email formats', async () => {
      // Arrange
      const emailFormats = [
        'john_doe',
        'johndoe123',
        'john.doe@example.com',
        'JohnDoe',
        'user-name',
      ];
      mockAuthService.signIn.mockResolvedValue(mockSignInResponse);
      const testUser = authHelper.createTestUser();

      // Act & Assert
      for (const email of emailFormats) {
        const data = { ...validSignInData, email };
        const { response } = await authHelper.authenticatedPost('/auth/signin', data, testUser);
        expect(response.status).toBe(200);
        expect(mockAuthService.signIn).toHaveBeenCalledWith(email, validSignInData.password);
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
      expect(mockAuthService.signIn).toHaveBeenCalledWith(validSignInData.email, longPassword);
    });

    it('should handle special characters in credentials', async () => {
      // Arrange
      const specialCredentials = {
        email: 'user@domain.com',
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
        specialCredentials.email,
        specialCredentials.password,
      );
    });
  });
});
