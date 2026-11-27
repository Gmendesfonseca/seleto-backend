import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { faker } from '@faker-js/faker';
import {
  AuthHelper,
  expectUnauthorizedResponse,
  createMockServices,
} from '../../helpers/auth-helper';
import { CompanyController } from '../../../src/domain/companies/company.controller';
import { CompanyServiceInterface as CompanyService } from '../../../src/domain/companies/interfaces/company.service.interface';

describe('Companies Controller - GET /companies (e2e)', () => {
  let app: INestApplication;
  let authHelper: AuthHelper;
  let mockCompanyService: any;

  const mockCompaniesResponse = {
    data: [
      {
        id: faker.string.uuid(),
        name: faker.company.name(),
        cnpj: faker.string.numeric(14),
        email: faker.internet.email(),
        phone: faker.phone.number(),
        website: faker.internet.url(),
        description: faker.lorem.paragraph(),
        isActive: true,
        createdAt: faker.date.past().toISOString(),
        updatedAt: faker.date.recent().toISOString(),
      },
      {
        id: faker.string.uuid(),
        name: faker.company.name(),
        cnpj: faker.string.numeric(14),
        email: faker.internet.email(),
        phone: faker.phone.number(),
        website: faker.internet.url(),
        description: faker.lorem.paragraph(),
        isActive: false,
        createdAt: faker.date.past().toISOString(),
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
    const { mockCompanyService: mockService } = createMockServices();
    mockCompanyService = mockService;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: 'test-secret',
          signOptions: { expiresIn: '1h' },
        }),
      ],
      controllers: [CompanyController],
      providers: [
        {
          provide: CompanyService,
          useValue: mockCompanyService,
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
    it('should list companies when authenticated', async () => {
      // Arrange
      mockCompanyService.findAll.mockResolvedValue(mockCompaniesResponse);
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedGet('/companies', testUser);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockCompaniesResponse);
      expect(mockCompanyService.findAll).toHaveBeenCalled();
    });

    it('should return 401 when not authenticated', async () => {
      const response = await authHelper.unauthenticatedRequest('get', '/companies');
      expectUnauthorizedResponse(response);
      expect(mockCompanyService.findAll).not.toHaveBeenCalled();
    });

    it('should return 401 with invalid token', async () => {
      const response = await authHelper.invalidTokenRequest('get', '/companies');
      expectUnauthorizedResponse(response);
      expect(mockCompanyService.findAll).not.toHaveBeenCalled();
    });

    it('should return 401 with expired token', async () => {
      const response = await authHelper.expiredTokenRequest('get', '/companies');
      expectUnauthorizedResponse(response);
      expect(mockCompanyService.findAll).not.toHaveBeenCalled();
    });
  });

  describe('Pagination Tests', () => {
    it('should handle pagination parameters', async () => {
      // Arrange
      mockCompanyService.findAll.mockResolvedValue(mockCompaniesResponse);
      const testUser = authHelper.createTestUser();

      // Act
      await authHelper.authenticatedGet('/companies?page=2&limit=5', testUser);

      // Assert
      expect(mockCompanyService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          page: '2',
          limit: '5',
        }),
        undefined,
      );
    });

    it('should handle default pagination when not specified', async () => {
      // Arrange
      mockCompanyService.findAll.mockResolvedValue(mockCompaniesResponse);
      const testUser = authHelper.createTestUser();

      // Act
      await authHelper.authenticatedGet('/companies', testUser);

      // Assert
      expect(mockCompanyService.findAll).toHaveBeenCalledWith({}, undefined);
    });
  });

  describe('Search Parameters Tests', () => {
    it('should handle search query parameter', async () => {
      // Arrange
      mockCompanyService.findAll.mockResolvedValue(mockCompaniesResponse);
      const testUser = authHelper.createTestUser();

      // Act
      await authHelper.authenticatedGet('/companies?search=tech+company', testUser);

      // Assert
      expect(mockCompanyService.findAll).toHaveBeenCalledWith(
        { search: 'tech company' },
        undefined,
      );
    });

    it('should handle multiple query parameters', async () => {
      // Arrange
      mockCompanyService.findAll.mockResolvedValue(mockCompaniesResponse);
      const testUser = authHelper.createTestUser();

      // Act
      await authHelper.authenticatedGet(
        '/companies?page=1&limit=20&search=startup&sort=name',
        testUser,
      );

      // Assert
      expect(mockCompanyService.findAll).toHaveBeenCalledWith(
        {
          page: '1',
          limit: '20',
          search: 'startup',
          sort: 'name',
        },
        undefined,
      );
    });
  });

  describe('User Context Tests', () => {
    it('should work with person user', async () => {
      // Arrange
      mockCompanyService.findAll.mockResolvedValue(mockCompaniesResponse);
      const personUser = authHelper.createPersonUser();

      // Act
      const { response } = await authHelper.authenticatedGet('/companies', personUser);

      // Assert
      expect(response.status).toBe(200);
      expect(mockCompanyService.findAll).toHaveBeenCalled();
    });

    it('should work with company user', async () => {
      // Arrange
      mockCompanyService.findAll.mockResolvedValue(mockCompaniesResponse);
      const companyUser = authHelper.createCompanyUser();

      // Act
      const { response } = await authHelper.authenticatedGet('/companies', companyUser);

      // Assert
      expect(response.status).toBe(200);
      expect(mockCompanyService.findAll).toHaveBeenCalled();
    });
  });

  describe('Error Handling Tests', () => {
    it('should handle service errors gracefully', async () => {
      // Arrange
      mockCompanyService.findAll.mockRejectedValue(new Error('Database connection error'));
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedGet('/companies', testUser);

      // Assert
      expect(response.status).toBe(500);
    });

    it('should handle empty results', async () => {
      // Arrange
      const emptyResponse = {
        data: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
      };
      mockCompanyService.findAll.mockResolvedValue(emptyResponse);
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedGet('/companies', testUser);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]);
    });

    it('should handle invalid pagination parameters gracefully', async () => {
      // Arrange
      mockCompanyService.findAll.mockResolvedValue(mockCompaniesResponse);
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedGet(
        '/companies?page=invalid&limit=abc',
        testUser,
      );

      // Assert
      expect(response.status).toBe(200); // Service should handle invalid params gracefully
    });
  });

  describe('Response Structure Tests', () => {
    it('should return companies with correct structure', async () => {
      // Arrange
      mockCompanyService.findAll.mockResolvedValue(mockCompaniesResponse);
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedGet('/companies', testUser);

      // Assert
      expect(response.body).toMatchObject({
        data: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            name: expect.any(String),
            cnpj: expect.any(String),
            email: expect.any(String),
            isActive: expect.any(Boolean),
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
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

    it('should include optional fields when present', async () => {
      // Arrange
      const companiesWithOptionalFields = {
        ...mockCompaniesResponse,
        data: mockCompaniesResponse.data.map((company) => ({
          ...company,
          phone: faker.phone.number(),
          website: faker.internet.url(),
          description: faker.lorem.paragraph(),
        })),
      };
      mockCompanyService.findAll.mockResolvedValue(companiesWithOptionalFields);
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedGet('/companies', testUser);

      // Assert
      expect(response.body.data[0]).toHaveProperty('phone');
      expect(response.body.data[0]).toHaveProperty('website');
      expect(response.body.data[0]).toHaveProperty('description');
    });
  });

  describe('Service Integration Tests', () => {
    it('should call service with correct parameters for pagination and search', async () => {
      // Arrange
      mockCompanyService.findAll.mockResolvedValue(mockCompaniesResponse);
      const testUser = authHelper.createTestUser();

      // Act
      await authHelper.authenticatedGet('/companies?page=3&limit=15&search=technology', testUser);

      // Assert
      expect(mockCompanyService.findAll).toHaveBeenCalledWith(
        {
          page: '3',
          limit: '15',
          search: 'technology',
        },
        undefined,
      );
      expect(mockCompanyService.findAll).toHaveBeenCalledTimes(1);
    });

    it('should pass through service response unchanged', async () => {
      // Arrange
      const customResponse = {
        data: [
          {
            id: faker.string.uuid(),
            name: 'Custom Company',
            customField: 'customValue',
          },
        ],
        customMetadata: { additionalInfo: true },
      };
      mockCompanyService.findAll.mockResolvedValue(customResponse);
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedGet('/companies', testUser);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual(customResponse);
    });
  });

  describe('Performance Tests', () => {
    it('should handle concurrent requests', async () => {
      // Arrange
      mockCompanyService.findAll.mockResolvedValue(mockCompaniesResponse);
      const testUser = authHelper.createTestUser();
      const concurrentRequests = 5;

      // Act
      const promises = Array.from({ length: concurrentRequests }, () =>
        authHelper.authenticatedGet('/companies', testUser),
      );
      const responses = await Promise.all(promises);

      // Assert
      for (const { response } of responses) {
        expect(response.status).toBe(200);
      }
      expect(mockCompanyService.findAll).toHaveBeenCalledTimes(concurrentRequests);
    });
  });
});
