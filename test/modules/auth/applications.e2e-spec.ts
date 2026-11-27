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
import {
  ApplicationController,
  ApplicantController,
} from '../../../src/domain/applications/application.controller';
import { ApplicationServiceInterface } from '../../../src/domain/applications/interfaces/application.service.interface';

describe('Applications Controller (e2e) - Authorized Routes', () => {
  let app: INestApplication;
  let authHelper: AuthHelper;
  let mockApplicationService: any;

  // Test data
  const mockApplication = {
    id: faker.string.uuid(),
    applicantId: faker.string.uuid(),
    vacancyId: faker.string.uuid(),
    status: 'PENDING',
    appliedAt: faker.date.past().toISOString(),
    createdAt: faker.date.past().toISOString(),
    updatedAt: faker.date.recent().toISOString(),
  };

  const mockApplicationsListResponse = {
    data: [mockApplication],
    total: 1,
    page: 1,
    limit: 10,
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
      controllers: [ApplicationController, ApplicantController],
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

  describe('ApplicationController', () => {
    describe('GET /applications (List Applications)', () => {
      it('should return applications list when authenticated', async () => {
        // Arrange
        mockApplicationService.findAll.mockResolvedValue(mockApplicationsListResponse);
        const testUser = authHelper.createTestUser();

        // Act
        const { response } = await authHelper.authenticatedGet('/applications', testUser);

        // Assert
        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockApplicationsListResponse);
        expect(mockApplicationService.findAll).toHaveBeenCalledWith({
          applicantId: undefined,
          vacancyId: undefined,
          status: undefined,
          dateFrom: undefined,
          dateTo: undefined,
        });
      });

      it('should handle query parameters when authenticated', async () => {
        // Arrange
        mockApplicationService.findAll.mockResolvedValue(mockApplicationsListResponse);
        const testUser = authHelper.createTestUser();
        const applicantId = faker.string.uuid();
        const vacancyId = faker.string.uuid();

        // Act
        const { response } = await authHelper.authenticatedGet(
          `/applications?applicantId=${applicantId}&vacancyId=${vacancyId}&status=approved`,
          testUser,
        );

        // Assert
        expect(response.status).toBe(200);
        expect(mockApplicationService.findAll).toHaveBeenCalledWith({
          applicantId,
          vacancyId,
          status: 'approved',
          dateFrom: undefined,
          dateTo: undefined,
        });
      });

      it('should return 401 when not authenticated', async () => {
        // Act
        const response = await authHelper.unauthenticatedRequest('get', '/applications');

        // Assert
        expectUnauthorizedResponse(response);
        expect(mockApplicationService.findAll).not.toHaveBeenCalled();
      });

      it('should return 401 with invalid token', async () => {
        // Act
        const response = await authHelper.invalidTokenRequest('get', '/applications');

        // Assert
        expectUnauthorizedResponse(response);
        expect(mockApplicationService.findAll).not.toHaveBeenCalled();
      });

      it('should return 401 with expired token', async () => {
        // Act
        const response = await authHelper.expiredTokenRequest('get', '/applications');

        // Assert
        expectUnauthorizedResponse(response);
        expect(mockApplicationService.findAll).not.toHaveBeenCalled();
      });
    });

    describe('GET /applications/:id (Get Application)', () => {
      const applicationId = faker.string.uuid();

      it('should return application when authenticated', async () => {
        // Arrange
        mockApplicationService.findOne.mockResolvedValue(mockApplication);
        const testUser = authHelper.createTestUser();

        // Act
        const { response } = await authHelper.authenticatedGet(
          `/applications/${applicationId}`,
          testUser,
        );

        // Assert
        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockApplication);
        expect(mockApplicationService.findOne).toHaveBeenCalledWith(applicationId);
      });

      it('should return 401 when not authenticated', async () => {
        // Act
        const response = await authHelper.unauthenticatedRequest(
          'get',
          `/applications/${applicationId}`,
        );

        // Assert
        expectUnauthorizedResponse(response);
        expect(mockApplicationService.findOne).not.toHaveBeenCalled();
      });

      it('should return 401 with invalid token', async () => {
        // Act
        const response = await authHelper.invalidTokenRequest(
          'get',
          `/applications/${applicationId}`,
        );

        // Assert
        expectUnauthorizedResponse(response);
        expect(mockApplicationService.findOne).not.toHaveBeenCalled();
      });
    });

    describe('POST /applications (Create Application)', () => {
      const createApplicationDto = {
        applicantId: faker.string.uuid(),
        vacancyId: faker.string.uuid(),
        coverLetter: faker.lorem.paragraph(),
      };

      it('should create application when authenticated', async () => {
        // Arrange
        mockApplicationService.create.mockResolvedValue(mockApplication);
        const testUser = authHelper.createTestUser();

        // Act
        const { response } = await authHelper.authenticatedPost(
          '/applications',
          createApplicationDto,
          testUser,
        );

        // Assert
        expect(response.status).toBe(201);
        expect(response.body).toEqual(mockApplication);
        expect(mockApplicationService.create).toHaveBeenCalledWith(createApplicationDto);
      });

      it('should return 401 when not authenticated', async () => {
        // Act
        const response = await authHelper
          .unauthenticatedRequest('post', '/applications')
          .send(createApplicationDto);

        // Assert
        expectUnauthorizedResponse(response);
        expect(mockApplicationService.create).not.toHaveBeenCalled();
      });

      it('should return 401 with invalid token', async () => {
        // Act
        const response = await authHelper
          .invalidTokenRequest('post', '/applications')
          .send(createApplicationDto);

        // Assert
        expectUnauthorizedResponse(response);
        expect(mockApplicationService.create).not.toHaveBeenCalled();
      });
    });

    describe('PUT /applications/:id (Update Application)', () => {
      const applicationId = faker.string.uuid();
      const updateApplicationDto = {
        status: 'approved',
        coverLetter: faker.lorem.paragraph(),
      };

      it('should update application when authenticated', async () => {
        // Arrange
        mockApplicationService.update.mockResolvedValue({
          ...mockApplication,
          ...updateApplicationDto,
        });
        const testUser = authHelper.createTestUser();

        // Act
        const { response } = await authHelper.authenticatedPut(
          `/applications/${applicationId}`,
          updateApplicationDto,
          testUser,
        );

        // Assert
        expect(response.status).toBe(200);
        expect(response.body).toMatchObject(updateApplicationDto);
        expect(mockApplicationService.update).toHaveBeenCalledWith(
          applicationId,
          updateApplicationDto,
        );
      });

      it('should return 401 when not authenticated', async () => {
        // Act
        const response = await authHelper
          .unauthenticatedRequest('put', `/applications/${applicationId}`)
          .send(updateApplicationDto);

        // Assert
        expectUnauthorizedResponse(response);
        expect(mockApplicationService.update).not.toHaveBeenCalled();
      });

      it('should return 401 with invalid token', async () => {
        // Act
        const response = await authHelper
          .invalidTokenRequest('put', `/applications/${applicationId}`)
          .send(updateApplicationDto);

        // Assert
        expectUnauthorizedResponse(response);
        expect(mockApplicationService.update).not.toHaveBeenCalled();
      });
    });

    describe('DELETE /applications/:id (Delete Application)', () => {
      const applicationId = faker.string.uuid();

      it('should delete application when authenticated', async () => {
        // Arrange
        mockApplicationService.remove.mockResolvedValue(undefined);
        const testUser = authHelper.createTestUser();

        // Act
        const { response } = await authHelper.authenticatedDelete(
          `/applications/${applicationId}`,
          testUser,
        );

        // Assert
        expect(response.status).toBe(204);
        expect(mockApplicationService.remove).toHaveBeenCalledWith(applicationId);
      });

      it('should return 401 when not authenticated', async () => {
        // Act
        const response = await authHelper.unauthenticatedRequest(
          'delete',
          `/applications/${applicationId}`,
        );

        // Assert
        expectUnauthorizedResponse(response);
        expect(mockApplicationService.remove).not.toHaveBeenCalled();
      });

      it('should return 401 with invalid token', async () => {
        // Act
        const response = await authHelper.invalidTokenRequest(
          'delete',
          `/applications/${applicationId}`,
        );

        // Assert
        expectUnauthorizedResponse(response);
        expect(mockApplicationService.remove).not.toHaveBeenCalled();
      });
    });
  });

  describe('ApplicantController', () => {
    describe('GET /applicants/:applicantId/applications (Get Applications by Applicant)', () => {
      const applicantId = faker.string.uuid();

      it('should return applicant applications when authenticated', async () => {
        // Arrange
        mockApplicationService.findAll.mockResolvedValue(mockApplicationsListResponse);
        const testUser = authHelper.createTestUser();

        // Act
        const { response } = await authHelper.authenticatedGet(
          `/applicants/${applicantId}/applications`,
          testUser,
        );

        // Assert
        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockApplicationsListResponse);
        expect(mockApplicationService.findAll).toHaveBeenCalledWith({ applicantId });
      });

      it('should return 401 when not authenticated', async () => {
        // Act
        const response = await authHelper.unauthenticatedRequest(
          'get',
          `/applicants/${applicantId}/applications`,
        );

        // Assert
        expectUnauthorizedResponse(response);
        expect(mockApplicationService.findAll).not.toHaveBeenCalled();
      });

      it('should return 401 with invalid token', async () => {
        // Act
        const response = await authHelper.invalidTokenRequest(
          'get',
          `/applicants/${applicantId}/applications`,
        );

        // Assert
        expectUnauthorizedResponse(response);
        expect(mockApplicationService.findAll).not.toHaveBeenCalled();
      });

      it('should return 401 with expired token', async () => {
        // Act
        const response = await authHelper.expiredTokenRequest(
          'get',
          `/applicants/${applicantId}/applications`,
        );

        // Assert
        expectUnauthorizedResponse(response);
        expect(mockApplicationService.findAll).not.toHaveBeenCalled();
      });
    });
  });

  describe('Service Error Handling', () => {
    it('should handle service errors gracefully for authenticated requests', async () => {
      // Arrange
      mockApplicationService.findAll.mockRejectedValue(new Error('Database connection error'));
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedGet('/applications', testUser);

      // Assert
      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Internal server error');
    });

    it('should handle NotFoundException for findOne', async () => {
      // Arrange
      const notFoundError = new NotFoundException('Application not found');
      mockApplicationService.findOne.mockRejectedValue(notFoundError);
      const testUser = authHelper.createTestUser();
      const applicationId = faker.string.uuid();

      // Act
      const { response } = await authHelper.authenticatedGet(
        `/applications/${applicationId}`,
        testUser,
      );

      // Assert
      expect(response.status).toBe(404);
    });
  });

  describe('Validation Tests', () => {
    it('should pass a non-UUID application ID through to the service', async () => {
      // Arrange
      mockApplicationService.findOne.mockResolvedValue(mockApplication);
      const testUser = authHelper.createTestUser();
      const invalidId = 'invalid-uuid';

      // Act
      const { response } = await authHelper.authenticatedGet(
        `/applications/${invalidId}`,
        testUser,
      );

      // Assert
      expect(response.status).toBe(200);
      expect(mockApplicationService.findOne).toHaveBeenCalledWith(invalidId);
    });

    it('should validate required fields for application creation', async () => {
      // Arrange
      const testUser = authHelper.createTestUser();
      const invalidDto = {}; // Missing required fields

      // Act
      const { response } = await authHelper.authenticatedPost(
        '/applications',
        invalidDto,
        testUser,
      );

      // Assert
      expect(response.status).toBe(400);
    });

    it('should pass a non-UUID applicant ID through to the service', async () => {
      // Arrange
      mockApplicationService.findAll.mockResolvedValue(mockApplicationsListResponse);
      const testUser = authHelper.createTestUser();
      const invalidId = 'invalid-uuid';

      // Act
      const { response } = await authHelper.authenticatedGet(
        `/applicants/${invalidId}/applications`,
        testUser,
      );

      // Assert
      expect(response.status).toBe(200);
      expect(mockApplicationService.findAll).toHaveBeenCalledWith({ applicantId: invalidId });
    });
  });
});
