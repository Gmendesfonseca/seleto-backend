import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { faker } from '@faker-js/faker';
import { AuthHelper, createMockServices } from '../../helpers/auth-helper';
import { UsersController } from '../../../src/domain/users/users.controller';
import { UsersServiceInterface } from '../../../src/domain/users/interfaces/user.service.interface';

describe('Users Controller - DELETE /users/:id (e2e)', () => {
  let app: INestApplication;
  let authHelper: AuthHelper;
  let mockUsersService: any;

  const userId = faker.string.uuid();

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
    it('should delete user when valid ID provided (no auth required)', async () => {
      // Arrange
      mockUsersService.delete.mockResolvedValue(undefined);

      // Act
      const response = await authHelper.unauthenticatedRequest('delete', `/users/${userId}`);

      // Assert
      expect(response.status).toBe(204);
      expect(mockUsersService.delete).toHaveBeenCalledWith(userId);
    });

    it('should work when authenticated as well', async () => {
      // Arrange
      mockUsersService.delete.mockResolvedValue(undefined);
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedDelete(`/users/${userId}`, testUser);

      // Assert
      expect(response.status).toBe(204);
      expect(mockUsersService.delete).toHaveBeenCalledWith(userId);
    });
  });

  describe('Validation Tests', () => {
    it('should validate UUID format for user ID', async () => {
      // Arrange
      const invalidId = 'not-a-uuid';

      // Act
      const response = await authHelper.unauthenticatedRequest('delete', `/users/${invalidId}`);

      // Assert
      expect(response.status).toBe(400);
      expect(mockUsersService.delete).not.toHaveBeenCalled();
    });

    it('should validate required ID parameter', async () => {
      // Act
      const response = await authHelper.unauthenticatedRequest('delete', '/users/');

      // Assert
      expect(response.status).toBe(404); // Route not found
    });

    it('should handle empty string as ID', async () => {
      // Act
      const response = await authHelper.unauthenticatedRequest('delete', '/users/');

      // Assert
      expect(response.status).toBe(404); // Route not found
    });
  });

  describe('Error Handling Tests', () => {
    it('should return 404 when user not found', async () => {
      // Arrange
      const notFoundError = new Error('User not found');
      notFoundError.name = 'NotFoundException';
      mockUsersService.delete.mockRejectedValue(notFoundError);

      // Act
      const response = await authHelper.unauthenticatedRequest('delete', `/users/${userId}`);

      // Assert
      expect(response.status).toBe(404);
      expect(mockUsersService.delete).toHaveBeenCalledWith(userId);
    });

    it('should return 404 on generic service errors', async () => {
      // Arrange
      mockUsersService.delete.mockRejectedValue(new Error('Database connection error'));

      // Act
      const response = await authHelper.unauthenticatedRequest('delete', `/users/${userId}`);

      // Assert
      expect(response.status).toBe(404);
    });

    it('should handle constraint violation errors', async () => {
      // Arrange
      const constraintError = new Error('Cannot delete user with dependencies');
      constraintError.name = 'ConflictException';
      mockUsersService.delete.mockRejectedValue(constraintError);

      // Act
      const response = await authHelper.unauthenticatedRequest('delete', `/users/${userId}`);

      // Assert
      expect(response.status).toBe(404);
    });

    it('should handle permission errors', async () => {
      // Arrange
      const permissionError = new Error('Insufficient permissions');
      permissionError.name = 'ForbiddenException';
      mockUsersService.delete.mockRejectedValue(permissionError);

      // Act
      const response = await authHelper.unauthenticatedRequest('delete', `/users/${userId}`);

      // Assert
      expect(response.status).toBe(404);
    });
  });

  describe('Success Response Tests', () => {
    it('should return 204 with empty body on success', async () => {
      // Arrange
      mockUsersService.delete.mockResolvedValue(undefined);

      // Act
      const response = await authHelper.unauthenticatedRequest('delete', `/users/${userId}`);

      // Assert
      expect(response.status).toBe(204);
      expect(response.body).toEqual({});
    });

    it('should call service with correct user ID', async () => {
      // Arrange
      mockUsersService.delete.mockResolvedValue(undefined);

      // Act
      await authHelper.unauthenticatedRequest('delete', `/users/${userId}`);

      // Assert
      expect(mockUsersService.delete).toHaveBeenCalledWith(userId);
      expect(mockUsersService.delete).toHaveBeenCalledTimes(1);
    });
  });

  describe('Different User Types Tests', () => {
    it('should delete person user', async () => {
      // Arrange
      const personUserId = faker.string.uuid();
      mockUsersService.delete.mockResolvedValue(undefined);

      // Act
      const response = await authHelper.unauthenticatedRequest('delete', `/users/${personUserId}`);

      // Assert
      expect(response.status).toBe(204);
      expect(mockUsersService.delete).toHaveBeenCalledWith(personUserId);
    });

    it('should delete company user', async () => {
      // Arrange
      const companyUserId = faker.string.uuid();
      mockUsersService.delete.mockResolvedValue(undefined);

      // Act
      const response = await authHelper.unauthenticatedRequest('delete', `/users/${companyUserId}`);

      // Assert
      expect(response.status).toBe(204);
      expect(mockUsersService.delete).toHaveBeenCalledWith(companyUserId);
    });
  });

  describe('Multiple UUID Format Tests', () => {
    it('should handle various valid UUID formats', async () => {
      // Arrange
      const validUUIDs = [
        '550e8400-e29b-41d4-a716-446655440000',
        'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
      ];

      mockUsersService.delete.mockResolvedValue(undefined);

      // Act & Assert
      for (const uuid of validUUIDs) {
        const response = await authHelper.unauthenticatedRequest('delete', `/users/${uuid}`);
        expect(response.status).toBe(204);
        expect(mockUsersService.delete).toHaveBeenCalledWith(uuid);
        jest.clearAllMocks();
      }
    });

    it('should reject invalid UUID formats', async () => {
      // Arrange
      const invalidUUIDs = [
        'not-a-uuid',
        '123',
        'abc-def-ghi',
        'f47ac10b-58cc-4372-a567-0e02b2c3d47', // Missing last character
        'f47ac10b58cc4372a5670e02b2c3d479', // Missing hyphens
      ];

      // Act & Assert
      for (const invalidUuid of invalidUUIDs) {
        const response = await authHelper.unauthenticatedRequest('delete', `/users/${invalidUuid}`);
        expect(response.status).toBe(400);
        expect(mockUsersService.delete).not.toHaveBeenCalled();
      }
    });
  });

  describe('Concurrent Deletion Tests', () => {
    it('should handle concurrent deletion requests', async () => {
      // Arrange
      mockUsersService.delete.mockResolvedValue(undefined);
      const concurrentRequests = 5;
      const differentUserIds = Array.from({ length: concurrentRequests }, () =>
        faker.string.uuid(),
      );

      // Act
      const promises = differentUserIds.map((id) =>
        authHelper.unauthenticatedRequest('delete', `/users/${id}`),
      );
      const responses = await Promise.all(promises);

      // Assert
      for (const response of responses) {
        expect(response.status).toBe(204);
      }
      expect(mockUsersService.delete).toHaveBeenCalledTimes(concurrentRequests);
    });

    it('should handle deletion of same user with race condition', async () => {
      // Arrange
      let callCount = 0;
      mockUsersService.delete.mockImplementation(() => {
        callCount += 1;
        if (callCount === 1) {
          return Promise.resolve();
        }
        const error = new Error('User not found');
        error.name = 'NotFoundException';
        return Promise.reject(error);
      });

      // Act
      const promise1 = authHelper.unauthenticatedRequest('delete', `/users/${userId}`);
      const promise2 = authHelper.unauthenticatedRequest('delete', `/users/${userId}`);
      const [response1, response2] = await Promise.all([promise1, promise2]);

      // Assert
      expect([response1.status, response2.status].sort()).toEqual([204, 404]);
    });
  });

  describe('Authenticated Deletion Tests', () => {
    it('should work with person user authentication', async () => {
      // Arrange
      mockUsersService.delete.mockResolvedValue(undefined);
      const personUser = authHelper.createPersonUser();

      // Act
      const { response } = await authHelper.authenticatedDelete(`/users/${userId}`, personUser);

      // Assert
      expect(response.status).toBe(204);
      expect(mockUsersService.delete).toHaveBeenCalledWith(userId);
    });

    it('should work with company user authentication', async () => {
      // Arrange
      mockUsersService.delete.mockResolvedValue(undefined);
      const companyUser = authHelper.createCompanyUser();

      // Act
      const { response } = await authHelper.authenticatedDelete(`/users/${userId}`, companyUser);

      // Assert
      expect(response.status).toBe(204);
      expect(mockUsersService.delete).toHaveBeenCalledWith(userId);
    });
  });

  describe('Soft Delete vs Hard Delete Tests', () => {
    it('should call delete service method (implementation depends on service)', async () => {
      // Arrange
      mockUsersService.delete.mockResolvedValue(undefined);

      // Act
      await authHelper.unauthenticatedRequest('delete', `/users/${userId}`);

      // Assert
      expect(mockUsersService.delete).toHaveBeenCalledWith(userId);
      // Note: Whether this is soft delete or hard delete depends on the service implementation
    });

    it('should not return deleted user data', async () => {
      // Arrange
      mockUsersService.delete.mockResolvedValue(undefined);

      // Act
      const response = await authHelper.unauthenticatedRequest('delete', `/users/${userId}`);

      // Assert
      expect(response.status).toBe(204);
      expect(response.body).toEqual({});
    });
  });
});
