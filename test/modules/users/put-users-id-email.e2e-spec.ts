import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { faker } from '@faker-js/faker';
import { AuthHelper, expectUnauthorizedResponse } from '../../helpers/auth-helper';
import { UsersController } from '../../../src/domain/users/users.controller';
import { UsersServiceInterface } from '../../../src/domain/users/interfaces/user.service.interface';
import { authGuardProvider } from '../../helpers/auth-guard.provider';
import { createUsersServiceMock, signedRequest } from '../../helpers/e2e-users-mocks';

describe('Users Controller - PUT /users/:id/email (e2e)', () => {
  let app: INestApplication;
  let authHelper: AuthHelper;
  let mockUsersService: any;

  const userId = faker.string.uuid();
  const validEmailUpdateData = {
    email: faker.internet.email(),
    secret: faker.string.alphanumeric(32),
  };

  beforeAll(async () => {
    mockUsersService = createUsersServiceMock();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: 'test-secret',
          signOptions: { expiresIn: '1h' },
        }),
      ],
      controllers: [UsersController],
      providers: [
        authGuardProvider,
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
    it('should return 401 when not authenticated', async () => {
      const response = await authHelper.unauthenticatedRequest('put', `/users/${userId}/email`);
      expectUnauthorizedResponse(response);
      expect(mockUsersService.changeEmail).not.toHaveBeenCalled();
    });

    it('should update email when valid data provided', async () => {
      // Arrange
      mockUsersService.changeEmail.mockResolvedValue(undefined);

      // Act
      const response = await signedRequest(authHelper, 'put', `/users/${userId}/email`).send(
        validEmailUpdateData,
      );

      // Assert
      expect(response.status).toBe(204);
      expect(mockUsersService.changeEmail).toHaveBeenCalledWith({
        id: userId,
        email: validEmailUpdateData.email,
        secret: validEmailUpdateData.secret,
      });
    });

    it('should work when authenticated as well', async () => {
      // Arrange
      mockUsersService.changeEmail.mockResolvedValue(undefined);
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedPut(
        `/users/${userId}/email`,
        validEmailUpdateData,
        testUser,
      );

      // Assert
      expect(response.status).toBe(204);
      expect(mockUsersService.changeEmail).toHaveBeenCalled();
    });
  });

  describe('Validation Tests', () => {
    it('should validate UUID format for user ID', async () => {
      // Arrange
      const invalidId = 'not-a-uuid';

      // Act
      const response = await signedRequest(authHelper, 'put', `/users/${invalidId}/email`).send(
        validEmailUpdateData,
      );

      // Assert
      expect(response.status).toBe(400);
      expect(mockUsersService.changeEmail).not.toHaveBeenCalled();
    });

    it('should validate required email field', async () => {
      // Arrange
      const incompleteData = {
        secret: validEmailUpdateData.secret,
        // Missing email
      };

      // Act
      const response = await signedRequest(authHelper, 'put', `/users/${userId}/email`).send(
        incompleteData,
      );

      // Assert
      expect(response.status).toBe(400);
      expect(mockUsersService.changeEmail).not.toHaveBeenCalled();
    });

    it('should validate required secret field', async () => {
      // Arrange
      const incompleteData = {
        email: validEmailUpdateData.email,
        // Missing secret
      };

      // Act
      const response = await signedRequest(authHelper, 'put', `/users/${userId}/email`).send(
        incompleteData,
      );

      // Assert
      expect(response.status).toBe(400);
      expect(mockUsersService.changeEmail).not.toHaveBeenCalled();
    });

    it('should validate email format', async () => {
      // Arrange
      const invalidEmailData = {
        email: 'invalid-email-format',
        secret: validEmailUpdateData.secret,
      };

      // Act
      const response = await signedRequest(authHelper, 'put', `/users/${userId}/email`).send(
        invalidEmailData,
      );

      // Assert
      expect(response.status).toBe(400);
      expect(mockUsersService.changeEmail).not.toHaveBeenCalled();
    });

    it('should reject a non-string secret', async () => {
      // Act
      const response = await signedRequest(authHelper, 'put', `/users/${userId}/email`).send({
        email: validEmailUpdateData.email,
        secret: 123,
      });

      // Assert
      expect(response.status).toBe(400);
      expect(mockUsersService.changeEmail).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling Tests', () => {
    it('should return 404 when user not found', async () => {
      // Arrange
      const notFoundError = new Error('User not found');
      notFoundError.name = 'NotFoundException';
      mockUsersService.changeEmail.mockRejectedValue(notFoundError);

      // Act
      const response = await signedRequest(authHelper, 'put', `/users/${userId}/email`).send(
        validEmailUpdateData,
      );

      // Assert
      expect(response.status).toBe(404);
      expect(mockUsersService.changeEmail).toHaveBeenCalled();
    });

    it('should return 404 on generic service errors', async () => {
      // Arrange
      mockUsersService.changeEmail.mockRejectedValue(new Error('Database error'));

      // Act
      const response = await signedRequest(authHelper, 'put', `/users/${userId}/email`).send(
        validEmailUpdateData,
      );

      // Assert
      expect(response.status).toBe(404);
    });

    it('should handle invalid secret errors', async () => {
      // Arrange
      const invalidSecretError = new Error('Invalid secret');
      invalidSecretError.name = 'UnauthorizedException';
      mockUsersService.changeEmail.mockRejectedValue(invalidSecretError);

      // Act
      const response = await signedRequest(authHelper, 'put', `/users/${userId}/email`).send(
        validEmailUpdateData,
      );

      // Assert
      expect(response.status).toBe(404);
    });

    it('should handle expired secret errors', async () => {
      // Arrange
      const expiredSecretError = new Error('Secret expired');
      expiredSecretError.name = 'BadRequestException';
      mockUsersService.changeEmail.mockRejectedValue(expiredSecretError);

      // Act
      const response = await signedRequest(authHelper, 'put', `/users/${userId}/email`).send(
        validEmailUpdateData,
      );

      // Assert
      expect(response.status).toBe(404);
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
      ];

      mockUsersService.changeEmail.mockResolvedValue(undefined);

      // Act & Assert
      for (const email of validEmails) {
        const data = { ...validEmailUpdateData, email };
        const response = await signedRequest(authHelper, 'put', `/users/${userId}/email`).send(
          data,
        );
        expect(response.status).toBe(204);
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
      ];

      // Act & Assert
      for (const email of invalidEmails) {
        const data = { ...validEmailUpdateData, email };
        const response = await signedRequest(authHelper, 'put', `/users/${userId}/email`).send(
          data,
        );
        expect(response.status).toBe(400);
      }
    });
  });

  describe('Success Response Tests', () => {
    it('should return 204 with empty body on success', async () => {
      // Arrange
      mockUsersService.changeEmail.mockResolvedValue(undefined);

      // Act
      const response = await signedRequest(authHelper, 'put', `/users/${userId}/email`).send(
        validEmailUpdateData,
      );

      // Assert
      expect(response.status).toBe(204);
      expect(response.body).toEqual({});
    });

    it('should call service with correct parameters', async () => {
      // Arrange
      mockUsersService.changeEmail.mockResolvedValue(undefined);

      // Act
      await signedRequest(authHelper, 'put', `/users/${userId}/email`).send(validEmailUpdateData);

      // Assert
      expect(mockUsersService.changeEmail).toHaveBeenCalledWith({
        id: userId,
        email: validEmailUpdateData.email,
        secret: validEmailUpdateData.secret,
      });
    });
  });

  describe('Security Tests', () => {
    it('should handle various secret formats', async () => {
      // Arrange
      const validSecrets = [
        faker.string.alphanumeric(32),
        faker.string.alphanumeric(64),
        faker.string.hexadecimal({ length: 32 }).replace('0x', ''),
      ];

      mockUsersService.changeEmail.mockResolvedValue(undefined);

      // Act & Assert
      for (const secret of validSecrets) {
        const data = { ...validEmailUpdateData, secret };
        const response = await signedRequest(authHelper, 'put', `/users/${userId}/email`).send(
          data,
        );
        expect(response.status).toBe(204);
        jest.clearAllMocks();
      }
    });

    it('should not expose sensitive information in error messages', async () => {
      // Arrange
      mockUsersService.changeEmail.mockRejectedValue(new Error('Internal error'));

      // Act
      const response = await signedRequest(authHelper, 'put', `/users/${userId}/email`).send(
        validEmailUpdateData,
      );

      // Assert
      expect(response.status).toBe(404);
      expect(response.body).not.toHaveProperty('secret');
      expect(response.body).not.toHaveProperty('stack');
    });
  });
});
