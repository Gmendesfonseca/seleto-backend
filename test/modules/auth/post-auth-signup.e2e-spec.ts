import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { faker } from '@faker-js/faker';
import { AuthHelper, createMockServices } from '../../helpers/auth-helper';
import { AuthController } from '../../../src/domain/auth/auth.controller';
import { AuthServiceInterface } from '../../../src/domain/auth/interfaces/auth-service.interface';

describe('Auth Controller - POST /auth/signup (e2e)', () => {
  let app: INestApplication;
  let authHelper: AuthHelper;
  let mockAuthService: any;

  const validSignUpData = {
    username: faker.internet.username(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    password: faker.internet.password({ length: 12 }),
    type: 'PERSON' as const,
  };

  beforeAll(async () => {
    const { mockAuthService: mockService } = createMockServices();
    mockAuthService = mockService;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: 'test-secret',
          signOptions: { expiresIn: '1h' },
        }),
      ],
      controllers: [AuthController],
      providers: [
        {
          provide: AuthServiceInterface,
          useValue: mockAuthService,
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
    it('should sign up user with valid data (no auth required)', async () => {
      // Arrange
      mockAuthService.signUp.mockResolvedValue(undefined);

      // Act
      const response = await authHelper
        .unauthenticatedRequest('post', '/auth/signup')
        .send(validSignUpData);

      // Assert
      expect(response.status).toBe(201);
      expect(mockAuthService.signUp).toHaveBeenCalledWith({
        username: validSignUpData.username,
        name: validSignUpData.name,
        email: validSignUpData.email,
        password: validSignUpData.password,
        type: validSignUpData.type,
      });
    });

    it('should work when authenticated as well', async () => {
      // Arrange
      mockAuthService.signUp.mockResolvedValue(undefined);
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedPost(
        '/auth/signup',
        validSignUpData,
        testUser,
      );

      // Assert
      expect(response.status).toBe(201);
      expect(mockAuthService.signUp).toHaveBeenCalledWith({
        username: validSignUpData.username,
        name: validSignUpData.name,
        email: validSignUpData.email,
        password: validSignUpData.password,
        type: validSignUpData.type,
      });
    });
  });

  describe('Validation Tests', () => {
    it('should validate required username field', async () => {
      // Arrange
      const testUser = authHelper.createTestUser();
      const incompleteData = {
        name: validSignUpData.name,
        email: validSignUpData.email,
        password: validSignUpData.password,
        type: validSignUpData.type,
        // Missing username
      };

      // Act
      const { response } = await authHelper.authenticatedPost(
        '/auth/signup',
        incompleteData,
        testUser,
      );

      // Assert
      expect(response.status).toBe(400);
      expect(mockAuthService.signUp).not.toHaveBeenCalled();
    });

    it('should validate required name field', async () => {
      // Arrange
      const testUser = authHelper.createTestUser();
      const incompleteData = {
        username: validSignUpData.username,
        email: validSignUpData.email,
        password: validSignUpData.password,
        type: validSignUpData.type,
        // Missing name
      };

      // Act
      const { response } = await authHelper.authenticatedPost(
        '/auth/signup',
        incompleteData,
        testUser,
      );

      // Assert
      expect(response.status).toBe(400);
      expect(mockAuthService.signUp).not.toHaveBeenCalled();
    });

    it('should validate required email field', async () => {
      // Arrange
      const testUser = authHelper.createTestUser();
      const incompleteData = {
        username: validSignUpData.username,
        name: validSignUpData.name,
        password: validSignUpData.password,
        type: validSignUpData.type,
        // Missing email
      };

      // Act
      const { response } = await authHelper.authenticatedPost(
        '/auth/signup',
        incompleteData,
        testUser,
      );

      // Assert
      expect(response.status).toBe(400);
      expect(mockAuthService.signUp).not.toHaveBeenCalled();
    });

    it('should validate required password field', async () => {
      // Arrange
      const testUser = authHelper.createTestUser();
      const incompleteData = {
        username: validSignUpData.username,
        name: validSignUpData.name,
        email: validSignUpData.email,
        type: validSignUpData.type,
        // Missing password
      };

      // Act
      const { response } = await authHelper.authenticatedPost(
        '/auth/signup',
        incompleteData,
        testUser,
      );

      // Assert
      expect(response.status).toBe(400);
      expect(mockAuthService.signUp).not.toHaveBeenCalled();
    });

    it('should validate required type field', async () => {
      // Arrange
      const testUser = authHelper.createTestUser();
      const incompleteData = {
        username: validSignUpData.username,
        name: validSignUpData.name,
        email: validSignUpData.email,
        password: validSignUpData.password,
        // Missing type
      };

      // Act
      const { response } = await authHelper.authenticatedPost(
        '/auth/signup',
        incompleteData,
        testUser,
      );

      // Assert
      expect(response.status).toBe(400);
      expect(mockAuthService.signUp).not.toHaveBeenCalled();
    });

    it('should validate type enum values', async () => {
      // Arrange
      const testUser = authHelper.createTestUser();
      const invalidData = {
        ...validSignUpData,
        type: 'INVALID_TYPE',
      };

      // Act
      const { response } = await authHelper.authenticatedPost(
        '/auth/signup',
        invalidData,
        testUser,
      );

      // Assert
      expect(response.status).toBe(400);
      expect(mockAuthService.signUp).not.toHaveBeenCalled();
    });

    it('should validate empty fields', async () => {
      // Arrange
      const testUser = authHelper.createTestUser();
      const emptyFieldsData = {
        username: '',
        name: '',
        email: '',
        password: '',
        type: 'PERSON' as const,
      };

      // Act
      const { response } = await authHelper.authenticatedPost(
        '/auth/signup',
        emptyFieldsData,
        testUser,
      );

      // Assert
      expect(response.status).toBe(400);
      expect(mockAuthService.signUp).not.toHaveBeenCalled();
    });
  });

  describe('User Type Tests', () => {
    it('should accept PERSON type', async () => {
      // Arrange
      mockAuthService.signUp.mockResolvedValue(undefined);
      const testUser = authHelper.createTestUser();
      const personData = { ...validSignUpData, type: 'PERSON' as const };

      // Act
      const { response } = await authHelper.authenticatedPost('/auth/signup', personData, testUser);

      // Assert
      expect(response.status).toBe(201);
      expect(mockAuthService.signUp).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'PERSON' }),
      );
    });

    it('should accept COMPANY type', async () => {
      // Arrange
      mockAuthService.signUp.mockResolvedValue(undefined);
      const testUser = authHelper.createTestUser();
      const companyData = { ...validSignUpData, type: 'COMPANY' as const };

      // Act
      const { response } = await authHelper.authenticatedPost(
        '/auth/signup',
        companyData,
        testUser,
      );

      // Assert
      expect(response.status).toBe(201);
      expect(mockAuthService.signUp).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'COMPANY' }),
      );
    });
  });

  describe('User Context Tests', () => {
    it('should work with person user', async () => {
      // Arrange
      mockAuthService.signUp.mockResolvedValue(undefined);
      const personUser = authHelper.createPersonUser();

      // Act
      const { response } = await authHelper.authenticatedPost(
        '/auth/signup',
        validSignUpData,
        personUser,
      );

      // Assert
      expect(response.status).toBe(201);
      expect(mockAuthService.signUp).toHaveBeenCalled();
    });

    it('should work with company user', async () => {
      // Arrange
      mockAuthService.signUp.mockResolvedValue(undefined);
      const companyUser = authHelper.createCompanyUser();

      // Act
      const { response } = await authHelper.authenticatedPost(
        '/auth/signup',
        validSignUpData,
        companyUser,
      );

      // Assert
      expect(response.status).toBe(201);
      expect(mockAuthService.signUp).toHaveBeenCalled();
    });
  });

  describe('Error Handling Tests', () => {
    it('should handle duplicate username error', async () => {
      // Arrange
      const conflictError = new Error('Username already exists');
      conflictError.name = 'ConflictException';
      mockAuthService.signUp.mockRejectedValue(conflictError);
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedPost(
        '/auth/signup',
        validSignUpData,
        testUser,
      );

      // Assert
      expect(response.status).toBe(409);
    });

    it('should handle duplicate email error', async () => {
      // Arrange
      const conflictError = new Error('Email already exists');
      conflictError.name = 'ConflictException';
      mockAuthService.signUp.mockRejectedValue(conflictError);
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedPost(
        '/auth/signup',
        validSignUpData,
        testUser,
      );

      // Assert
      expect(response.status).toBe(409);
    });

    it('should handle validation errors', async () => {
      // Arrange
      const validationError = new Error('Password too weak');
      validationError.name = 'BadRequestException';
      mockAuthService.signUp.mockRejectedValue(validationError);
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedPost(
        '/auth/signup',
        validSignUpData,
        testUser,
      );

      // Assert
      expect(response.status).toBe(400);
    });

    it('should handle generic service errors', async () => {
      // Arrange
      mockAuthService.signUp.mockRejectedValue(new Error('Database connection error'));
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedPost(
        '/auth/signup',
        validSignUpData,
        testUser,
      );

      // Assert
      expect(response.status).toBe(500);
    });
  });

  describe('Success Response Tests', () => {
    it('should return 201 with empty body on success', async () => {
      // Arrange
      mockAuthService.signUp.mockResolvedValue(undefined);
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedPost(
        '/auth/signup',
        validSignUpData,
        testUser,
      );

      // Assert
      expect(response.status).toBe(201);
      expect(response.body).toEqual({});
    });

    it('should call service with correct parameters', async () => {
      // Arrange
      mockAuthService.signUp.mockResolvedValue(undefined);
      const testUser = authHelper.createTestUser();

      // Act
      await authHelper.authenticatedPost('/auth/signup', validSignUpData, testUser);

      // Assert
      expect(mockAuthService.signUp).toHaveBeenCalledWith({
        username: validSignUpData.username,
        name: validSignUpData.name,
        email: validSignUpData.email,
        password: validSignUpData.password,
        type: validSignUpData.type,
      });
    });
  });

  describe('Data Format Tests', () => {
    it('should handle various username formats', async () => {
      // Arrange
      const usernameFormats = ['john_doe', 'johndoe123', 'john.doe', 'JohnDoe'];
      mockAuthService.signUp.mockResolvedValue(undefined);
      const testUser = authHelper.createTestUser();

      // Act & Assert
      for (const username of usernameFormats) {
        const data = { ...validSignUpData, username };
        const { response } = await authHelper.authenticatedPost('/auth/signup', data, testUser);
        expect(response.status).toBe(201);
        expect(mockAuthService.signUp).toHaveBeenCalledWith(expect.objectContaining({ username }));
        jest.clearAllMocks();
      }
    });

    it('should handle various email formats', async () => {
      // Arrange
      const emailFormats = [
        'user@example.com',
        'test.user@domain.co.uk',
        'user+tag@example.org',
        'user123@test-domain.com',
      ];
      mockAuthService.signUp.mockResolvedValue(undefined);
      const testUser = authHelper.createTestUser();

      // Act & Assert
      for (const email of emailFormats) {
        const data = { ...validSignUpData, email };
        const { response } = await authHelper.authenticatedPost('/auth/signup', data, testUser);
        expect(response.status).toBe(201);
        expect(mockAuthService.signUp).toHaveBeenCalledWith(expect.objectContaining({ email }));
        jest.clearAllMocks();
      }
    });

    it('should handle various name formats', async () => {
      // Arrange
      const nameFormats = [
        'John Doe',
        'Maria Silva Santos',
        'José da Silva',
        'Tech Company Ltd',
        'ABC Consulting Inc.',
      ];
      mockAuthService.signUp.mockResolvedValue(undefined);
      const testUser = authHelper.createTestUser();

      // Act & Assert
      for (const name of nameFormats) {
        const data = { ...validSignUpData, name };
        const { response } = await authHelper.authenticatedPost('/auth/signup', data, testUser);
        expect(response.status).toBe(201);
        expect(mockAuthService.signUp).toHaveBeenCalledWith(expect.objectContaining({ name }));
        jest.clearAllMocks();
      }
    });
  });
});
