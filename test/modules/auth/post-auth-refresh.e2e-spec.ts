import { authGuardProvider } from '../../helpers/auth-guard.provider';
import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  ValidationPipe,
  UnauthorizedException,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { faker } from '@faker-js/faker';
import { AuthHelper, createMockServices } from '../../helpers/auth-helper';
import { AuthController } from '../../../src/domain/auth/auth.controller';
import { AuthServiceInterface } from '../../../src/domain/auth/interfaces/auth-service.interface';

describe('Auth Controller - POST /auth/refresh (e2e)', () => {
  let app: INestApplication;
  let authHelper: AuthHelper;
  let mockAuthService: any;

  const validRefreshTokenData = {
    refreshToken: faker.string.alphanumeric(64),
  };

  const mockRefreshResponse = {
    accessToken: faker.string.alphanumeric(64),
    refreshToken: faker.string.alphanumeric(64),
    expiresIn: 3600,
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
    it('should refresh token when valid refresh token provided (no auth required)', async () => {
      // Arrange
      mockAuthService.refreshToken.mockResolvedValue(mockRefreshResponse);

      // Act
      const response = await authHelper
        .unauthenticatedRequest('post', '/auth/refresh')
        .send(validRefreshTokenData);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockRefreshResponse);
      expect(mockAuthService.refreshToken).toHaveBeenCalledWith(validRefreshTokenData.refreshToken);
    });

    it('should work when authenticated as well', async () => {
      // Arrange
      mockAuthService.refreshToken.mockResolvedValue(mockRefreshResponse);
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedPost(
        '/auth/refresh',
        validRefreshTokenData,
        testUser,
      );

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockRefreshResponse);
      expect(mockAuthService.refreshToken).toHaveBeenCalledWith(validRefreshTokenData.refreshToken);
    });
  });

  describe('Validation Tests', () => {
    it('should validate required refreshToken field', async () => {
      // Arrange
      const incompleteData = {};

      // Act
      const response = await authHelper
        .unauthenticatedRequest('post', '/auth/refresh')
        .send(incompleteData);

      // Assert
      expect(response.status).toBe(400);
      expect(mockAuthService.refreshToken).not.toHaveBeenCalled();
    });

    it('should validate refreshToken is not empty', async () => {
      // Arrange
      const emptyTokenData = {
        refreshToken: '',
      };

      // Act
      const response = await authHelper
        .unauthenticatedRequest('post', '/auth/refresh')
        .send(emptyTokenData);

      // Assert
      expect(response.status).toBe(400);
      expect(mockAuthService.refreshToken).not.toHaveBeenCalled();
    });

    it('should validate refreshToken is string', async () => {
      // Arrange
      const invalidTypeData = {
        refreshToken: 12345,
      };

      // Act
      const response = await authHelper
        .unauthenticatedRequest('post', '/auth/refresh')
        .send(invalidTypeData);

      // Assert
      expect(response.status).toBe(400);
      expect(mockAuthService.refreshToken).not.toHaveBeenCalled();
    });
  });

  describe('Token Format Tests', () => {
    it('should accept various token formats', async () => {
      // Arrange
      const validTokenFormats = [
        faker.string.alphanumeric(32),
        faker.string.alphanumeric(64),
        faker.string.alphanumeric(128),
        faker.string.hexadecimal({ length: 64 }).replace('0x', ''),
        Buffer.from(faker.string.alphanumeric(32)).toString('base64'),
      ];
      mockAuthService.refreshToken.mockResolvedValue(mockRefreshResponse);

      // Act & Assert
      for (const refreshToken of validTokenFormats) {
        const data = { refreshToken };
        const response = await authHelper
          .unauthenticatedRequest('post', '/auth/refresh')
          .send(data);
        expect(response.status).toBe(200);
        expect(mockAuthService.refreshToken).toHaveBeenCalledWith(refreshToken);
        jest.clearAllMocks();
      }
    });

    it('should handle JWT-like tokens', async () => {
      // Arrange
      const jwtLikeTokens = [
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
        faker.string.alphanumeric(40) +
          '.' +
          faker.string.alphanumeric(200) +
          '.' +
          faker.string.alphanumeric(40),
      ];
      mockAuthService.refreshToken.mockResolvedValue(mockRefreshResponse);

      // Act & Assert
      for (const refreshToken of jwtLikeTokens) {
        const data = { refreshToken };
        const response = await authHelper
          .unauthenticatedRequest('post', '/auth/refresh')
          .send(data);
        expect(response.status).toBe(200);
        expect(mockAuthService.refreshToken).toHaveBeenCalledWith(refreshToken);
        jest.clearAllMocks();
      }
    });
  });

  describe('Error Handling Tests', () => {
    it('should handle invalid refresh token error', async () => {
      // Arrange
      const unauthorizedError = new UnauthorizedException('Invalid refresh token');
      mockAuthService.refreshToken.mockRejectedValue(unauthorizedError);

      // Act
      const response = await authHelper
        .unauthenticatedRequest('post', '/auth/refresh')
        .send(validRefreshTokenData);

      // Assert
      expect(response.status).toBe(401);
      expect(mockAuthService.refreshToken).toHaveBeenCalledWith(validRefreshTokenData.refreshToken);
    });

    it('should handle expired refresh token error', async () => {
      // Arrange
      const expiredError = new UnauthorizedException('Refresh token expired');
      mockAuthService.refreshToken.mockRejectedValue(expiredError);

      // Act
      const response = await authHelper
        .unauthenticatedRequest('post', '/auth/refresh')
        .send(validRefreshTokenData);

      // Assert
      expect(response.status).toBe(401);
    });

    it('should handle revoked refresh token error', async () => {
      // Arrange
      const revokedError = new ForbiddenException('Refresh token revoked');
      mockAuthService.refreshToken.mockRejectedValue(revokedError);

      // Act
      const response = await authHelper
        .unauthenticatedRequest('post', '/auth/refresh')
        .send(validRefreshTokenData);

      // Assert
      expect(response.status).toBe(403);
    });

    it('should handle user not found error', async () => {
      // Arrange
      const notFoundError = new NotFoundException('User not found');
      mockAuthService.refreshToken.mockRejectedValue(notFoundError);

      // Act
      const response = await authHelper
        .unauthenticatedRequest('post', '/auth/refresh')
        .send(validRefreshTokenData);

      // Assert
      expect(response.status).toBe(404);
    });

    it('should handle generic service errors', async () => {
      // Arrange
      mockAuthService.refreshToken.mockRejectedValue(new Error('Database connection error'));

      // Act
      const response = await authHelper
        .unauthenticatedRequest('post', '/auth/refresh')
        .send(validRefreshTokenData);

      // Assert
      expect(response.status).toBe(500);
    });
  });

  describe('Response Structure Tests', () => {
    it('should return refresh response with correct structure', async () => {
      // Arrange
      mockAuthService.refreshToken.mockResolvedValue(mockRefreshResponse);

      // Act
      const response = await authHelper
        .unauthenticatedRequest('post', '/auth/refresh')
        .send(validRefreshTokenData);

      // Assert
      expect(response.body).toMatchObject({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
        expiresIn: expect.any(Number),
      });
    });

    it('should return new tokens different from input', async () => {
      // Arrange
      const newTokens = {
        accessToken: faker.string.alphanumeric(64),
        refreshToken: faker.string.alphanumeric(64),
        expiresIn: 7200,
      };
      mockAuthService.refreshToken.mockResolvedValue(newTokens);

      // Act
      const response = await authHelper
        .unauthenticatedRequest('post', '/auth/refresh')
        .send(validRefreshTokenData);

      // Assert
      expect(response.body.refreshToken).not.toBe(validRefreshTokenData.refreshToken);
      expect(response.body.accessToken).toBeTruthy();
      expect(response.body.expiresIn).toBe(7200);
    });
  });

  describe('Security Tests', () => {
    it('should handle malformed tokens gracefully', async () => {
      // Arrange
      const malformedTokens = [
        'malformed.token',
        'invalid-base64-token!@#$%',
        'token with spaces',
        'token\nwith\nnewlines',
      ];

      for (const refreshToken of malformedTokens) {
        // Arrange
        const validationError = new BadRequestException('Invalid token format');
        mockAuthService.refreshToken.mockRejectedValue(validationError);

        // Act
        const response = await authHelper
          .unauthenticatedRequest('post', '/auth/refresh')
          .send({ refreshToken });

        // Assert
        expect(response.status).toBe(400);
        jest.clearAllMocks();
      }
    });

    it('should handle very long tokens', async () => {
      // Arrange
      const veryLongToken = 'a'.repeat(10000);
      mockAuthService.refreshToken.mockResolvedValue(mockRefreshResponse);

      // Act
      const response = await authHelper
        .unauthenticatedRequest('post', '/auth/refresh')
        .send({ refreshToken: veryLongToken });

      // Assert
      expect(response.status).toBe(200);
      expect(mockAuthService.refreshToken).toHaveBeenCalledWith(veryLongToken);
    });
  });

  describe('Service Integration Tests', () => {
    it('should call service with exact token parameter', async () => {
      // Arrange
      mockAuthService.refreshToken.mockResolvedValue(mockRefreshResponse);

      // Act
      await authHelper.unauthenticatedRequest('post', '/auth/refresh').send(validRefreshTokenData);

      // Assert
      expect(mockAuthService.refreshToken).toHaveBeenCalledWith(validRefreshTokenData.refreshToken);
      expect(mockAuthService.refreshToken).toHaveBeenCalledTimes(1);
    });

    it('should handle concurrent refresh requests', async () => {
      // Arrange
      mockAuthService.refreshToken.mockResolvedValue(mockRefreshResponse);
      const concurrentRequests = 3;
      const differentTokens = Array.from({ length: concurrentRequests }, () => ({
        refreshToken: faker.string.alphanumeric(64),
      }));

      // Act
      const promises = differentTokens.map((data) =>
        authHelper.unauthenticatedRequest('post', '/auth/refresh').send(data),
      );
      const responses = await Promise.all(promises);

      // Assert
      for (const response of responses) {
        expect(response.status).toBe(200);
      }
      expect(mockAuthService.refreshToken).toHaveBeenCalledTimes(concurrentRequests);
    });

    it('should pass through service response unchanged', async () => {
      // Arrange
      const customResponse = {
        accessToken: 'custom-access-token',
        refreshToken: 'custom-refresh-token',
        expiresIn: 1800,
        customField: 'customValue',
      };
      mockAuthService.refreshToken.mockResolvedValue(customResponse);

      // Act
      const response = await authHelper
        .unauthenticatedRequest('post', '/auth/refresh')
        .send(validRefreshTokenData);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual(customResponse);
    });
  });
});
