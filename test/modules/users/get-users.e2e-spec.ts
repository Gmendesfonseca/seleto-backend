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

describe('Users Controller - GET /users (e2e)', () => {
  let app: INestApplication;
  let authHelper: AuthHelper;
  let mockUsersService: any;

  const mockUsersListResponse = {
    data: [
      {
        id: faker.string.uuid(),
        username: faker.internet.username(),
        email: faker.internet.email(),
        status: 'ACTIVE',
        type: 'PERSON',
        isVerified: true,
        createdAt: faker.date.past().toISOString(),
        updatedAt: faker.date.recent().toISOString(),
      },
    ],
    total: 1,
    page: 1,
    limit: 10,
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
    it('should return users list when authenticated', async () => {
      // Arrange
      mockUsersService.findAll.mockResolvedValue(mockUsersListResponse);
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedGet('/users', testUser);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUsersListResponse);
      expect(mockUsersService.findAll).toHaveBeenCalledWith({
        email: undefined,
        username: undefined,
        status: undefined,
        type: undefined,
        companyId: undefined,
        isVerified: undefined,
        page: 1,
        limit: 10,
      });
    });

    it('should return 401 when not authenticated', async () => {
      const response = await authHelper.unauthenticatedRequest('get', '/users');
      expectUnauthorizedResponse(response);
      expect(mockUsersService.findAll).not.toHaveBeenCalled();
    });

    it('should return 401 with invalid token', async () => {
      const response = await authHelper.invalidTokenRequest('get', '/users');
      expectUnauthorizedResponse(response);
      expect(mockUsersService.findAll).not.toHaveBeenCalled();
    });

    it('should return 401 with expired token', async () => {
      const response = await authHelper.expiredTokenRequest('get', '/users');
      expectUnauthorizedResponse(response);
      expect(mockUsersService.findAll).not.toHaveBeenCalled();
    });
  });

  describe('Query Parameters Tests', () => {
    it('should handle email filter', async () => {
      // Arrange
      mockUsersService.findAll.mockResolvedValue(mockUsersListResponse);
      const testUser = authHelper.createTestUser();

      // Act
      await authHelper.authenticatedGet('/users?email=test@example.com', testUser);

      // Assert
      expect(mockUsersService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'test@example.com',
        }),
      );
    });

    it('should handle username filter', async () => {
      // Arrange
      mockUsersService.findAll.mockResolvedValue(mockUsersListResponse);
      const testUser = authHelper.createTestUser();

      // Act
      await authHelper.authenticatedGet('/users?username=testuser', testUser);

      // Assert
      expect(mockUsersService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'testuser',
        }),
      );
    });

    it('should handle status filter', async () => {
      // Arrange
      mockUsersService.findAll.mockResolvedValue(mockUsersListResponse);
      const testUser = authHelper.createTestUser();

      // Act
      await authHelper.authenticatedGet('/users?status=ACTIVE', testUser);

      // Assert
      expect(mockUsersService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'ACTIVE',
        }),
      );
    });

    it('should handle type filter', async () => {
      // Arrange
      mockUsersService.findAll.mockResolvedValue(mockUsersListResponse);
      const testUser = authHelper.createTestUser();

      // Act
      await authHelper.authenticatedGet('/users?type=COMPANY', testUser);

      // Assert
      expect(mockUsersService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'COMPANY',
        }),
      );
    });

    it('should handle companyId filter', async () => {
      // Arrange
      mockUsersService.findAll.mockResolvedValue(mockUsersListResponse);
      const testUser = authHelper.createTestUser();
      const companyId = faker.string.uuid();

      // Act
      await authHelper.authenticatedGet(`/users?companyId=${companyId}`, testUser);

      // Assert
      expect(mockUsersService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          companyId,
        }),
      );
    });

    it('should handle isVerified filter', async () => {
      // Arrange
      mockUsersService.findAll.mockResolvedValue(mockUsersListResponse);
      const testUser = authHelper.createTestUser();

      // Act
      await authHelper.authenticatedGet('/users?isVerified=true', testUser);

      // Assert
      expect(mockUsersService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          isVerified: 'true',
        }),
      );
    });

    it('should handle pagination parameters', async () => {
      // Arrange
      mockUsersService.findAll.mockResolvedValue(mockUsersListResponse);
      const testUser = authHelper.createTestUser();

      // Act
      await authHelper.authenticatedGet('/users?page=2&limit=20', testUser);

      // Assert
      expect(mockUsersService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 2,
          limit: 20,
        }),
      );
    });

    it('should handle multiple filters combined', async () => {
      // Arrange
      mockUsersService.findAll.mockResolvedValue(mockUsersListResponse);
      const testUser = authHelper.createTestUser();
      const companyId = faker.string.uuid();

      // Act
      await authHelper.authenticatedGet(
        `/users?email=test@example.com&status=ACTIVE&type=COMPANY&companyId=${companyId}&page=2&limit=5`,
        testUser,
      );

      // Assert
      expect(mockUsersService.findAll).toHaveBeenCalledWith({
        email: 'test@example.com',
        username: undefined,
        status: 'ACTIVE',
        type: 'COMPANY',
        companyId,
        isVerified: undefined,
        page: 2,
        limit: 5,
      });
    });
  });

  describe('Error Handling Tests', () => {
    it('should handle service errors gracefully', async () => {
      // Arrange
      mockUsersService.findAll.mockRejectedValue(new Error('Database connection error'));
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedGet('/users', testUser);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Failed to list users');
    });

    it('should handle empty results', async () => {
      // Arrange
      const emptyResponse = { data: [], total: 0, page: 1, limit: 10 };
      mockUsersService.findAll.mockResolvedValue(emptyResponse);
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedGet('/users', testUser);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual(emptyResponse);
    });
  });

  describe('Default Values Tests', () => {
    it('should use default pagination values when not provided', async () => {
      // Arrange
      mockUsersService.findAll.mockResolvedValue(mockUsersListResponse);
      const testUser = authHelper.createTestUser();

      // Act
      await authHelper.authenticatedGet('/users', testUser);

      // Assert
      expect(mockUsersService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          limit: 10,
        }),
      );
    });
  });
});
