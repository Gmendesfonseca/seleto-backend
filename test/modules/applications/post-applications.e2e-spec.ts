import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  INestApplication,
  NotFoundException,
  ValidationPipe,
} from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { faker } from '@faker-js/faker';
import {
  AuthHelper,
  expectUnauthorizedResponse,
  createMockServices,
} from '../../helpers/auth-helper';
import { authGuardProvider } from '../../helpers/auth-guard.provider';
import { ApplicationController } from '../../../src/domain/applications/application.controller';
import { ApplicationServiceInterface } from '../../../src/domain/applications/interfaces/application.service.interface';

describe('Applications Controller - POST /applications (e2e)', () => {
  let app: INestApplication;
  let authHelper: AuthHelper;
  let mockApplicationService: any;

  const validApplicationData = {
    applicantId: faker.string.uuid(),
    vacancyId: faker.string.uuid(),
    coverLetter: faker.lorem.paragraphs(2),
    status: 'PENDING',
  };

  const mockApplicationResponse = {
    id: faker.string.uuid(),
    ...validApplicationData,
    appliedAt: faker.date.recent().toISOString(),
    createdAt: faker.date.recent().toISOString(),
    updatedAt: faker.date.recent().toISOString(),
  };

  beforeAll(async () => {
    const { mockApplicationService: mockService } = createMockServices();
    mockApplicationService = mockService;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: 'test-secret',
          signOptions: { expiresIn: '1h' },
        }),
      ],
      controllers: [ApplicationController],
      providers: [
        authGuardProvider,
        {
          provide: ApplicationServiceInterface,
          useValue: mockApplicationService,
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
    it('should create application when authenticated', async () => {
      // Arrange
      mockApplicationService.create.mockResolvedValue(mockApplicationResponse);
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedPost(
        '/applications',
        validApplicationData,
        testUser,
      );

      // Assert
      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockApplicationResponse);
      expect(mockApplicationService.create).toHaveBeenCalledWith(validApplicationData);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await authHelper
        .unauthenticatedRequest('post', '/applications')
        .send(validApplicationData);
      expectUnauthorizedResponse(response);
      expect(mockApplicationService.create).not.toHaveBeenCalled();
    });

    it('should return 401 with invalid token', async () => {
      const response = await authHelper
        .invalidTokenRequest('post', '/applications')
        .send(validApplicationData);
      expectUnauthorizedResponse(response);
      expect(mockApplicationService.create).not.toHaveBeenCalled();
    });

    it('should return 401 with expired token', async () => {
      const response = await authHelper
        .expiredTokenRequest('post', '/applications')
        .send(validApplicationData);
      expectUnauthorizedResponse(response);
      expect(mockApplicationService.create).not.toHaveBeenCalled();
    });
  });

  describe('Validation Tests', () => {
    it('should validate required fields', async () => {
      // Arrange
      const testUser = authHelper.createTestUser();
      const incompleteData = {
        applicantId: faker.string.uuid(),
        // Missing vacancyId
      };

      // Act
      const { response } = await authHelper.authenticatedPost(
        '/applications',
        incompleteData,
        testUser,
      );

      // Assert
      expect(response.status).toBe(400);
      expect(mockApplicationService.create).not.toHaveBeenCalled();
    });

    it('should reject a non-string applicantId', async () => {
      // Arrange
      const testUser = authHelper.createTestUser();
      const invalidData = {
        ...validApplicationData,
        applicantId: 12345,
      };

      // Act
      const { response } = await authHelper.authenticatedPost(
        '/applications',
        invalidData,
        testUser,
      );

      // Assert
      expect(response.status).toBe(400);
      expect(mockApplicationService.create).not.toHaveBeenCalled();
    });

    it('should reject a non-string vacancyId', async () => {
      // Arrange
      const testUser = authHelper.createTestUser();
      const invalidData = {
        ...validApplicationData,
        vacancyId: 12345,
      };

      // Act
      const { response } = await authHelper.authenticatedPost(
        '/applications',
        invalidData,
        testUser,
      );

      // Assert
      expect(response.status).toBe(400);
      expect(mockApplicationService.create).not.toHaveBeenCalled();
    });

    it('should reject a non-string resume', async () => {
      // Arrange
      const testUser = authHelper.createTestUser();
      const invalidData = {
        ...validApplicationData,
        resume: 12345,
      };

      // Act
      const { response } = await authHelper.authenticatedPost(
        '/applications',
        invalidData,
        testUser,
      );

      // Assert
      expect(response.status).toBe(400);
      expect(mockApplicationService.create).not.toHaveBeenCalled();
    });

    it('should reject a non-string coverLetter', async () => {
      // Arrange
      const testUser = authHelper.createTestUser();
      const invalidData = {
        ...validApplicationData,
        coverLetter: 12345,
      };

      // Act
      const { response } = await authHelper.authenticatedPost(
        '/applications',
        invalidData,
        testUser,
      );

      // Assert
      expect(response.status).toBe(400);
      expect(mockApplicationService.create).not.toHaveBeenCalled();
    });
  });

  describe('User Context Tests', () => {
    it('should work with person user', async () => {
      // Arrange
      mockApplicationService.create.mockResolvedValue(mockApplicationResponse);
      const personUser = authHelper.createPersonUser();

      // Act
      const { response } = await authHelper.authenticatedPost(
        '/applications',
        validApplicationData,
        personUser,
      );

      // Assert
      expect(response.status).toBe(201);
      expect(mockApplicationService.create).toHaveBeenCalled();
    });

    it('should work with company user', async () => {
      // Arrange
      mockApplicationService.create.mockResolvedValue(mockApplicationResponse);
      const companyUser = authHelper.createCompanyUser();

      // Act
      const { response } = await authHelper.authenticatedPost(
        '/applications',
        validApplicationData,
        companyUser,
      );

      // Assert
      expect(response.status).toBe(201);
      expect(mockApplicationService.create).toHaveBeenCalled();
    });
  });

  describe('Error Handling Tests', () => {
    it('should handle duplicate application errors', async () => {
      // Arrange
      const conflictError = new ConflictException('Application already exists');
      mockApplicationService.create.mockRejectedValue(conflictError);
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedPost(
        '/applications',
        validApplicationData,
        testUser,
      );

      // Assert
      expect(response.status).toBe(409);
    });

    it('should handle vacancy not found errors', async () => {
      // Arrange
      const notFoundError = new NotFoundException('Vacancy not found');
      mockApplicationService.create.mockRejectedValue(notFoundError);
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedPost(
        '/applications',
        validApplicationData,
        testUser,
      );

      // Assert
      expect(response.status).toBe(404);
    });

    it('should handle generic service errors', async () => {
      // Arrange
      mockApplicationService.create.mockRejectedValue(new Error('Database error'));
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedPost(
        '/applications',
        validApplicationData,
        testUser,
      );

      // Assert
      expect(response.status).toBe(500);
    });
  });

  describe('Data Validation Tests', () => {
    it('should accept minimal required data', async () => {
      // Arrange
      const minimalData = {
        applicantId: faker.string.uuid(),
        vacancyId: faker.string.uuid(),
      };
      mockApplicationService.create.mockResolvedValue({
        ...mockApplicationResponse,
        ...minimalData,
      });
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedPost(
        '/applications',
        minimalData,
        testUser,
      );

      // Assert
      expect(response.status).toBe(201);
      expect(mockApplicationService.create).toHaveBeenCalledWith(minimalData);
    });

    it('should accept full application data', async () => {
      // Arrange
      const fullData = {
        ...validApplicationData,
        additionalInfo: faker.lorem.sentence(),
      };
      mockApplicationService.create.mockResolvedValue({
        ...mockApplicationResponse,
        ...fullData,
      });
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedPost('/applications', fullData, testUser);

      // Assert
      expect(response.status).toBe(201);
      expect(mockApplicationService.create).toHaveBeenCalledWith(fullData);
    });
  });

  describe('Status Values Tests', () => {
    it('should accept valid status values', async () => {
      // Arrange
      const validStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'WITHDRAWN'];
      mockApplicationService.create.mockResolvedValue(mockApplicationResponse);
      const testUser = authHelper.createTestUser();

      // Act & Assert
      for (const status of validStatuses) {
        const data = { ...validApplicationData, status };
        const { response } = await authHelper.authenticatedPost('/applications', data, testUser);
        expect(response.status).toBe(201);
        expect(mockApplicationService.create).toHaveBeenCalledWith(data);
        jest.clearAllMocks();
      }
    });
  });

  describe('Response Structure Tests', () => {
    it('should return created application with correct structure', async () => {
      // Arrange
      mockApplicationService.create.mockResolvedValue(mockApplicationResponse);
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedPost(
        '/applications',
        validApplicationData,
        testUser,
      );

      // Assert
      expect(response.body).toMatchObject({
        id: expect.any(String),
        applicantId: expect.any(String),
        vacancyId: expect.any(String),
        status: expect.any(String),
        appliedAt: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });

    it('should include provided cover letter in response', async () => {
      // Arrange
      const dataWithCoverLetter = {
        ...validApplicationData,
        coverLetter: faker.lorem.paragraphs(3),
      };
      const responseWithCoverLetter = {
        ...mockApplicationResponse,
        coverLetter: dataWithCoverLetter.coverLetter,
      };
      mockApplicationService.create.mockResolvedValue(responseWithCoverLetter);
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedPost(
        '/applications',
        dataWithCoverLetter,
        testUser,
      );

      // Assert
      expect(response.status).toBe(201);
      expect(response.body.coverLetter).toBe(dataWithCoverLetter.coverLetter);
    });
  });
});
