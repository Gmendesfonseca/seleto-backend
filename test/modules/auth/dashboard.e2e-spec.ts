import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { faker } from '@faker-js/faker';
import {
  AuthHelper,
  expectUnauthorizedResponse,
  createMockServices,
} from '../../helpers/auth-helper';
import { DashboardController } from '../../../src/domain/dashboard/dashboard.controller';
import { DashboardServiceInterface } from '../../../src/domain/dashboard/interfaces/dashboard.service.interface';

describe('Dashboard Controller (e2e) - Authorized Routes', () => {
  let app: INestApplication;
  let authHelper: AuthHelper;
  let mockDashboardService: any;

  // Test data
  const mockStats = {
    totalVacancies: faker.number.int({ min: 1, max: 100 }),
    totalApplications: faker.number.int({ min: 1, max: 500 }),
    activeProcesses: faker.number.int({ min: 1, max: 50 }),
    completedProcesses: faker.number.int({ min: 1, max: 30 }),
  };

  const mockCompanyStats = {
    ...mockStats,
    companyId: faker.string.uuid(),
    companyName: faker.company.name(),
  };

  const mockRecentApplications = [
    {
      id: faker.string.uuid(),
      applicantName: faker.person.fullName(),
      vacancyTitle: faker.lorem.words(3),
      appliedAt: faker.date.recent().toISOString(),
      status: 'PENDING',
    },
  ];

  const mockTopVacancies = [
    {
      id: faker.string.uuid(),
      title: faker.lorem.words(3),
      applicationsCount: faker.number.int({ min: 1, max: 50 }),
      viewsCount: faker.number.int({ min: 10, max: 200 }),
    },
  ];

  const mockApplicationsByStatus = {
    pending: faker.number.int({ min: 0, max: 50 }),
    approved: faker.number.int({ min: 0, max: 30 }),
    rejected: faker.number.int({ min: 0, max: 20 }),
    inProgress: faker.number.int({ min: 0, max: 25 }),
  };

  const mockMonthlyApplications = [
    { month: '2025-01', count: faker.number.int({ min: 1, max: 100 }) },
    { month: '2025-02', count: faker.number.int({ min: 1, max: 100 }) },
    { month: '2025-03', count: faker.number.int({ min: 1, max: 100 }) },
  ];

  beforeAll(async () => {
    const { mockDashboardService: mockService } = createMockServices();
    mockDashboardService = mockService;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: 'test-secret',
          signOptions: { expiresIn: '1h' },
        }),
      ],
      controllers: [DashboardController],
      providers: [
        {
          provide: DashboardServiceInterface,
          useValue: mockDashboardService,
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

  describe('GET /dashboard/stats (General Stats)', () => {
    it('should return general stats when authenticated', async () => {
      // Arrange
      mockDashboardService.getStats.mockResolvedValue(mockStats);
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedGet('/dashboard/stats', testUser);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockStats);
      expect(mockDashboardService.getStats).toHaveBeenCalledWith(undefined);
    });

    it('should pass filters when provided', async () => {
      // Arrange
      mockDashboardService.getStats.mockResolvedValue(mockStats);
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedGet(
        '/dashboard/stats?startDate=2025-01-01&endDate=2025-12-31',
        testUser,
      );

      // Assert
      expect(response.status).toBe(200);
      expect(mockDashboardService.getStats).toHaveBeenCalledWith({
        startDate: '2025-01-01',
        endDate: '2025-12-31',
      });
    });

    it('should return 401 when not authenticated', async () => {
      // Act
      const response = await authHelper.unauthenticatedRequest('get', '/dashboard/stats');

      // Assert
      expectUnauthorizedResponse(response);
      expect(mockDashboardService.getStats).not.toHaveBeenCalled();
    });

    it('should return 401 with invalid token', async () => {
      // Act
      const response = await authHelper.invalidTokenRequest('get', '/dashboard/stats');

      // Assert
      expectUnauthorizedResponse(response);
      expect(mockDashboardService.getStats).not.toHaveBeenCalled();
    });

    it('should return 401 with expired token', async () => {
      // Act
      const response = await authHelper.expiredTokenRequest('get', '/dashboard/stats');

      // Assert
      expectUnauthorizedResponse(response);
      expect(mockDashboardService.getStats).not.toHaveBeenCalled();
    });
  });

  describe('GET /dashboard/company/:companyId/stats (Company Stats)', () => {
    const companyId = faker.string.uuid();

    it('should return company stats when authenticated', async () => {
      // Arrange
      mockDashboardService.getCompanyStats.mockResolvedValue(mockCompanyStats);
      const testUser = authHelper.createCompanyUser(companyId);

      // Act
      const { response } = await authHelper.authenticatedGet(
        `/dashboard/company/${companyId}/stats`,
        testUser,
      );

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockCompanyStats);
      expect(mockDashboardService.getCompanyStats).toHaveBeenCalledWith(companyId, undefined);
    });

    it('should pass filters when provided', async () => {
      // Arrange
      mockDashboardService.getCompanyStats.mockResolvedValue(mockCompanyStats);
      const testUser = authHelper.createCompanyUser(companyId);

      // Act
      const { response } = await authHelper.authenticatedGet(
        `/dashboard/company/${companyId}/stats?year=2025&quarter=1`,
        testUser,
      );

      // Assert
      expect(response.status).toBe(200);
      expect(mockDashboardService.getCompanyStats).toHaveBeenCalledWith(companyId, {
        year: '2025',
        quarter: '1',
      });
    });

    it('should return 401 when not authenticated', async () => {
      // Act
      const response = await authHelper.unauthenticatedRequest(
        'get',
        `/dashboard/company/${companyId}/stats`,
      );

      // Assert
      expectUnauthorizedResponse(response);
      expect(mockDashboardService.getCompanyStats).not.toHaveBeenCalled();
    });

    it('should return 401 with invalid token', async () => {
      // Act
      const response = await authHelper.invalidTokenRequest(
        'get',
        `/dashboard/company/${companyId}/stats`,
      );

      // Assert
      expectUnauthorizedResponse(response);
      expect(mockDashboardService.getCompanyStats).not.toHaveBeenCalled();
    });
  });

  describe('GET /dashboard/recent-applications (Recent Applications)', () => {
    it('should return recent applications when authenticated', async () => {
      // Arrange
      mockDashboardService.getRecentApplications.mockResolvedValue(mockRecentApplications);
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedGet(
        '/dashboard/recent-applications',
        testUser,
      );

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockRecentApplications);
      expect(mockDashboardService.getRecentApplications).toHaveBeenCalledWith(10, undefined);
    });

    it('should handle limit and companyId parameters', async () => {
      // Arrange
      mockDashboardService.getRecentApplications.mockResolvedValue(mockRecentApplications);
      const testUser = authHelper.createTestUser();
      const companyId = faker.string.uuid();

      // Act
      const { response } = await authHelper.authenticatedGet(
        `/dashboard/recent-applications?limit=5&companyId=${companyId}`,
        testUser,
      );

      // Assert
      expect(response.status).toBe(200);
      expect(mockDashboardService.getRecentApplications).toHaveBeenCalledWith(5, companyId);
    });

    it('should return 401 when not authenticated', async () => {
      // Act
      const response = await authHelper.unauthenticatedRequest(
        'get',
        '/dashboard/recent-applications',
      );

      // Assert
      expectUnauthorizedResponse(response);
      expect(mockDashboardService.getRecentApplications).not.toHaveBeenCalled();
    });

    it('should return 401 with invalid token', async () => {
      // Act
      const response = await authHelper.invalidTokenRequest(
        'get',
        '/dashboard/recent-applications',
      );

      // Assert
      expectUnauthorizedResponse(response);
      expect(mockDashboardService.getRecentApplications).not.toHaveBeenCalled();
    });
  });

  describe('GET /dashboard/top-vacancies (Top Vacancies)', () => {
    it('should return top vacancies when authenticated', async () => {
      // Arrange
      mockDashboardService.getTopVacancies.mockResolvedValue(mockTopVacancies);
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedGet('/dashboard/top-vacancies', testUser);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockTopVacancies);
      expect(mockDashboardService.getTopVacancies).toHaveBeenCalledWith(10, undefined);
    });

    it('should handle limit and companyId parameters', async () => {
      // Arrange
      mockDashboardService.getTopVacancies.mockResolvedValue(mockTopVacancies);
      const testUser = authHelper.createTestUser();
      const companyId = faker.string.uuid();

      // Act
      const { response } = await authHelper.authenticatedGet(
        `/dashboard/top-vacancies?limit=20&companyId=${companyId}`,
        testUser,
      );

      // Assert
      expect(response.status).toBe(200);
      expect(mockDashboardService.getTopVacancies).toHaveBeenCalledWith(20, companyId);
    });

    it('should return 401 when not authenticated', async () => {
      // Act
      const response = await authHelper.unauthenticatedRequest('get', '/dashboard/top-vacancies');

      // Assert
      expectUnauthorizedResponse(response);
      expect(mockDashboardService.getTopVacancies).not.toHaveBeenCalled();
    });
  });

  describe('GET /dashboard/applications-by-status (Applications by Status)', () => {
    it('should return applications by status when authenticated', async () => {
      // Arrange
      mockDashboardService.getApplicationsByStatus.mockResolvedValue(mockApplicationsByStatus);
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedGet(
        '/dashboard/applications-by-status',
        testUser,
      );

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockApplicationsByStatus);
      expect(mockDashboardService.getApplicationsByStatus).toHaveBeenCalledWith(undefined);
    });

    it('should handle companyId parameter', async () => {
      // Arrange
      mockDashboardService.getApplicationsByStatus.mockResolvedValue(mockApplicationsByStatus);
      const testUser = authHelper.createTestUser();
      const companyId = faker.string.uuid();

      // Act
      const { response } = await authHelper.authenticatedGet(
        `/dashboard/applications-by-status?companyId=${companyId}`,
        testUser,
      );

      // Assert
      expect(response.status).toBe(200);
      expect(mockDashboardService.getApplicationsByStatus).toHaveBeenCalledWith(companyId);
    });

    it('should return 401 when not authenticated', async () => {
      // Act
      const response = await authHelper.unauthenticatedRequest(
        'get',
        '/dashboard/applications-by-status',
      );

      // Assert
      expectUnauthorizedResponse(response);
      expect(mockDashboardService.getApplicationsByStatus).not.toHaveBeenCalled();
    });
  });

  describe('GET /dashboard/monthly-applications (Monthly Applications)', () => {
    it('should return monthly applications when authenticated', async () => {
      // Arrange
      mockDashboardService.getMonthlyApplications.mockResolvedValue(mockMonthlyApplications);
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedGet(
        '/dashboard/monthly-applications',
        testUser,
      );

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockMonthlyApplications);
      expect(mockDashboardService.getMonthlyApplications).toHaveBeenCalledWith(6, undefined);
    });

    it('should handle months and companyId parameters', async () => {
      // Arrange
      mockDashboardService.getMonthlyApplications.mockResolvedValue(mockMonthlyApplications);
      const testUser = authHelper.createTestUser();
      const companyId = faker.string.uuid();

      // Act
      const { response } = await authHelper.authenticatedGet(
        `/dashboard/monthly-applications?months=12&companyId=${companyId}`,
        testUser,
      );

      // Assert
      expect(response.status).toBe(200);
      expect(mockDashboardService.getMonthlyApplications).toHaveBeenCalledWith(12, companyId);
    });

    it('should return 401 when not authenticated', async () => {
      // Act
      const response = await authHelper.unauthenticatedRequest(
        'get',
        '/dashboard/monthly-applications',
      );

      // Assert
      expectUnauthorizedResponse(response);
      expect(mockDashboardService.getMonthlyApplications).not.toHaveBeenCalled();
    });

    it('should return 401 with invalid token', async () => {
      // Act
      const response = await authHelper.invalidTokenRequest(
        'get',
        '/dashboard/monthly-applications',
      );

      // Assert
      expectUnauthorizedResponse(response);
      expect(mockDashboardService.getMonthlyApplications).not.toHaveBeenCalled();
    });
  });

  describe('Service Error Handling', () => {
    it('should handle service errors gracefully for authenticated requests', async () => {
      // Arrange
      mockDashboardService.getStats.mockRejectedValue(new Error('Database connection error'));
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedGet('/dashboard/stats', testUser);

      // Assert
      expect(response.status).toBe(500);
      expect(response.body.error).toBeDefined();
    });

    it('should handle NotFound errors for company stats', async () => {
      // Arrange
      const notFoundError = new Error('Company not found');
      notFoundError.name = 'NotFoundException';
      mockDashboardService.getCompanyStats.mockRejectedValue(notFoundError);
      const testUser = authHelper.createTestUser();
      const companyId = faker.string.uuid();

      // Act
      const { response } = await authHelper.authenticatedGet(
        `/dashboard/company/${companyId}/stats`,
        testUser,
      );

      // Assert
      expect(response.status).toBe(404);
    });
  });

  describe('Validation Tests', () => {
    it('should validate UUID format for company ID parameter', async () => {
      // Arrange
      const testUser = authHelper.createTestUser();
      const invalidId = 'invalid-uuid';

      // Act
      const { response } = await authHelper.authenticatedGet(
        `/dashboard/company/${invalidId}/stats`,
        testUser,
      );

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Validation failed');
    });

    it('should validate limit parameter ranges', async () => {
      // Arrange
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedGet(
        '/dashboard/recent-applications?limit=abc',
        testUser,
      );

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Validation failed');
    });

    it('should use default values for missing parameters', async () => {
      // Arrange
      mockDashboardService.getRecentApplications.mockResolvedValue(mockRecentApplications);
      const testUser = authHelper.createTestUser();

      // Act
      await authHelper.authenticatedGet('/dashboard/recent-applications', testUser);

      // Assert
      expect(mockDashboardService.getRecentApplications).toHaveBeenCalledWith(10, undefined);
    });
  });
});
