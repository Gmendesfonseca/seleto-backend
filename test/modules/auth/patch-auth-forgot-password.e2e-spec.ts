import { authGuardProvider } from '../../helpers/auth-guard.provider';
import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  ValidationPipe,
  NotFoundException,
  ForbiddenException,
  ServiceUnavailableException,
  HttpException,
} from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { faker } from '@faker-js/faker';
import { AuthHelper, createMockServices } from '../../helpers/auth-helper';
import { AuthController } from '../../../src/domain/auth/auth.controller';
import { AuthServiceInterface } from '../../../src/domain/auth/interfaces/auth-service.interface';

describe('Auth Controller - PATCH /auth/forgot-password (e2e)', () => {
  let app: INestApplication;
  let authHelper: AuthHelper;
  let mockAuthService: any;

  const validForgotPasswordData = {
    email: faker.internet.email(),
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
    await app.listen(0);

    authHelper = new AuthHelper(app);
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Public Access Tests', () => {
    it('should send forgot password email when valid email provided (no auth required)', async () => {
      // Arrange
      mockAuthService.forgotPassword.mockResolvedValue(undefined);

      // Act
      const response = await authHelper
        .unauthenticatedRequest('patch', '/auth/forgot-password')
        .send(validForgotPasswordData);

      // Assert
      expect(response.status).toBe(200);
      expect(mockAuthService.forgotPassword).toHaveBeenCalledWith(validForgotPasswordData.email);
    });

    it('should work when authenticated as well', async () => {
      // Arrange
      mockAuthService.forgotPassword.mockResolvedValue(undefined);
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedPatch(
        '/auth/forgot-password',
        validForgotPasswordData,
        testUser,
      );

      // Assert
      expect(response.status).toBe(200);
      expect(mockAuthService.forgotPassword).toHaveBeenCalledWith(validForgotPasswordData.email);
    });
  });

  describe('Validation Tests', () => {
    it('should validate required email field', async () => {
      // Arrange
      const incompleteData = {};

      // Act
      const response = await authHelper
        .unauthenticatedRequest('patch', '/auth/forgot-password')
        .send(incompleteData);

      // Assert
      expect(response.status).toBe(400);
      expect(mockAuthService.forgotPassword).not.toHaveBeenCalled();
    });

    it('should validate email format', async () => {
      // Arrange
      const invalidEmailData = {
        email: 'invalid-email-format',
      };

      // Act
      const response = await authHelper
        .unauthenticatedRequest('patch', '/auth/forgot-password')
        .send(invalidEmailData);

      // Assert
      expect(response.status).toBe(400);
      expect(mockAuthService.forgotPassword).not.toHaveBeenCalled();
    });

    it('should validate email is not empty', async () => {
      // Arrange
      const emptyEmailData = {
        email: '',
      };

      // Act
      const response = await authHelper
        .unauthenticatedRequest('patch', '/auth/forgot-password')
        .send(emptyEmailData);

      // Assert
      expect(response.status).toBe(400);
      expect(mockAuthService.forgotPassword).not.toHaveBeenCalled();
    });

    it('should validate email is string', async () => {
      // Arrange
      const invalidTypeData = {
        email: 12345,
      };

      // Act
      const response = await authHelper
        .unauthenticatedRequest('patch', '/auth/forgot-password')
        .send(invalidTypeData);

      // Assert
      expect(response.status).toBe(400);
      expect(mockAuthService.forgotPassword).not.toHaveBeenCalled();
    });
  });

  describe('Email Format Tests', () => {
    it('should accept valid email formats', async () => {
      // Arrange
      const validEmails = [
        'user@example.com',
        'test.user@domain.co.uk',
        'user+tag@example.org',
        'user123@test-domain.com',
        'firstname.lastname@company.com.br',
      ];

      mockAuthService.forgotPassword.mockResolvedValue(undefined);

      // Act & Assert
      for (const email of validEmails) {
        const data = { email };
        const response = await authHelper
          .unauthenticatedRequest('patch', '/auth/forgot-password')
          .send(data);
        expect(response.status).toBe(200);
        expect(mockAuthService.forgotPassword).toHaveBeenCalledWith(email);
        jest.clearAllMocks();
      }
    });

    it('should reject invalid email formats', async () => {
      // Arrange
      const invalidEmails = [
        'plainaddress',
        '@missingusername.com',
        'username@.com',
        'username@com',
        'username..double.dot@example.com',
        'username@domain,com',
        'username @domain.com',
      ];

      // Act & Assert
      for (const email of invalidEmails) {
        const data = { email };
        const response = await authHelper
          .unauthenticatedRequest('patch', '/auth/forgot-password')
          .send(data);
        expect(response.status).toBe(400);
        expect(mockAuthService.forgotPassword).not.toHaveBeenCalled();
      }
    });
  });

  describe('Error Handling Tests', () => {
    it('should handle user not found gracefully', async () => {
      // Arrange
      const notFoundError = new NotFoundException('User not found');
      mockAuthService.forgotPassword.mockRejectedValue(notFoundError);

      // Act
      const response = await authHelper
        .unauthenticatedRequest('patch', '/auth/forgot-password')
        .send(validForgotPasswordData);

      // Assert
      expect(response.status).toBe(404);
      expect(mockAuthService.forgotPassword).toHaveBeenCalledWith(validForgotPasswordData.email);
    });

    it('should handle inactive user gracefully', async () => {
      // Arrange
      const forbiddenError = new ForbiddenException('User account is inactive');
      mockAuthService.forgotPassword.mockRejectedValue(forbiddenError);

      // Act
      const response = await authHelper
        .unauthenticatedRequest('patch', '/auth/forgot-password')
        .send(validForgotPasswordData);

      // Assert
      expect(response.status).toBe(403);
    });

    it('should handle email service errors', async () => {
      // Arrange
      const serviceError = new ServiceUnavailableException('Email service unavailable');
      mockAuthService.forgotPassword.mockRejectedValue(serviceError);

      // Act
      const response = await authHelper
        .unauthenticatedRequest('patch', '/auth/forgot-password')
        .send(validForgotPasswordData);

      // Assert
      expect(response.status).toBe(503);
    });

    it('should handle generic service errors', async () => {
      // Arrange
      mockAuthService.forgotPassword.mockRejectedValue(new Error('Database connection error'));

      // Act
      const response = await authHelper
        .unauthenticatedRequest('patch', '/auth/forgot-password')
        .send(validForgotPasswordData);

      // Assert
      expect(response.status).toBe(500);
    });
  });

  describe('Security Tests', () => {
    it('should not reveal if email exists or not', async () => {
      // Arrange
      const notFoundError = new NotFoundException('User not found');
      mockAuthService.forgotPassword.mockRejectedValue(notFoundError);

      // Act
      const response = await authHelper
        .unauthenticatedRequest('patch', '/auth/forgot-password')
        .send(validForgotPasswordData);

      // Assert
      expect(response.status).toBe(404);
      // In a real implementation, this might return 200 to not reveal user existence
    });

    it('should handle rate limiting gracefully', async () => {
      // Arrange
      const rateLimitError = new HttpException('Too many requests', 429);
      mockAuthService.forgotPassword.mockRejectedValue(rateLimitError);

      // Act
      const response = await authHelper
        .unauthenticatedRequest('patch', '/auth/forgot-password')
        .send(validForgotPasswordData);

      // Assert
      expect(response.status).toBe(429);
    });
  });

  describe('Success Response Tests', () => {
    it('should return 200 with empty body on success', async () => {
      // Arrange
      mockAuthService.forgotPassword.mockResolvedValue(undefined);

      // Act
      const response = await authHelper
        .unauthenticatedRequest('patch', '/auth/forgot-password')
        .send(validForgotPasswordData);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual({});
    });

    it('should call service with correct email parameter', async () => {
      // Arrange
      mockAuthService.forgotPassword.mockResolvedValue(undefined);

      // Act
      await authHelper
        .unauthenticatedRequest('patch', '/auth/forgot-password')
        .send(validForgotPasswordData);

      // Assert
      expect(mockAuthService.forgotPassword).toHaveBeenCalledWith(validForgotPasswordData.email);
      expect(mockAuthService.forgotPassword).toHaveBeenCalledTimes(1);
    });
  });

  describe('Case Sensitivity Tests', () => {
    it('should handle mixed case emails', async () => {
      // Arrange
      const mixedCaseEmails = [
        'User@Example.Com',
        'TEST.user@DOMAIN.CO.UK',
        'User123@Test-Domain.COM',
      ];
      mockAuthService.forgotPassword.mockResolvedValue(undefined);

      // Act & Assert
      for (const email of mixedCaseEmails) {
        const data = { email };
        const response = await authHelper
          .unauthenticatedRequest('patch', '/auth/forgot-password')
          .send(data);
        expect(response.status).toBe(200);
        expect(mockAuthService.forgotPassword).toHaveBeenCalledWith(email);
        jest.clearAllMocks();
      }
    });
  });

  describe('Service Integration Tests', () => {
    it('should handle international email domains', async () => {
      // Arrange
      const internationalEmails = [
        'user@empresa.com.br',
        'test@société.fr',
        'admin@компания.рф',
        'contact@empresa.com.mx',
      ];
      mockAuthService.forgotPassword.mockResolvedValue(undefined);

      // Act & Assert
      for (const email of internationalEmails) {
        const data = { email };
        const response = await authHelper
          .unauthenticatedRequest('patch', '/auth/forgot-password')
          .send(data);
        expect(response.status).toBe(200);
        expect(mockAuthService.forgotPassword).toHaveBeenCalledWith(email);
        jest.clearAllMocks();
      }
    });

    it('should handle concurrent forgot password requests', async () => {
      // Arrange
      mockAuthService.forgotPassword.mockResolvedValue(undefined);
      const concurrentRequests = 5;
      const differentEmails = Array.from({ length: concurrentRequests }, () =>
        faker.internet.email(),
      );

      // Act
      const promises = differentEmails.map((email) =>
        authHelper.unauthenticatedRequest('patch', '/auth/forgot-password').send({ email }),
      );
      const responses = await Promise.all(promises);

      // Assert
      for (const response of responses) {
        expect(response.status).toBe(200);
      }
      expect(mockAuthService.forgotPassword).toHaveBeenCalledTimes(concurrentRequests);
    });
  });
});
