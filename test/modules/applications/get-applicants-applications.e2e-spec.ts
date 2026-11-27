import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, NotFoundException, ValidationPipe } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { faker } from '@faker-js/faker';
import {
  AuthHelper,
  expectUnauthorizedResponse,
  createMockServices,
} from '../../helpers/auth-helper';
import { authGuardProvider } from '../../helpers/auth-guard.provider';
import { ApplicantController } from '../../../src/domain/applications/application.controller';
import { ApplicationServiceInterface } from '../../../src/domain/applications/interfaces/application.service.interface';

describe('Applicants Controller - GET /applicants/:applicantId/applications (e2e)', () => {
  let app: INestApplication;
  let authHelper: AuthHelper;
  let mockApplicationService: any;

  const applicantId = faker.string.uuid();
  const mockApplicantApplicationsResponse = {
    data: [
      {
        id: faker.string.uuid(),
        applicantId,
        vacancyId: faker.string.uuid(),
        status: 'PENDING',
        appliedAt: faker.date.past().toISOString(),
        updatedAt: faker.date.recent().toISOString(),
      },
      {
        id: faker.string.uuid(),
        applicantId,
        vacancyId: faker.string.uuid(),
        status: 'APPROVED',
        appliedAt: faker.date.past().toISOString(),
        updatedAt: faker.date.recent().toISOString(),
      },
    ],
    pagination: {
      page: 1,
      limit: 10,
      total: 2,
      totalPages: 1,
    },
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
      controllers: [ApplicantController],
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
    it('should list applicant applications when authenticated', async () => {
      // Arrange
      mockApplicationService.findAll.mockResolvedValue(mockApplicantApplicationsResponse);
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedGet(
        `/applicants/${applicantId}/applications`,
        testUser,
      );

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockApplicantApplicationsResponse);
      expect(mockApplicationService.findAll).toHaveBeenCalledWith({ applicantId });
    });

    it('should return 401 when not authenticated', async () => {
      const response = await authHelper.unauthenticatedRequest(
        'get',
        `/applicants/${applicantId}/applications`,
      );
      expectUnauthorizedResponse(response);
      expect(mockApplicationService.findAll).not.toHaveBeenCalled();
    });

    it('should return 401 with invalid token', async () => {
      const response = await authHelper.invalidTokenRequest(
        'get',
        `/applicants/${applicantId}/applications`,
      );
      expectUnauthorizedResponse(response);
      expect(mockApplicationService.findAll).not.toHaveBeenCalled();
    });

    it('should return 401 with expired token', async () => {
      const response = await authHelper.expiredTokenRequest(
        'get',
        `/applicants/${applicantId}/applications`,
      );
      expectUnauthorizedResponse(response);
      expect(mockApplicationService.findAll).not.toHaveBeenCalled();
    });
  });

  describe('Validation Tests', () => {
    it('should pass a non-UUID applicantId through to the service', async () => {
      // Arrange
      const invalidApplicantId = 'not-a-uuid';
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedGet(
        `/applicants/${invalidApplicantId}/applications`,
        testUser,
      );

      // Assert
      expect(response.status).toBe(200);
      expect(mockApplicationService.findAll).toHaveBeenCalledWith({
        applicantId: invalidApplicantId,
      });
    });

    it('should require applicantId parameter', async () => {
      // Arrange
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedGet('/applicants//applications', testUser);

      // Assert
      expect(response.status).toBe(404); // Route not found
    });
  });

  describe('User Context Tests', () => {
    it('should work with person user', async () => {
      // Arrange
      mockApplicationService.findAll.mockResolvedValue(mockApplicantApplicationsResponse);
      const personUser = authHelper.createPersonUser();

      // Act
      const { response } = await authHelper.authenticatedGet(
        `/applicants/${applicantId}/applications`,
        personUser,
      );

      // Assert
      expect(response.status).toBe(200);
      expect(mockApplicationService.findAll).toHaveBeenCalledWith({ applicantId });
    });

    it('should work with company user', async () => {
      // Arrange
      mockApplicationService.findAll.mockResolvedValue(mockApplicantApplicationsResponse);
      const companyUser = authHelper.createCompanyUser();

      // Act
      const { response } = await authHelper.authenticatedGet(
        `/applicants/${applicantId}/applications`,
        companyUser,
      );

      // Assert
      expect(response.status).toBe(200);
      expect(mockApplicationService.findAll).toHaveBeenCalledWith({ applicantId });
    });
  });

  describe('Error Handling Tests', () => {
    it('should handle applicant not found', async () => {
      // Arrange
      const notFoundError = new NotFoundException('Applicant not found');
      mockApplicationService.findAll.mockRejectedValue(notFoundError);
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedGet(
        `/applicants/${applicantId}/applications`,
        testUser,
      );

      // Assert
      expect(response.status).toBe(404);
    });

    it('should handle service errors gracefully', async () => {
      // Arrange
      mockApplicationService.findAll.mockRejectedValue(new Error('Database error'));
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedGet(
        `/applicants/${applicantId}/applications`,
        testUser,
      );

      // Assert
      expect(response.status).toBe(500);
    });

    it('should handle empty applications list', async () => {
      // Arrange
      const emptyResponse = {
        data: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
      };
      mockApplicationService.findAll.mockResolvedValue(emptyResponse);
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedGet(
        `/applicants/${applicantId}/applications`,
        testUser,
      );

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]);
      expect(response.body.pagination.total).toBe(0);
    });
  });

  describe('Response Structure Tests', () => {
    it('should return applications with correct structure', async () => {
      // Arrange
      mockApplicationService.findAll.mockResolvedValue(mockApplicantApplicationsResponse);
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedGet(
        `/applicants/${applicantId}/applications`,
        testUser,
      );

      // Assert
      expect(response.body).toMatchObject({
        data: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            applicantId: expect.any(String),
            vacancyId: expect.any(String),
            status: expect.any(String),
            appliedAt: expect.any(String),
          }),
        ]),
        pagination: expect.objectContaining({
          page: expect.any(Number),
          limit: expect.any(Number),
          total: expect.any(Number),
          totalPages: expect.any(Number),
        }),
      });
    });

    it('should ensure all applications belong to the specified applicant', async () => {
      // Arrange
      mockApplicationService.findAll.mockResolvedValue(mockApplicantApplicationsResponse);
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedGet(
        `/applicants/${applicantId}/applications`,
        testUser,
      );

      // Assert
      expect(response.status).toBe(200);
      for (const application of response.body.data) {
        expect(application.applicantId).toBe(applicantId);
      }
    });
  });

  describe('Different Applicant Tests', () => {
    it('should handle different applicant IDs correctly', async () => {
      // Arrange
      const differentApplicantIds = [faker.string.uuid(), faker.string.uuid(), faker.string.uuid()];
      mockApplicationService.findAll.mockResolvedValue(mockApplicantApplicationsResponse);
      const testUser = authHelper.createTestUser();

      // Act & Assert
      for (const id of differentApplicantIds) {
        const { response } = await authHelper.authenticatedGet(
          `/applicants/${id}/applications`,
          testUser,
        );
        expect(response.status).toBe(200);
        expect(mockApplicationService.findAll).toHaveBeenCalledWith({ applicantId: id });
        jest.clearAllMocks();
      }
    });
  });

  describe('Service Integration Tests', () => {
    it('should call service with correct filter parameters', async () => {
      // Arrange
      mockApplicationService.findAll.mockResolvedValue(mockApplicantApplicationsResponse);
      const testUser = authHelper.createTestUser();

      // Act
      await authHelper.authenticatedGet(`/applicants/${applicantId}/applications`, testUser);

      // Assert
      expect(mockApplicationService.findAll).toHaveBeenCalledWith({
        applicantId,
      });
      expect(mockApplicationService.findAll).toHaveBeenCalledTimes(1);
    });

    it('should pass through service response unchanged', async () => {
      // Arrange
      const customResponse = {
        data: [
          {
            id: faker.string.uuid(),
            applicantId,
            vacancyId: faker.string.uuid(),
            status: 'WITHDRAWN',
            customField: 'customValue',
          },
        ],
        customMetadata: { additionalInfo: true },
      };
      mockApplicationService.findAll.mockResolvedValue(customResponse);
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedGet(
        `/applicants/${applicantId}/applications`,
        testUser,
      );

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual(customResponse);
    });
  });
});
