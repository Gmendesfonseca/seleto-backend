import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { faker } from '@faker-js/faker';
import { AuthHelper, expectUnauthorizedResponse } from '../../helpers/auth-helper';
import { UsersController } from '../../../src/domain/users/users.controller';
import { UsersServiceInterface } from '../../../src/domain/users/interfaces/user.service.interface';
import { authGuardProvider } from '../../helpers/auth-guard.provider';
import { createUsersServiceMock } from '../../helpers/e2e-users-mocks';

describe('Users Controller - POST /users (e2e)', () => {
  let app: INestApplication;
  let authHelper: AuthHelper;
  let mockUsersService: any;

  const validActivationData = {
    id: faker.string.uuid(),
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
    it('should activate user when authenticated', async () => {
      // Arrange
      mockUsersService.activate.mockResolvedValue(undefined);
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedPost(
        '/users',
        validActivationData,
        testUser,
      );

      // Assert
      expect(response.status).toBe(201);
      expect(response.body.message).toBe('User activated successfully');
      expect(mockUsersService.activate).toHaveBeenCalledWith(validActivationData);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await authHelper
        .unauthenticatedRequest('post', '/users')
        .send(validActivationData);
      expectUnauthorizedResponse(response);
      expect(mockUsersService.activate).not.toHaveBeenCalled();
    });

    it('should return 401 with invalid token', async () => {
      const response = await authHelper
        .invalidTokenRequest('post', '/users')
        .send(validActivationData);
      expectUnauthorizedResponse(response);
      expect(mockUsersService.activate).not.toHaveBeenCalled();
    });

    it('should return 401 with expired token', async () => {
      const response = await authHelper
        .expiredTokenRequest('post', '/users')
        .send(validActivationData);
      expectUnauthorizedResponse(response);
      expect(mockUsersService.activate).not.toHaveBeenCalled();
    });
  });

  describe('Validation Tests', () => {
    it('should validate required fields', async () => {
      // Arrange
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedPost(
        '/users',
        { id: faker.string.uuid() },
        testUser,
      );

      // Assert
      expect(response.status).toBe(400);
      expect(mockUsersService.activate).not.toHaveBeenCalled();
    });

    it('should validate id format', async () => {
      // Arrange
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedPost(
        '/users',
        { ...validActivationData, id: 'invalid-uuid' },
        testUser,
      );

      // Assert
      expect(response.status).toBe(400);
      expect(mockUsersService.activate).not.toHaveBeenCalled();
    });

    it('should reject a non-string secret', async () => {
      // Arrange
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedPost(
        '/users',
        { ...validActivationData, secret: 12345 },
        testUser,
      );

      // Assert
      expect(response.status).toBe(400);
      expect(mockUsersService.activate).not.toHaveBeenCalled();
    });
  });

  describe('User Context Tests', () => {
    it.each([
      ['person', () => authHelper.createPersonUser()],
      ['company', () => authHelper.createCompanyUser()],
    ])('should work with a %s user', async (_label, build) => {
      // Arrange
      mockUsersService.activate.mockResolvedValue(undefined);

      // Act
      const { response } = await authHelper.authenticatedPost(
        '/users',
        validActivationData,
        build(),
      );

      // Assert
      expect(response.status).toBe(201);
      expect(mockUsersService.activate).toHaveBeenCalledWith(validActivationData);
    });
  });

  describe('Error Handling Tests', () => {
    it.each([
      ['a generic error', new Error('User already activated')],
      [
        'a not found error',
        Object.assign(new Error('User not found'), { name: 'NotFoundException' }),
      ],
    ])('should map %s from the service to a 400', async (_label, error) => {
      // Arrange
      mockUsersService.activate.mockRejectedValue(error);
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedPost(
        '/users',
        validActivationData,
        testUser,
      );

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Failed to activate user');
    });
  });

  describe('Success Response Tests', () => {
    it('should return success message on successful activation', async () => {
      // Arrange
      mockUsersService.activate.mockResolvedValue(undefined);
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedPost(
        '/users',
        validActivationData,
        testUser,
      );

      // Assert
      expect(response.status).toBe(201);
      expect(response.body).toEqual({ message: 'User activated successfully' });
    });
  });
});
