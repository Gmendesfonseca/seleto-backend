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

describe('Users Controller (e2e) - Authorized Routes', () => {
  let app: INestApplication;
  let authHelper: AuthHelper;
  let mockUsersService: any;

  // Test data
  const mockUserResponse = {
    id: faker.string.uuid(),
    username: faker.internet.username(),
    email: faker.internet.email(),
    status: 'ACTIVE',
    type: 'PERSON',
    isVerified: true,
    createdAt: faker.date.past().toISOString(),
    updatedAt: faker.date.recent().toISOString(),
  };

  const mockUsersListResponse = {
    data: [mockUserResponse],
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

  describe('GET /users (List Users)', () => {
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

    it('should handle query parameters when authenticated', async () => {
      // Arrange
      mockUsersService.findAll.mockResolvedValue(mockUsersListResponse);
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedGet(
        '/users?email=test@example.com&status=ACTIVE&page=2&limit=5',
        testUser,
      );

      // Assert
      expect(response.status).toBe(200);
      expect(mockUsersService.findAll).toHaveBeenCalledWith({
        email: 'test@example.com',
        username: undefined,
        status: 'ACTIVE',
        type: undefined,
        companyId: undefined,
        isVerified: undefined,
        page: 2,
        limit: 5,
      });
    });

    it('should return 401 when not authenticated', async () => {
      // Act
      const response = await authHelper.unauthenticatedRequest('get', '/users');

      // Assert
      expectUnauthorizedResponse(response);
      expect(mockUsersService.findAll).not.toHaveBeenCalled();
    });

    it('should return 401 with invalid token', async () => {
      // Act
      const response = await authHelper.invalidTokenRequest('get', '/users');

      // Assert
      expectUnauthorizedResponse(response);
      expect(mockUsersService.findAll).not.toHaveBeenCalled();
    });

    it('should return 401 with expired token', async () => {
      // Act
      const response = await authHelper.expiredTokenRequest('get', '/users');

      // Assert
      expectUnauthorizedResponse(response);
      expect(mockUsersService.findAll).not.toHaveBeenCalled();
    });
  });

  describe('GET /users/me (Get Current User)', () => {
    it('should return current user when authenticated', async () => {
      // Arrange
      mockUsersService.findOne.mockResolvedValue(mockUserResponse);
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedGet('/users/me', testUser);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUserResponse);
      expect(mockUsersService.findOne).toHaveBeenCalledWith(testUser.id);
    });

    it('should return 401 when not authenticated', async () => {
      // Act
      const response = await authHelper.unauthenticatedRequest('get', '/users/me');

      // Assert
      expectUnauthorizedResponse(response);
      expect(mockUsersService.findOne).not.toHaveBeenCalled();
    });

    it('should return 401 with invalid token', async () => {
      // Act
      const response = await authHelper.invalidTokenRequest('get', '/users/me');

      // Assert
      expectUnauthorizedResponse(response);
      expect(mockUsersService.findOne).not.toHaveBeenCalled();
    });
  });

  describe('POST /users (Activate User)', () => {
    const activateUserDto = {
      email: faker.internet.email(),
      secret: faker.string.alphanumeric(32),
    };

    it('should activate user when authenticated', async () => {
      // Arrange
      mockUsersService.activate.mockResolvedValue(undefined);
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedPost('/users', activateUserDto, testUser);

      // Assert
      expect(response.status).toBe(201);
      expect(response.body).toEqual({ message: 'User activated successfully' });
      expect(mockUsersService.activate).toHaveBeenCalledWith(activateUserDto);
    });

    it('should return 401 when not authenticated', async () => {
      // Act
      const response = await authHelper
        .unauthenticatedRequest('post', '/users')
        .send(activateUserDto);

      // Assert
      expectUnauthorizedResponse(response);
      expect(mockUsersService.activate).not.toHaveBeenCalled();
    });

    it('should return 401 with invalid token', async () => {
      // Act
      const response = await authHelper.invalidTokenRequest('post', '/users').send(activateUserDto);

      // Assert
      expectUnauthorizedResponse(response);
      expect(mockUsersService.activate).not.toHaveBeenCalled();
    });
  });

  describe('PUT /users/:id (Update User General)', () => {
    const userId = faker.string.uuid();
    const updateUserDto = {
      email: faker.internet.email(),
      username: faker.internet.username(),
      status: 'ACTIVE',
    };

    it('should update user when authenticated', async () => {
      // Arrange
      mockUsersService.updateUser.mockResolvedValue({ ...mockUserResponse, ...updateUserDto });
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedPut(
        `/users/${userId}`,
        updateUserDto,
        testUser,
      );

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject(updateUserDto);
      expect(mockUsersService.updateUser).toHaveBeenCalledWith(userId, updateUserDto);
    });

    it('should return 401 when not authenticated', async () => {
      // Act
      const response = await authHelper
        .unauthenticatedRequest('put', `/users/${userId}`)
        .send(updateUserDto);

      // Assert
      expectUnauthorizedResponse(response);
      expect(mockUsersService.updateUser).not.toHaveBeenCalled();
    });

    it('should return 401 with invalid token', async () => {
      // Act
      const response = await authHelper
        .invalidTokenRequest('put', `/users/${userId}`)
        .send(updateUserDto);

      // Assert
      expectUnauthorizedResponse(response);
      expect(mockUsersService.updateUser).not.toHaveBeenCalled();
    });
  });

  describe('PATCH /users/:id (Update User)', () => {
    const userId = faker.string.uuid();
    const updateUserDto = {
      email: faker.internet.email(),
      status: 'INACTIVE',
    };

    it('should update user when authenticated', async () => {
      // Arrange
      mockUsersService.updateUser.mockResolvedValue({ ...mockUserResponse, ...updateUserDto });
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedPatch(
        `/users/${userId}`,
        updateUserDto,
        testUser,
      );

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject(updateUserDto);
      expect(mockUsersService.updateUser).toHaveBeenCalledWith(userId, updateUserDto);
    });

    it('should return 401 when not authenticated', async () => {
      // Act
      const response = await authHelper
        .unauthenticatedRequest('patch', `/users/${userId}`)
        .send(updateUserDto);

      // Assert
      expectUnauthorizedResponse(response);
      expect(mockUsersService.updateUser).not.toHaveBeenCalled();
    });

    it('should return 401 with invalid token', async () => {
      // Act
      const response = await authHelper
        .invalidTokenRequest('patch', `/users/${userId}`)
        .send(updateUserDto);

      // Assert
      expectUnauthorizedResponse(response);
      expect(mockUsersService.updateUser).not.toHaveBeenCalled();
    });
  });

  describe('Service Error Handling', () => {
    it('should handle service errors gracefully for authenticated requests', async () => {
      // Arrange
      mockUsersService.findAll.mockRejectedValue(new Error('Database connection error'));
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedGet('/users', testUser);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Failed to list users');
    });

    it('should handle NotFoundException for getCurrentUser', async () => {
      // Arrange
      const notFoundError = new Error('User not found');
      notFoundError.name = 'NotFoundException';
      mockUsersService.findOne.mockRejectedValue(notFoundError);
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedGet('/users/me', testUser);

      // Assert
      expect(response.status).toBe(404);
    });
  });

  describe('Validation Tests', () => {
    it('should validate UUID format for user ID parameter', async () => {
      // Arrange
      const testUser = authHelper.createTestUser();
      const invalidId = 'invalid-uuid';

      // Act
      const { response } = await authHelper.authenticatedGet(`/users/${invalidId}`, testUser);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Validation failed');
    });

    it('should validate required fields for user activation', async () => {
      // Arrange
      const testUser = authHelper.createTestUser();
      const invalidDto = {}; // Missing required fields

      // Act
      const { response } = await authHelper.authenticatedPost('/users', invalidDto, testUser);

      // Assert
      expect(response.status).toBe(400);
    });
  });
});
