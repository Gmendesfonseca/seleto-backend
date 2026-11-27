import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { faker } from '@faker-js/faker';
import {
  AuthHelper,
  expectUnauthorizedResponse,
  createMockServices,
} from '../../helpers/auth-helper';
import { authGuardProvider } from '../../helpers/auth-guard.provider';
import {
  RecruitmentController,
  ActivitiesController,
} from '../../../src/domain/recruitment/recruitment.controller';
import { RecruitmentServiceInterface } from '../../../src/domain/recruitment/interfaces/recruitment.service.interface';

describe('Recruitment Controller (e2e) - Authorized Routes', () => {
  let app: INestApplication;
  let authHelper: AuthHelper;
  let mockRecruitmentService: any;

  // Test data
  const mockRecruitmentProcess = {
    id: faker.string.uuid(),
    companyId: faker.string.uuid(),
    recruiterId: faker.string.uuid(),
    vacancyId: faker.string.uuid(),
    status: 'ACTIVE',
    startDate: faker.date.past().toISOString(),
    createdAt: faker.date.past().toISOString(),
    updatedAt: faker.date.recent().toISOString(),
  };

  const mockRecruitmentProcesses = {
    data: [mockRecruitmentProcess],
    total: 1,
    page: 1,
    limit: 10,
  };

  const mockRecentActivities = [
    {
      id: faker.string.uuid(),
      type: 'APPLICATION_SUBMITTED',
      description: faker.lorem.sentence(),
      userId: faker.string.uuid(),
      processId: faker.string.uuid(),
      createdAt: faker.date.recent().toISOString(),
    },
    {
      id: faker.string.uuid(),
      type: 'STATUS_CHANGED',
      description: faker.lorem.sentence(),
      userId: faker.string.uuid(),
      processId: faker.string.uuid(),
      createdAt: faker.date.recent().toISOString(),
    },
  ];

  beforeAll(async () => {
    const { mockRecruitmentService: mockService } = createMockServices();
    mockRecruitmentService = mockService;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: 'test-secret',
          signOptions: { expiresIn: '1h' },
        }),
      ],
      controllers: [RecruitmentController, ActivitiesController],
      providers: [
        authGuardProvider,
        {
          provide: RecruitmentServiceInterface,
          useValue: mockRecruitmentService,
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

  describe('RecruitmentController', () => {
    describe('GET /recruitment-processes (Get Processes)', () => {
      it('should return recruitment processes when authenticated', async () => {
        // Arrange
        mockRecruitmentService.findAll.mockResolvedValue(mockRecruitmentProcesses);
        const testUser = authHelper.createTestUser();

        // Act
        const { response } = await authHelper.authenticatedGet('/recruitment-processes', testUser);

        // Assert
        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockRecruitmentProcesses);
        expect(mockRecruitmentService.findAll).toHaveBeenCalledWith({
          status: undefined,
          companyId: undefined,
          recruiterId: undefined,
          limit: 10,
          offset: 0,
        });
      });

      it('should handle query parameters when authenticated', async () => {
        // Arrange
        mockRecruitmentService.findAll.mockResolvedValue(mockRecruitmentProcesses);
        const testUser = authHelper.createTestUser();
        const companyId = faker.string.uuid();
        const recruiterId = faker.string.uuid();

        // Act
        const { response } = await authHelper.authenticatedGet(
          `/recruitment-processes?status=ACTIVE&companyId=${companyId}&recruiterId=${recruiterId}&limit=20&offset=5`,
          testUser,
        );

        // Assert
        expect(response.status).toBe(200);
        expect(mockRecruitmentService.findAll).toHaveBeenCalledWith({
          status: 'ACTIVE',
          companyId,
          recruiterId,
          limit: 20,
          offset: 5,
        });
      });

      it('should use default values for limit and offset', async () => {
        // Arrange
        mockRecruitmentService.findAll.mockResolvedValue(mockRecruitmentProcesses);
        const testUser = authHelper.createTestUser();

        // Act
        const { response } = await authHelper.authenticatedGet(
          '/recruitment-processes?status=COMPLETED',
          testUser,
        );

        // Assert
        expect(response.status).toBe(200);
        expect(mockRecruitmentService.findAll).toHaveBeenCalledWith({
          status: 'COMPLETED',
          companyId: undefined,
          recruiterId: undefined,
          limit: 10,
          offset: 0,
        });
      });

      it('should return 401 when not authenticated', async () => {
        // Act
        const response = await authHelper.unauthenticatedRequest('get', '/recruitment-processes');

        // Assert
        expectUnauthorizedResponse(response);
        expect(mockRecruitmentService.findAll).not.toHaveBeenCalled();
      });

      it('should return 401 with invalid token', async () => {
        // Act
        const response = await authHelper.invalidTokenRequest('get', '/recruitment-processes');

        // Assert
        expectUnauthorizedResponse(response);
        expect(mockRecruitmentService.findAll).not.toHaveBeenCalled();
      });

      it('should return 401 with expired token', async () => {
        // Act
        const response = await authHelper.expiredTokenRequest('get', '/recruitment-processes');

        // Assert
        expectUnauthorizedResponse(response);
        expect(mockRecruitmentService.findAll).not.toHaveBeenCalled();
      });
    });

    describe('GET /recruitment-processes/:id (Get Process)', () => {
      const processId = faker.string.uuid();

      it('should return recruitment process when authenticated', async () => {
        // Arrange
        mockRecruitmentService.findOne.mockResolvedValue(mockRecruitmentProcess);
        const testUser = authHelper.createTestUser();

        // Act
        const { response } = await authHelper.authenticatedGet(
          `/recruitment-processes/${processId}`,
          testUser,
        );

        // Assert
        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockRecruitmentProcess);
        expect(mockRecruitmentService.findOne).toHaveBeenCalledWith(processId);
      });

      it('should return 401 when not authenticated', async () => {
        // Act
        const response = await authHelper.unauthenticatedRequest(
          'get',
          `/recruitment-processes/${processId}`,
        );

        // Assert
        expectUnauthorizedResponse(response);
        expect(mockRecruitmentService.findOne).not.toHaveBeenCalled();
      });

      it('should return 401 with invalid token', async () => {
        // Act
        const response = await authHelper.invalidTokenRequest(
          'get',
          `/recruitment-processes/${processId}`,
        );

        // Assert
        expectUnauthorizedResponse(response);
        expect(mockRecruitmentService.findOne).not.toHaveBeenCalled();
      });

      it('should return 401 with expired token', async () => {
        // Act
        const response = await authHelper.expiredTokenRequest(
          'get',
          `/recruitment-processes/${processId}`,
        );

        // Assert
        expectUnauthorizedResponse(response);
        expect(mockRecruitmentService.findOne).not.toHaveBeenCalled();
      });
    });
  });

  describe('ActivitiesController', () => {
    describe('GET /activities/recent (Get Recent Activities)', () => {
      it('should return recent activities when authenticated', async () => {
        // Arrange
        mockRecruitmentService.getRecentActivities.mockResolvedValue(mockRecentActivities);
        const testUser = authHelper.createTestUser();

        // Act
        const { response } = await authHelper.authenticatedGet('/activities/recent', testUser);

        // Assert
        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockRecentActivities);
        expect(mockRecruitmentService.getRecentActivities).toHaveBeenCalledWith(10, undefined);
      });

      it('should handle limit and companyId parameters when authenticated', async () => {
        // Arrange
        mockRecruitmentService.getRecentActivities.mockResolvedValue(mockRecentActivities);
        const testUser = authHelper.createTestUser();
        const companyId = faker.string.uuid();

        // Act
        const { response } = await authHelper.authenticatedGet(
          `/activities/recent?limit=25&companyId=${companyId}`,
          testUser,
        );

        // Assert
        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockRecentActivities);
        expect(mockRecruitmentService.getRecentActivities).toHaveBeenCalledWith(25, companyId);
      });

      it('should use default limit value when not provided', async () => {
        // Arrange
        mockRecruitmentService.getRecentActivities.mockResolvedValue(mockRecentActivities);
        const testUser = authHelper.createTestUser();
        const companyId = faker.string.uuid();

        // Act
        const { response } = await authHelper.authenticatedGet(
          `/activities/recent?companyId=${companyId}`,
          testUser,
        );

        // Assert
        expect(response.status).toBe(200);
        expect(mockRecruitmentService.getRecentActivities).toHaveBeenCalledWith(10, companyId);
      });

      it('should return 401 when not authenticated', async () => {
        // Act
        const response = await authHelper.unauthenticatedRequest('get', '/activities/recent');

        // Assert
        expectUnauthorizedResponse(response);
        expect(mockRecruitmentService.getRecentActivities).not.toHaveBeenCalled();
      });

      it('should return 401 with invalid token', async () => {
        // Act
        const response = await authHelper.invalidTokenRequest('get', '/activities/recent');

        // Assert
        expectUnauthorizedResponse(response);
        expect(mockRecruitmentService.getRecentActivities).not.toHaveBeenCalled();
      });

      it('should return 401 with expired token', async () => {
        // Act
        const response = await authHelper.expiredTokenRequest('get', '/activities/recent');

        // Assert
        expectUnauthorizedResponse(response);
        expect(mockRecruitmentService.getRecentActivities).not.toHaveBeenCalled();
      });
    });
  });

  describe('Service Error Handling', () => {
    it('should handle service errors gracefully for recruitment processes', async () => {
      // Arrange
      mockRecruitmentService.findAll.mockRejectedValue(new Error('Database connection error'));
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedGet('/recruitment-processes', testUser);

      // Assert
      expect(response.status).toBe(500);
      expect(response.body.error).toBeDefined();
    });

    it('should handle NotFoundException for findOne', async () => {
      // Arrange
      const notFoundError = new Error('Process not found');
      notFoundError.name = 'NotFoundException';
      mockRecruitmentService.findOne.mockRejectedValue(notFoundError);
      const testUser = authHelper.createTestUser();
      const processId = faker.string.uuid();

      // Act
      const { response } = await authHelper.authenticatedGet(
        `/recruitment-processes/${processId}`,
        testUser,
      );

      // Assert
      expect(response.status).toBe(404);
    });

    it('should handle service errors for recent activities', async () => {
      // Arrange
      mockRecruitmentService.getRecentActivities.mockRejectedValue(
        new Error('Service unavailable'),
      );
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedGet('/activities/recent', testUser);

      // Assert
      expect(response.status).toBe(500);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('Validation Tests', () => {
    it('should validate UUID format for process ID parameter', async () => {
      // Arrange
      const testUser = authHelper.createTestUser();
      const invalidId = 'invalid-uuid';

      // Act
      const { response } = await authHelper.authenticatedGet(
        `/recruitment-processes/${invalidId}`,
        testUser,
      );

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Validation failed');
    });

    it('should validate limit parameter type for recruitment processes', async () => {
      // Arrange
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedGet(
        '/recruitment-processes?limit=invalid',
        testUser,
      );

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Validation failed');
    });

    it('should validate offset parameter type for recruitment processes', async () => {
      // Arrange
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedGet(
        '/recruitment-processes?offset=invalid',
        testUser,
      );

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Validation failed');
    });

    it('should validate limit parameter type for activities', async () => {
      // Arrange
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedGet(
        '/activities/recent?limit=invalid',
        testUser,
      );

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Validation failed');
    });

    it('should validate UUID format for companyId parameter', async () => {
      // Arrange
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedGet(
        '/recruitment-processes?companyId=invalid-uuid',
        testUser,
      );

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Validation failed');
    });
  });

  describe('Authorization Context Tests', () => {
    it('should work with company user for recruitment processes', async () => {
      // Arrange
      mockRecruitmentService.findAll.mockResolvedValue(mockRecruitmentProcesses);
      const companyUser = authHelper.createCompanyUser();

      // Act
      const { response } = await authHelper.authenticatedGet('/recruitment-processes', companyUser);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockRecruitmentProcesses);
    });

    it('should work with person user for activities', async () => {
      // Arrange
      mockRecruitmentService.getRecentActivities.mockResolvedValue(mockRecentActivities);
      const personUser = authHelper.createPersonUser();

      // Act
      const { response } = await authHelper.authenticatedGet('/activities/recent', personUser);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockRecentActivities);
    });
  });
});
