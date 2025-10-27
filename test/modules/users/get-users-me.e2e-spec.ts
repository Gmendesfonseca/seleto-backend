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

describe('Users Controller - GET /users/me (e2e)', () => {
  let app: INestApplication;
  let authHelper: AuthHelper;
  let mockUsersService: any;

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
      const response = await authHelper.unauthenticatedRequest('get', '/users/me');
      expectUnauthorizedResponse(response);
      expect(mockUsersService.findOne).not.toHaveBeenCalled();
    });

    it('should return 401 with invalid token', async () => {
      const response = await authHelper.invalidTokenRequest('get', '/users/me');
      expectUnauthorizedResponse(response);
      expect(mockUsersService.findOne).not.toHaveBeenCalled();
    });

    it('should return 401 with expired token', async () => {
      const response = await authHelper.expiredTokenRequest('get', '/users/me');
      expectUnauthorizedResponse(response);
      expect(mockUsersService.findOne).not.toHaveBeenCalled();
    });
  });

  describe('User Context Tests', () => {
    it('should work with person user', async () => {
      // Arrange
      mockUsersService.findOne.mockResolvedValue(mockUserResponse);
      const personUser = authHelper.createPersonUser();

      // Act
      const { response } = await authHelper.authenticatedGet('/users/me', personUser);

      // Assert
      expect(response.status).toBe(200);
      expect(mockUsersService.findOne).toHaveBeenCalledWith(personUser.id);
    });

    it('should work with company user', async () => {
      // Arrange
      const companyUserResponse = { ...mockUserResponse, type: 'COMPANY' };
      mockUsersService.findOne.mockResolvedValue(companyUserResponse);
      const companyUser = authHelper.createCompanyUser();

      // Act
      const { response } = await authHelper.authenticatedGet('/users/me', companyUser);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual(companyUserResponse);
      expect(mockUsersService.findOne).toHaveBeenCalledWith(companyUser.id);
    });
  });

  describe('Error Handling Tests', () => {
    it('should handle NotFoundException when user not found', async () => {
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

    it('should handle generic service errors', async () => {
      // Arrange
      mockUsersService.findOne.mockRejectedValue(new Error('Database connection error'));
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedGet('/users/me', testUser);

      // Assert
      expect(response.status).toBe(404);
    });
  });

  describe('Data Integrity Tests', () => {
    it('should return user data with correct structure', async () => {
      // Arrange
      mockUsersService.findOne.mockResolvedValue(mockUserResponse);
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedGet('/users/me', testUser);

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
      const userWithPassword = { ...mockUserResponse, password: 'secret123' };
      mockUsersService.findOne.mockResolvedValue(userWithPassword);
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedGet('/users/me', testUser);

      // Assert
      expect(response.body).not.toHaveProperty('password');
    });
  });
});
