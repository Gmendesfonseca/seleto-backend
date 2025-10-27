import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { faker } from '@faker-js/faker';
import { AuthHelper, createMockServices } from '../../helpers/auth-helper';
import { UsersController } from '../../../src/domain/users/users.controller';
import { UsersServiceInterface } from '../../../src/domain/users/interfaces/user.service.interface';

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

  describe('Public Access Tests', () => {
    it('should update username when valid data provided (no auth required)', async () => {
      // Arrange
      mockUsersService.updateUsername.mockResolvedValue(mockUpdateResponse);

      // Act
      const response = await authHelper
        .unauthenticatedRequest('put', `/users/${userId}/username`)
        .send(validUsernameUpdateData);

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
      const response = await authHelper
        .unauthenticatedRequest('put', `/users/${invalidId}/username`)
        .send(validUsernameUpdateData);

      // Assert
      expect(response.status).toBe(400);
      expect(mockUsersService.updateUsername).not.toHaveBeenCalled();
    });

    it('should validate required username field', async () => {
      // Arrange
      const incompleteData = {};

      // Act
      const response = await authHelper
        .unauthenticatedRequest('put', `/users/${userId}/username`)
        .send(incompleteData);

      // Assert
      expect(response.status).toBe(400);
      expect(mockUsersService.updateUsername).not.toHaveBeenCalled();
    });

    it('should validate username format and length', async () => {
      // Arrange
      const invalidUsernameData = {
        username: 'ab', // Too short
      };

      // Act
      const response = await authHelper
        .unauthenticatedRequest('put', `/users/${userId}/username`)
        .send(invalidUsernameData);

      // Assert
      expect(response.status).toBe(400);
      expect(mockUsersService.updateUsername).not.toHaveBeenCalled();
    });

    it('should validate username characters', async () => {
      // Arrange
      const invalidUsernameData = {
        username: 'invalid@username!', // Invalid characters
      };

      // Act
      const response = await authHelper
        .unauthenticatedRequest('put', `/users/${userId}/username`)
        .send(invalidUsernameData);

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
        const response = await authHelper
          .unauthenticatedRequest('put', `/users/${userId}/username`)
          .send(data);
        expect(response.status).toBe(204);
        jest.clearAllMocks();
      }
    });

    it('should reject invalid username formats', async () => {
      // Arrange
      const invalidUsernames = [
        'ab', // Too short
        'username_with_very_long_name_that_exceeds_limits_significantly',
        'user@name',
        'user name', // Space
        'user!name',
        '123username', // Starting with number
      ];

      // Act & Assert
      for (const username of invalidUsernames) {
        const data = { username };
        const response = await authHelper
          .unauthenticatedRequest('put', `/users/${userId}/username`)
          .send(data);
        expect(response.status).toBe(400);
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
      const response = await authHelper
        .unauthenticatedRequest('put', `/users/${userId}/username`)
        .send(validUsernameUpdateData);

      // Assert
      expect(response.status).toBe(404);
      expect(mockUsersService.updateUsername).toHaveBeenCalled();
    });

    it('should return 404 on generic service errors', async () => {
      // Arrange
      mockUsersService.updateUsername.mockRejectedValue(new Error('Database error'));

      // Act
      const response = await authHelper
        .unauthenticatedRequest('put', `/users/${userId}/username`)
        .send(validUsernameUpdateData);

      // Assert
      expect(response.status).toBe(404);
    });

    it('should handle username already exists error', async () => {
      // Arrange
      const conflictError = new Error('Username already exists');
      conflictError.name = 'ConflictException';
      mockUsersService.updateUsername.mockRejectedValue(conflictError);

      // Act
      const response = await authHelper
        .unauthenticatedRequest('put', `/users/${userId}/username`)
        .send(validUsernameUpdateData);

      // Assert
      expect(response.status).toBe(404);
    });
  });

  describe('Success Response Tests', () => {
    it('should return 204 with empty body on success', async () => {
      // Arrange
      mockUsersService.updateUsername.mockResolvedValue(mockUpdateResponse);

      // Act
      const response = await authHelper
        .unauthenticatedRequest('put', `/users/${userId}/username`)
        .send(validUsernameUpdateData);

      // Assert
      expect(response.status).toBe(204);
      expect(response.body).toEqual({});
    });

    it('should call service with correct parameters', async () => {
      // Arrange
      mockUsersService.updateUsername.mockResolvedValue(mockUpdateResponse);

      // Act
      await authHelper
        .unauthenticatedRequest('put', `/users/${userId}/username`)
        .send(validUsernameUpdateData);

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
      const response = await authHelper
        .unauthenticatedRequest('put', `/users/${userId}/username`)
        .send(mixedCaseData);

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
        authHelper
          .unauthenticatedRequest('put', `/users/${id}/username`)
          .send({ username: faker.internet.username() }),
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
