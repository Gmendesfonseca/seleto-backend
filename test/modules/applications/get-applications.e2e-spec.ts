import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { faker } from '@faker-js/faker';
import {
  AuthHelper,
  expectUnauthorizedResponse,
  createMockServices,
} from '../../helpers/auth-helper';
import { ApplicationController } from '../../../src/domain/applications/application.controller';
import { ApplicationServiceInterface } from '../../../src/domain/applications/interfaces/application.service.interface';

describe('Applications Controller - GET /applications (e2e)', () => {
  let app: INestApplication;
  let authHelper: AuthHelper;
  let mockApplicationService: any;

  const mockApplicationsResponse = {
    data: [
      {
        id: faker.string.uuid(),
        applicantId: faker.string.uuid(),
        vacancyId: faker.string.uuid(),
        status: 'PENDING',
        appliedAt: faker.date.past().toISOString(),
        updatedAt: faker.date.recent().toISOString(),
      },
      {
        id: faker.string.uuid(),
        applicantId: faker.string.uuid(),
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
      controllers: [ApplicationController],
      providers: [
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
    it('should list applications when authenticated', async () => {
      // Arrange
      mockApplicationService.findAll.mockResolvedValue(mockApplicationsResponse);
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedGet('/applications', testUser);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockApplicationsResponse);
      expect(mockApplicationService.findAll).toHaveBeenCalledWith({
        applicantId: undefined,
        vacancyId: undefined,
        status: undefined,
        dateFrom: undefined,
        dateTo: undefined,
      });
    });

    it('should return 401 when not authenticated', async () => {
      const response = await authHelper.unauthenticatedRequest('get', '/applications');
      expectUnauthorizedResponse(response);
      expect(mockApplicationService.findAll).not.toHaveBeenCalled();
    });

    it('should return 401 with invalid token', async () => {
      const response = await authHelper.invalidTokenRequest('get', '/applications');
      expectUnauthorizedResponse(response);
      expect(mockApplicationService.findAll).not.toHaveBeenCalled();
    });

    it('should return 401 with expired token', async () => {
      const response = await authHelper.expiredTokenRequest('get', '/applications');
      expectUnauthorizedResponse(response);
      expect(mockApplicationService.findAll).not.toHaveBeenCalled();
    });
  });

  describe('Query Parameters Tests', () => {
    it('should handle applicantId filter', async () => {
      // Arrange
      mockApplicationService.findAll.mockResolvedValue(mockApplicationsResponse);
      const testUser = authHelper.createTestUser();
      const applicantId = faker.string.uuid();

      // Act
      await authHelper.authenticatedGet(`/applications?applicantId=${applicantId}`, testUser);

      // Assert
      expect(mockApplicationService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          applicantId,
        }),
      );
    });

    it('should handle vacancyId filter', async () => {
      // Arrange
      mockApplicationService.findAll.mockResolvedValue(mockApplicationsResponse);
      const testUser = authHelper.createTestUser();
      const vacancyId = faker.string.uuid();

      // Act
      await authHelper.authenticatedGet(`/applications?vacancyId=${vacancyId}`, testUser);

      // Assert
      expect(mockApplicationService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          vacancyId,
        }),
      );
    });

    it('should handle status filter', async () => {
      // Arrange
      mockApplicationService.findAll.mockResolvedValue(mockApplicationsResponse);
      const testUser = authHelper.createTestUser();

      // Act
      await authHelper.authenticatedGet('/applications?status=PENDING', testUser);

      // Assert
      expect(mockApplicationService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'PENDING',
        }),
      );
    });

    it('should handle date range filters', async () => {
      // Arrange
      mockApplicationService.findAll.mockResolvedValue(mockApplicationsResponse);
      const testUser = authHelper.createTestUser();
      const dateFrom = '2024-01-01';
      const dateTo = '2024-12-31';

      // Act
      await authHelper.authenticatedGet(
        `/applications?dateFrom=${dateFrom}&dateTo=${dateTo}`,
        testUser,
      );

      // Assert
      expect(mockApplicationService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          dateFrom,
          dateTo,
        }),
      );
    });

    it('should handle multiple filters combined', async () => {
      // Arrange
      mockApplicationService.findAll.mockResolvedValue(mockApplicationsResponse);
      const testUser = authHelper.createTestUser();
      const applicantId = faker.string.uuid();
      const vacancyId = faker.string.uuid();

      // Act
      await authHelper.authenticatedGet(
        `/applications?applicantId=${applicantId}&vacancyId=${vacancyId}&status=APPROVED&dateFrom=2024-01-01`,
        testUser,
      );

      // Assert
      expect(mockApplicationService.findAll).toHaveBeenCalledWith({
        applicantId,
        vacancyId,
        status: 'APPROVED',
        dateFrom: '2024-01-01',
        dateTo: undefined,
      });
    });
  });

  describe('User Context Tests', () => {
    it('should work with person user', async () => {
      // Arrange
      mockApplicationService.findAll.mockResolvedValue(mockApplicationsResponse);
      const personUser = authHelper.createPersonUser();

      // Act
      const { response } = await authHelper.authenticatedGet('/applications', personUser);

      // Assert
      expect(response.status).toBe(200);
      expect(mockApplicationService.findAll).toHaveBeenCalled();
    });

    it('should work with company user', async () => {
      // Arrange
      mockApplicationService.findAll.mockResolvedValue(mockApplicationsResponse);
      const companyUser = authHelper.createCompanyUser();

      // Act
      const { response } = await authHelper.authenticatedGet('/applications', companyUser);

      // Assert
      expect(response.status).toBe(200);
      expect(mockApplicationService.findAll).toHaveBeenCalled();
    });
  });

  describe('Error Handling Tests', () => {
    it('should handle service errors gracefully', async () => {
      // Arrange
      mockApplicationService.findAll.mockRejectedValue(new Error('Database error'));
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedGet('/applications', testUser);

      // Assert
      expect(response.status).toBe(500);
    });

    it('should handle empty results', async () => {
      // Arrange
      const emptyResponse = {
        data: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
      };
      mockApplicationService.findAll.mockResolvedValue(emptyResponse);
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedGet('/applications', testUser);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]);
    });
  });

  describe('Response Structure Tests', () => {
    it('should return applications with correct structure', async () => {
      // Arrange
      mockApplicationService.findAll.mockResolvedValue(mockApplicationsResponse);
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedGet('/applications', testUser);

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
  });

  describe('Status Filter Values Tests', () => {
    it('should handle valid status values', async () => {
      // Arrange
      const validStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'WITHDRAWN'];
      mockApplicationService.findAll.mockResolvedValue(mockApplicationsResponse);
      const testUser = authHelper.createTestUser();

      // Act & Assert
      for (const status of validStatuses) {
        const { response } = await authHelper.authenticatedGet(
          `/applications?status=${status}`,
          testUser,
        );
        expect(response.status).toBe(200);
        expect(mockApplicationService.findAll).toHaveBeenCalledWith(
          expect.objectContaining({ status }),
        );
        jest.clearAllMocks();
      }
    });
  });

  describe('Date Format Tests', () => {
    it('should handle various date formats', async () => {
      // Arrange
      mockApplicationService.findAll.mockResolvedValue(mockApplicationsResponse);
      const testUser = authHelper.createTestUser();
      const validDates = ['2024-01-01', '2024-12-31T23:59:59Z', '2024-06-15T10:30:00.000Z'];

      // Act & Assert
      for (const date of validDates) {
        const { response } = await authHelper.authenticatedGet(
          `/applications?dateFrom=${encodeURIComponent(date)}`,
          testUser,
        );
        expect(response.status).toBe(200);
        jest.clearAllMocks();
      }
    });
  });
});
