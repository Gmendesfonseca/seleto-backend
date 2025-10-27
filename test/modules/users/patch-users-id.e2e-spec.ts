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

describe('Users Controller - PATCH /users/:id (e2e)', () => {
  let app: INestApplication;
  let authHelper: AuthHelper;
  let mockUsersService: any;

  const userId = faker.string.uuid();
  const validPatchUserData = {
    username: faker.internet.username(),
    isVerified: false,
  };

  const mockPatchResponse = {
    id: userId,
    username: validPatchUserData.username,
    email: faker.internet.email(),
    status: 'ACTIVE',
    type: 'PERSON',
    isVerified: validPatchUserData.isVerified,
    createdAt: faker.date.past().toISOString(),
    updatedAt: faker.date.recent().toISOString(),
  };

  beforeAll(async () => {
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
    it('should patch user when authenticated', async () => {
      // Arrange
      mockUsersService.updateUser.mockResolvedValue(mockPatchResponse);
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedPatch(
        `/users/${userId}`,
        validPatchUserData,
        testUser,
      );

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockPatchResponse);
      expect(mockUsersService.updateUser).toHaveBeenCalledWith(userId, validPatchUserData);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await authHelper
        .unauthenticatedRequest('patch', `/users/${userId}`)
        .send(validPatchUserData);
      expectUnauthorizedResponse(response);
      expect(mockUsersService.updateUser).not.toHaveBeenCalled();
    });

    it('should return 401 with invalid token', async () => {
      const response = await authHelper
        .invalidTokenRequest('patch', `/users/${userId}`)
        .send(validPatchUserData);
      expectUnauthorizedResponse(response);
      expect(mockUsersService.updateUser).not.toHaveBeenCalled();
    });

    it('should return 401 with expired token', async () => {
      const response = await authHelper
        .expiredTokenRequest('patch', `/users/${userId}`)
        .send(validPatchUserData);
      expectUnauthorizedResponse(response);
      expect(mockUsersService.updateUser).not.toHaveBeenCalled();
    });
  });

  describe('Validation Tests', () => {
    it('should validate UUID format for user ID', async () => {
      // Arrange
      const invalidId = 'not-a-uuid';
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedPatch(
        `/users/${invalidId}`,
        validPatchUserData,
        testUser,
      );

      // Assert
      expect(response.status).toBe(400);
      expect(mockUsersService.updateUser).not.toHaveBeenCalled();
    });

    it('should accept empty patch data', async () => {
      // Arrange
      const emptyPatchData = {};
      mockUsersService.updateUser.mockResolvedValue(mockPatchResponse);
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedPatch(
        `/users/${userId}`,
        emptyPatchData,
        testUser,
      );

      // Assert
      expect(response.status).toBe(200);
      expect(mockUsersService.updateUser).toHaveBeenCalledWith(userId, emptyPatchData);
    });

    it('should validate individual fields when provided', async () => {
      // Arrange
      const invalidPatchData = {
        email: 'invalid-email-format',
      };
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedPatch(
        `/users/${userId}`,
        invalidPatchData,
        testUser,
      );

      // Assert
      expect(response.status).toBe(400);
      expect(mockUsersService.updateUser).not.toHaveBeenCalled();
    });
  });

  describe('Partial Update Tests', () => {
    it('should update only username', async () => {
      // Arrange
      const usernameOnlyPatch = { username: faker.internet.username() };
      const responseWithNewUsername = { ...mockPatchResponse, ...usernameOnlyPatch };
      mockUsersService.updateUser.mockResolvedValue(responseWithNewUsername);
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedPatch(
        `/users/${userId}`,
        usernameOnlyPatch,
        testUser,
      );

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.username).toBe(usernameOnlyPatch.username);
      expect(mockUsersService.updateUser).toHaveBeenCalledWith(userId, usernameOnlyPatch);
    });

    it('should update only email', async () => {
      // Arrange
      const emailOnlyPatch = { email: faker.internet.email() };
      const responseWithNewEmail = { ...mockPatchResponse, ...emailOnlyPatch };
      mockUsersService.updateUser.mockResolvedValue(responseWithNewEmail);
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedPatch(
        `/users/${userId}`,
        emailOnlyPatch,
        testUser,
      );

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.email).toBe(emailOnlyPatch.email);
    });

    it('should update only status', async () => {
      // Arrange
      const statusOnlyPatch = { status: 'INACTIVE' };
      const responseWithNewStatus = { ...mockPatchResponse, ...statusOnlyPatch };
      mockUsersService.updateUser.mockResolvedValue(responseWithNewStatus);
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedPatch(
        `/users/${userId}`,
        statusOnlyPatch,
        testUser,
      );

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.status).toBe(statusOnlyPatch.status);
    });

    it('should update only isVerified flag', async () => {
      // Arrange
      const verifiedOnlyPatch = { isVerified: true };
      const responseWithNewVerified = { ...mockPatchResponse, ...verifiedOnlyPatch };
      mockUsersService.updateUser.mockResolvedValue(responseWithNewVerified);
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedPatch(
        `/users/${userId}`,
        verifiedOnlyPatch,
        testUser,
      );

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.isVerified).toBe(verifiedOnlyPatch.isVerified);
    });
  });

  describe('User Context Tests', () => {
    it('should work with person user', async () => {
      // Arrange
      mockUsersService.updateUser.mockResolvedValue(mockPatchResponse);
      const personUser = authHelper.createPersonUser();

      // Act
      const { response } = await authHelper.authenticatedPatch(
        `/users/${userId}`,
        validPatchUserData,
        personUser,
      );

      // Assert
      expect(response.status).toBe(200);
      expect(mockUsersService.updateUser).toHaveBeenCalled();
    });

    it('should work with company user', async () => {
      // Arrange
      mockUsersService.updateUser.mockResolvedValue(mockPatchResponse);
      const companyUser = authHelper.createCompanyUser();

      // Act
      const { response } = await authHelper.authenticatedPatch(
        `/users/${userId}`,
        validPatchUserData,
        companyUser,
      );

      // Assert
      expect(response.status).toBe(200);
      expect(mockUsersService.updateUser).toHaveBeenCalled();
    });
  });

  describe('Error Handling Tests', () => {
    it('should handle NotFoundException when user not found', async () => {
      // Arrange
      const notFoundError = new Error('User not found');
      notFoundError.name = 'NotFoundException';
      mockUsersService.updateUser.mockRejectedValue(notFoundError);
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedPatch(
        `/users/${userId}`,
        validPatchUserData,
        testUser,
      );

      // Assert
      expect(response.status).toBe(404);
    });

    it('should handle generic service errors as BadRequestException', async () => {
      // Arrange
      mockUsersService.updateUser.mockRejectedValue(new Error('Database error'));
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedPatch(
        `/users/${userId}`,
        validPatchUserData,
        testUser,
      );

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Failed to update user');
    });

    it('should handle validation errors gracefully', async () => {
      // Arrange
      const validationError = new Error('Validation failed');
      validationError.name = 'ValidationException';
      mockUsersService.updateUser.mockRejectedValue(validationError);
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedPatch(
        `/users/${userId}`,
        validPatchUserData,
        testUser,
      );

      // Assert
      expect(response.status).toBe(400);
    });
  });

  describe('PATCH vs PUT Behavior Tests', () => {
    it('should allow partial updates without overwriting unspecified fields', async () => {
      // Arrange
      const partialPatch = { username: 'new-username' };
      const existingUserData = {
        id: userId,
        username: 'old-username',
        email: 'existing@example.com',
        status: 'ACTIVE',
        type: 'PERSON',
        isVerified: true,
      };
      const expectedResult = { ...existingUserData, ...partialPatch };
      mockUsersService.updateUser.mockResolvedValue(expectedResult);
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedPatch(
        `/users/${userId}`,
        partialPatch,
        testUser,
      );

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.username).toBe(partialPatch.username);
      expect(response.body.email).toBe(existingUserData.email); // Should remain unchanged
      expect(response.body.status).toBe(existingUserData.status); // Should remain unchanged
    });

    it('should handle null values in patch data', async () => {
      // Arrange
      const nullValuePatch = { isVerified: null };
      mockUsersService.updateUser.mockResolvedValue({ ...mockPatchResponse, isVerified: null });
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedPatch(
        `/users/${userId}`,
        nullValuePatch,
        testUser,
      );

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.isVerified).toBeNull();
    });
  });

  describe('Response Structure Tests', () => {
    it('should return updated user data with correct structure', async () => {
      // Arrange
      mockUsersService.updateUser.mockResolvedValue(mockPatchResponse);
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedPatch(
        `/users/${userId}`,
        validPatchUserData,
        testUser,
      );

      // Assert
      expect(response.body).toMatchObject({
        id: expect.any(String),
        username: expect.any(String),
        email: expect.any(String),
        status: expect.any(String),
        type: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });

    it('should not return sensitive data', async () => {
      // Arrange
      const userWithPassword = { ...mockPatchResponse, password: 'secret123' };
      mockUsersService.updateUser.mockResolvedValue(userWithPassword);
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedPatch(
        `/users/${userId}`,
        validPatchUserData,
        testUser,
      );

      // Assert
      expect(response.body).not.toHaveProperty('password');
    });
  });
});
