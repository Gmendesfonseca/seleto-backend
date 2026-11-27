import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { faker } from '@faker-js/faker';
import { AuthHelper, expectUnauthorizedResponse } from '../../helpers/auth-helper';
import { UsersController } from '../../../src/domain/users/users.controller';
import { UsersServiceInterface } from '../../../src/domain/users/interfaces/user.service.interface';
import { authGuardProvider } from '../../helpers/auth-guard.provider';
import { createUsersServiceMock, signedRequest } from '../../helpers/e2e-users-mocks';

describe('Users Controller - PUT /users/:id/username (e2e)', () => {
  let app: INestApplication;
  let authHelper: AuthHelper;
  let mockUsersService: any;

  const userId = faker.string.uuid();
  const validUsernameUpdateData = {
    username: faker.internet.username(),
  };

  const mockUpdateResponse = {
    id: userId,
    username: validUsernameUpdateData.username,
    email: faker.internet.email(),
    status: 'ACTIVE',
    type: 'PERSON',
    isVerified: true,
    updatedAt: faker.date.recent().toISOString(),
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
    await app.listen(0);

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
      const response = await authHelper.unauthenticatedRequest('put', `/users/${userId}/username`);
      expectUnauthorizedResponse(response);
      expect(mockUsersService.updateUsername).not.toHaveBeenCalled();
    });

    it('should update username when valid data provided', async () => {
      // Arrange
      mockUsersService.updateUsername.mockResolvedValue(mockUpdateResponse);

      // Act
      const response = await signedRequest(authHelper, 'put', `/users/${userId}/username`).send(
        validUsernameUpdateData,
      );

      // Assert
      expect(response.status).toBe(204);
      expect(mockUsersService.updateUsername).toHaveBeenCalledWith({
        id: userId,
        username: validUsernameUpdateData.username,
      });
    });

    it('should work when authenticated as well', async () => {
      // Arrange
      mockUsersService.updateUsername.mockResolvedValue(mockUpdateResponse);
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedPut(
        `/users/${userId}/username`,
        validUsernameUpdateData,
        testUser,
      );

      // Assert
      expect(response.status).toBe(204);
      expect(mockUsersService.updateUsername).toHaveBeenCalled();
    });
  });

  describe('Validation Tests', () => {
    it('should validate UUID format for user ID', async () => {
      // Arrange
      const invalidId = 'not-a-uuid';

      // Act
      const response = await signedRequest(authHelper, 'put', `/users/${invalidId}/username`).send(
        validUsernameUpdateData,
      );

      // Assert
      expect(response.status).toBe(400);
      expect(mockUsersService.updateUsername).not.toHaveBeenCalled();
    });

    it('should validate required username field', async () => {
      // Arrange
      const incompleteData = {};

      // Act
      const response = await signedRequest(authHelper, 'put', `/users/${userId}/username`).send(
        incompleteData,
      );

      // Assert
      expect(response.status).toBe(400);
      expect(mockUsersService.updateUsername).not.toHaveBeenCalled();
    });

    it('should reject a non-string username', async () => {
      // Act
      const response = await signedRequest(authHelper, 'put', `/users/${userId}/username`).send({
        username: 12345,
      });

      // Assert
      expect(response.status).toBe(400);
      expect(mockUsersService.updateUsername).not.toHaveBeenCalled();
    });
  });

  describe('Username Format Tests', () => {
    it('should accept valid username formats', async () => {
      // Arrange
      const validUsernames = [
        'john_doe',
        'johndoe123',
        'john.doe',
        'JohnDoe',
        'john-doe',
        'user123',
      ];

      mockUsersService.updateUsername.mockResolvedValue(mockUpdateResponse);

      // Act & Assert
      for (const username of validUsernames) {
        const data = { username };
        const response = await signedRequest(authHelper, 'put', `/users/${userId}/username`).send(
          data,
        );
        expect(response.status).toBe(204);
        jest.clearAllMocks();
      }
    });

    it('should leave format and length rules to the service', async () => {
      // Arrange
      mockUsersService.updateUsername.mockResolvedValue(undefined);
      const unusualUsernames = ['ab', 'user@name', 'user name', '123username'];

      // Act & Assert
      for (const username of unusualUsernames) {
        const response = await signedRequest(authHelper, 'put', `/users/${userId}/username`).send({
          username,
        });
        expect(response.status).toBe(204);
        expect(mockUsersService.updateUsername).toHaveBeenLastCalledWith({ id: userId, username });
      }
    });
  });

  describe('Error Handling Tests', () => {
    it('should return 404 when user not found', async () => {
      // Arrange
      const notFoundError = new Error('User not found');
      notFoundError.name = 'NotFoundException';
      mockUsersService.updateUsername.mockRejectedValue(notFoundError);

      // Act
      const response = await signedRequest(authHelper, 'put', `/users/${userId}/username`).send(
        validUsernameUpdateData,
      );

      // Assert
      expect(response.status).toBe(404);
      expect(mockUsersService.updateUsername).toHaveBeenCalled();
    });

    it('should return 404 on generic service errors', async () => {
      // Arrange
      mockUsersService.updateUsername.mockRejectedValue(new Error('Database error'));

      // Act
      const response = await signedRequest(authHelper, 'put', `/users/${userId}/username`).send(
        validUsernameUpdateData,
      );

      // Assert
      expect(response.status).toBe(404);
    });

    it('should handle username already exists error', async () => {
      // Arrange
      const conflictError = new Error('Username already exists');
      conflictError.name = 'ConflictException';
      mockUsersService.updateUsername.mockRejectedValue(conflictError);

      // Act
      const response = await signedRequest(authHelper, 'put', `/users/${userId}/username`).send(
        validUsernameUpdateData,
      );

      // Assert
      expect(response.status).toBe(404);
    });
  });

  describe('Success Response Tests', () => {
    it('should return 204 with empty body on success', async () => {
      // Arrange
      mockUsersService.updateUsername.mockResolvedValue(mockUpdateResponse);

      // Act
      const response = await signedRequest(authHelper, 'put', `/users/${userId}/username`).send(
        validUsernameUpdateData,
      );

      // Assert
      expect(response.status).toBe(204);
      expect(response.body).toEqual({});
    });

    it('should call service with correct parameters', async () => {
      // Arrange
      mockUsersService.updateUsername.mockResolvedValue(mockUpdateResponse);

      // Act
      await signedRequest(authHelper, 'put', `/users/${userId}/username`).send(
        validUsernameUpdateData,
      );

      // Assert
      expect(mockUsersService.updateUsername).toHaveBeenCalledWith({
        id: userId,
        username: validUsernameUpdateData.username,
      });
    });
  });

  describe('Case Sensitivity Tests', () => {
    it('should handle mixed case usernames', async () => {
      // Arrange
      const mixedCaseData = {
        username: 'JohnDoe123',
      };
      mockUsersService.updateUsername.mockResolvedValue(mockUpdateResponse);

      // Act
      const response = await signedRequest(authHelper, 'put', `/users/${userId}/username`).send(
        mixedCaseData,
      );

      // Assert
      expect(response.status).toBe(204);
      expect(mockUsersService.updateUsername).toHaveBeenCalledWith({
        id: userId,
        username: mixedCaseData.username,
      });
    });
  });

  describe('Concurrency Tests', () => {
    it('should handle concurrent username updates', async () => {
      // Arrange
      mockUsersService.updateUsername.mockResolvedValue(mockUpdateResponse);
      const concurrentRequests = 5;
      const differentUserIds = Array.from({ length: concurrentRequests }, () =>
        faker.string.uuid(),
      );

      // Act
      const promises = differentUserIds.map((id) =>
        signedRequest(authHelper, 'put', `/users/${id}/username`).send({
          username: faker.internet.username(),
        }),
      );
      const responses = await Promise.all(promises);

      // Assert
      for (const response of responses) {
        expect(response.status).toBe(204);
      }
      expect(mockUsersService.updateUsername).toHaveBeenCalledTimes(concurrentRequests);
    });
  });
});
