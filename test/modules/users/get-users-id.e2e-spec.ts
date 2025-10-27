import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { faker } from '@faker-js/faker';
import { AuthHelper, createMockServices } from '../../helpers/auth-helper';
import { UsersController } from '../../../src/domain/users/users.controller';
import { UsersServiceInterface } from '../../../src/domain/users/interfaces/user.service.interface';

describe('Users Controller - GET /users/:id (e2e)', () => {
  let app: INestApplication;
  let authHelper: AuthHelper;
  let mockUsersService: any;

  const mockUser = {
    id: faker.string.uuid(),
    username: faker.internet.username(),
    email: faker.internet.email(),
    status: 'ACTIVE',
    type: 'PERSON',
    isVerified: true,
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

  describe('Public Access Tests', () => {
    it('should return user when requesting valid ID (no auth required)', async () => {
      // Arrange
      mockUsersService.findOne.mockResolvedValue(mockUser);
      const userId = mockUser.id;

      // Act
      const response = await authHelper.unauthenticatedRequest('get', `/users/${userId}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUser);
      expect(mockUsersService.findOne).toHaveBeenCalledWith(userId);
    });

    it('should work when authenticated as well', async () => {
      // Arrange
      mockUsersService.findOne.mockResolvedValue(mockUser);
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedGet(`/users/${mockUser.id}`, testUser);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUser);
      expect(mockUsersService.findOne).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('Validation Tests', () => {
    it('should validate UUID format', async () => {
      // Arrange
      const invalidId = 'not-a-uuid';

      // Act
      const response = await authHelper.unauthenticatedRequest('get', `/users/${invalidId}`);

      // Assert
      expect(response.status).toBe(400);
      expect(mockUsersService.findOne).not.toHaveBeenCalled();
    });

    it('should validate required ID parameter', async () => {
      // Act
      const response = await authHelper.unauthenticatedRequest('get', '/users/');

      // Assert
      expect(response.status).toBe(404); // Route not found
    });

    it('should handle empty string as ID', async () => {
      // Act
      const response = await authHelper.unauthenticatedRequest('get', '/users/');

      // Assert
      expect(response.status).toBe(404); // Route not found
    });
  });

  describe('Error Handling Tests', () => {
    it('should return 404 when user not found', async () => {
      // Arrange
      const notFoundError = new Error('User not found');
      notFoundError.name = 'NotFoundException';
      mockUsersService.findOne.mockRejectedValue(notFoundError);
      const userId = faker.string.uuid();

      // Act
      const response = await authHelper.unauthenticatedRequest('get', `/users/${userId}`);

      // Assert
      expect(response.status).toBe(404);
      expect(mockUsersService.findOne).toHaveBeenCalledWith(userId);
    });

    it('should handle generic service errors', async () => {
      // Arrange
      mockUsersService.findOne.mockRejectedValue(new Error('Database connection error'));
      const userId = faker.string.uuid();

      // Act
      const response = await authHelper.unauthenticatedRequest('get', `/users/${userId}`);

      // Assert
      expect(response.status).toBe(404);
    });

    it('should handle null/undefined response from service', async () => {
      // Arrange
      mockUsersService.findOne.mockResolvedValue(null);
      const userId = faker.string.uuid();

      // Act
      const response = await authHelper.unauthenticatedRequest('get', `/users/${userId}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toBeNull();
    });
  });

  describe('Different User Types Tests', () => {
    it('should return person user details', async () => {
      // Arrange
      const personUser = { ...mockUser, type: 'PERSON' };
      mockUsersService.findOne.mockResolvedValue(personUser);

      // Act
      const response = await authHelper.unauthenticatedRequest('get', `/users/${personUser.id}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.type).toBe('PERSON');
    });

    it('should return company user details', async () => {
      // Arrange
      const companyUser = { ...mockUser, type: 'COMPANY' };
      mockUsersService.findOne.mockResolvedValue(companyUser);

      // Act
      const response = await authHelper.unauthenticatedRequest('get', `/users/${companyUser.id}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.type).toBe('COMPANY');
    });
  });

  describe('Different User Statuses Tests', () => {
    it('should return active user', async () => {
      // Arrange
      const activeUser = { ...mockUser, status: 'ACTIVE' };
      mockUsersService.findOne.mockResolvedValue(activeUser);

      // Act
      const response = await authHelper.unauthenticatedRequest('get', `/users/${activeUser.id}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ACTIVE');
    });

    it('should return inactive user', async () => {
      // Arrange
      const inactiveUser = { ...mockUser, status: 'INACTIVE' };
      mockUsersService.findOne.mockResolvedValue(inactiveUser);

      // Act
      const response = await authHelper.unauthenticatedRequest('get', `/users/${inactiveUser.id}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('INACTIVE');
    });
  });

  describe('Data Integrity Tests', () => {
    it('should return user data with correct structure', async () => {
      // Arrange
      mockUsersService.findOne.mockResolvedValue(mockUser);

      // Act
      const response = await authHelper.unauthenticatedRequest('get', `/users/${mockUser.id}`);

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
      const userWithPassword = { ...mockUser, password: 'secret123' };
      mockUsersService.findOne.mockResolvedValue(userWithPassword);

      // Act
      const response = await authHelper.unauthenticatedRequest('get', `/users/${mockUser.id}`);

      // Assert
      expect(response.body).not.toHaveProperty('password');
    });

    it('should handle various UUID formats', async () => {
      // Arrange
      const validUUIDs = [
        '550e8400-e29b-41d4-a716-446655440000',
        'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
      ];

      mockUsersService.findOne.mockResolvedValue(mockUser);

      // Act & Assert
      for (const uuid of validUUIDs) {
        const response = await authHelper.unauthenticatedRequest('get', `/users/${uuid}`);
        expect(response.status).toBe(200);
        jest.clearAllMocks();
      }
    });
  });

  describe('Performance Tests', () => {
    it('should handle concurrent requests', async () => {
      // Arrange
      mockUsersService.findOne.mockResolvedValue(mockUser);
      const userId = mockUser.id;
      const concurrentRequests = 10;

      // Act
      const promises = Array.from({ length: concurrentRequests }, () =>
        authHelper.unauthenticatedRequest('get', `/users/${userId}`),
      );
      const responses = await Promise.all(promises);

      // Assert
      responses.forEach((response) => {
        expect(response.status).toBe(200);
      });
      expect(mockUsersService.findOne).toHaveBeenCalledTimes(concurrentRequests);
    });
  });
});
