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

describe('Users Controller - PUT /users/:id (e2e)', () => {
  let app: INestApplication;
  let authHelper: AuthHelper;
  let mockUsersService: any;

  const userId = faker.string.uuid();
  const validUpdateUserData = {
    username: faker.internet.username(),
    email: faker.internet.email(),
    status: 'ACTIVE',
    isVerified: true,
  };

  const mockUpdateResponse = {
    id: userId,
    ...validUpdateUserData,
    type: 'PERSON',
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
    it('should update user when authenticated', async () => {
      // Arrange
      mockUsersService.updateUser.mockResolvedValue(mockUpdateResponse);
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedPut(
        `/users/${userId}`,
        validUpdateUserData,
        testUser,
      );

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUpdateResponse);
      expect(mockUsersService.updateUser).toHaveBeenCalledWith(userId, validUpdateUserData);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await authHelper
        .unauthenticatedRequest('put', `/users/${userId}`)
        .send(validUpdateUserData);
      expectUnauthorizedResponse(response);
      expect(mockUsersService.updateUser).not.toHaveBeenCalled();
    });

    it('should return 401 with invalid token', async () => {
      const response = await authHelper
        .invalidTokenRequest('put', `/users/${userId}`)
        .send(validUpdateUserData);
      expectUnauthorizedResponse(response);
      expect(mockUsersService.updateUser).not.toHaveBeenCalled();
    });

    it('should return 401 with expired token', async () => {
      const response = await authHelper
        .expiredTokenRequest('put', `/users/${userId}`)
        .send(validUpdateUserData);
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
      const { response } = await authHelper.authenticatedPut(
        `/users/${invalidId}`,
        validUpdateUserData,
        testUser,
      );

      // Assert
      expect(response.status).toBe(400);
      expect(mockUsersService.updateUser).not.toHaveBeenCalled();
    });

    it('should validate email format when provided', async () => {
      // Arrange
      const invalidEmailData = {
        ...validUpdateUserData,
        email: 'invalid-email-format',
      };
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedPut(
        `/users/${userId}`,
        invalidEmailData,
        testUser,
      );

      // Assert
      expect(response.status).toBe(400);
      expect(mockUsersService.updateUser).not.toHaveBeenCalled();
    });

    it('should validate username format when provided', async () => {
      // Arrange
      const invalidUsernameData = {
        ...validUpdateUserData,
        username: 'ab', // Too short
      };
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedPut(
        `/users/${userId}`,
        invalidUsernameData,
        testUser,
      );

      // Assert
      expect(response.status).toBe(400);
      expect(mockUsersService.updateUser).not.toHaveBeenCalled();
    });

    it('should validate status enum values when provided', async () => {
      // Arrange
      const invalidStatusData = {
        ...validUpdateUserData,
        status: 'INVALID_STATUS',
      };
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedPut(
        `/users/${userId}`,
        invalidStatusData,
        testUser,
      );

      // Assert
      expect(response.status).toBe(400);
      expect(mockUsersService.updateUser).not.toHaveBeenCalled();
    });

    it('should accept partial updates', async () => {
      // Arrange
      const partialUpdateData = {
        username: faker.internet.username(),
      };
      mockUsersService.updateUser.mockResolvedValue(mockUpdateResponse);
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedPut(
        `/users/${userId}`,
        partialUpdateData,
        testUser,
      );

      // Assert
      expect(response.status).toBe(200);
      expect(mockUsersService.updateUser).toHaveBeenCalledWith(userId, partialUpdateData);
    });
  });

  describe('User Context Tests', () => {
    it('should work with person user', async () => {
      // Arrange
      mockUsersService.updateUser.mockResolvedValue(mockUpdateResponse);
      const personUser = authHelper.createPersonUser();

      // Act
      const { response } = await authHelper.authenticatedPut(
        `/users/${userId}`,
        validUpdateUserData,
        personUser,
      );

      // Assert
      expect(response.status).toBe(200);
      expect(mockUsersService.updateUser).toHaveBeenCalled();
    });

    it('should work with company user', async () => {
      // Arrange
      mockUsersService.updateUser.mockResolvedValue(mockUpdateResponse);
      const companyUser = authHelper.createCompanyUser();

      // Act
      const { response } = await authHelper.authenticatedPut(
        `/users/${userId}`,
        validUpdateUserData,
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
      const { response } = await authHelper.authenticatedPut(
        `/users/${userId}`,
        validUpdateUserData,
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
      const { response } = await authHelper.authenticatedPut(
        `/users/${userId}`,
        validUpdateUserData,
        testUser,
      );

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Failed to update user');
    });

    it('should handle constraint violations', async () => {
      // Arrange
      const constraintError = new Error('Username already exists');
      constraintError.name = 'ConflictException';
      mockUsersService.updateUser.mockRejectedValue(constraintError);
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedPut(
        `/users/${userId}`,
        validUpdateUserData,
        testUser,
      );

      // Assert
      expect(response.status).toBe(400);
    });
  });

  describe('Update Fields Tests', () => {
    it('should update username field', async () => {
      // Arrange
      const usernameUpdate = { username: faker.internet.username() };
      mockUsersService.updateUser.mockResolvedValue({ ...mockUpdateResponse, ...usernameUpdate });
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedPut(
        `/users/${userId}`,
        usernameUpdate,
        testUser,
      );

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.username).toBe(usernameUpdate.username);
    });

    it('should update email field', async () => {
      // Arrange
      const emailUpdate = { email: faker.internet.email() };
      mockUsersService.updateUser.mockResolvedValue({ ...mockUpdateResponse, ...emailUpdate });
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedPut(
        `/users/${userId}`,
        emailUpdate,
        testUser,
      );

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.email).toBe(emailUpdate.email);
    });

    it('should update status field', async () => {
      // Arrange
      const statusUpdate = { status: 'INACTIVE' };
      mockUsersService.updateUser.mockResolvedValue({ ...mockUpdateResponse, ...statusUpdate });
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedPut(
        `/users/${userId}`,
        statusUpdate,
        testUser,
      );

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.status).toBe(statusUpdate.status);
    });

    it('should update isVerified field', async () => {
      // Arrange
      const verificationUpdate = { isVerified: false };
      mockUsersService.updateUser.mockResolvedValue({
        ...mockUpdateResponse,
        ...verificationUpdate,
      });
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedPut(
        `/users/${userId}`,
        verificationUpdate,
        testUser,
      );

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.isVerified).toBe(verificationUpdate.isVerified);
    });

    it('should update multiple fields simultaneously', async () => {
      // Arrange
      const multipleFieldsUpdate = {
        username: faker.internet.username(),
        status: 'INACTIVE',
        isVerified: false,
      };
      mockUsersService.updateUser.mockResolvedValue({
        ...mockUpdateResponse,
        ...multipleFieldsUpdate,
      });
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedPut(
        `/users/${userId}`,
        multipleFieldsUpdate,
        testUser,
      );

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.username).toBe(multipleFieldsUpdate.username);
      expect(response.body.status).toBe(multipleFieldsUpdate.status);
      expect(response.body.isVerified).toBe(multipleFieldsUpdate.isVerified);
    });
  });

  describe('Response Structure Tests', () => {
    it('should return updated user data with correct structure', async () => {
      // Arrange
      mockUsersService.updateUser.mockResolvedValue(mockUpdateResponse);
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedPut(
        `/users/${userId}`,
        validUpdateUserData,
        testUser,
      );

      // Assert
      expect(response.body).toMatchObject({
        id: expect.any(String),
        username: expect.any(String),
        email: expect.any(String),
        status: expect.any(String),
        type: expect.any(String),
        isVerified: expect.any(Boolean),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });

    it('should not return sensitive data', async () => {
      // Arrange
      const userWithPassword = { ...mockUpdateResponse, password: 'secret123' };
      mockUsersService.updateUser.mockResolvedValue(userWithPassword);
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedPut(
        `/users/${userId}`,
        validUpdateUserData,
        testUser,
      );

      // Assert
      expect(response.body).not.toHaveProperty('password');
    });
  });
});
