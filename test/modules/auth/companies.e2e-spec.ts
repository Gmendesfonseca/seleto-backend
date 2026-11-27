import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, NotFoundException, ValidationPipe } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { faker } from '@faker-js/faker';
import {
  AuthHelper,
  expectUnauthorizedResponse,
} from '../../helpers/auth-helper';
import { authGuardProvider } from '../../helpers/auth-guard.provider';
import { CompanyController } from '../../../src/domain/companies/company.controller';
import { CompanyServiceInterface as CompanyService } from '../../../src/domain/companies/interfaces/company.service.interface';

describe('Companies Controller (e2e) - Authorized Routes', () => {
  let app: INestApplication;
  let authHelper: AuthHelper;
  let mockCompanyService: any;

  // Test data
  const mockCompany = {
    id: faker.string.uuid(),
    name: faker.company.name(),
    email: faker.internet.email(),
    website: faker.internet.url(),
    description: faker.lorem.paragraph(),
    isActive: true,
    createdAt: faker.date.past().toISOString(),
    updatedAt: faker.date.recent().toISOString(),
  };

  const mockCompaniesListResponse = {
    data: [mockCompany],
    total: 1,
    page: 1,
    limit: 10,
  };

  const mockCompanyVacancies = [
    {
      id: faker.string.uuid(),
      title: faker.lorem.words(3),
      description: faker.lorem.paragraph(),
      status: 'ACTIVE',
      area: faker.lorem.word(),
    },
  ];

  const mockCompanyUsers = [
    {
      id: faker.string.uuid(),
      username: faker.internet.username(),
      email: faker.internet.email(),
      type: 'COMPANY',
      status: 'ACTIVE',
    },
  ];

  const mockCompanyStatistics = {
    totalVacancies: faker.number.int({ min: 1, max: 50 }),
    activeVacancies: faker.number.int({ min: 1, max: 30 }),
    totalApplications: faker.number.int({ min: 10, max: 200 }),
    totalEmployees: faker.number.int({ min: 5, max: 100 }),
  };

  beforeAll(async () => {
    mockCompanyService = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findVacancies: jest.fn(),
      statistics: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      setActiveStatus: jest.fn(),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: 'test-secret',
          signOptions: { expiresIn: '1h' },
        }),
      ],
      controllers: [CompanyController],
      providers: [
        authGuardProvider,
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

  describe('GET /companies (List Companies)', () => {
    it('should return companies list when authenticated', async () => {
      // Arrange
      mockCompanyService.findAll.mockResolvedValue(mockCompaniesListResponse);
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedGet('/companies', testUser);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockCompaniesListResponse);
      expect(mockCompanyService.findAll).toHaveBeenCalled();
    });

    it('should handle pagination and search parameters when authenticated', async () => {
      // Arrange
      mockCompanyService.findAll.mockResolvedValue(mockCompaniesListResponse);
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedGet(
        '/companies?page=2&limit=5&search=tech',
        testUser,
      );

      // Assert
      expect(response.status).toBe(200);
      const query = { page: '2', limit: '5', search: 'tech' };
      expect(mockCompanyService.findAll).toHaveBeenCalledWith(query, query);
    });

    it('should return 401 when not authenticated', async () => {
      // Act
      const response = await authHelper.unauthenticatedRequest('get', '/companies');

      // Assert
      expectUnauthorizedResponse(response);
      expect(mockCompanyService.findAll).not.toHaveBeenCalled();
    });

    it('should return 401 with invalid token', async () => {
      // Act
      const response = await authHelper.invalidTokenRequest('get', '/companies');

      // Assert
      expectUnauthorizedResponse(response);
      expect(mockCompanyService.findAll).not.toHaveBeenCalled();
    });

    it('should return 401 with expired token', async () => {
      // Act
      const response = await authHelper.expiredTokenRequest('get', '/companies');

      // Assert
      expectUnauthorizedResponse(response);
      expect(mockCompanyService.findAll).not.toHaveBeenCalled();
    });
  });

  describe('GET /companies/:id (Get Company)', () => {
    const companyId = faker.string.uuid();

    it('should return company when authenticated', async () => {
      // Arrange
      mockCompanyService.findById.mockResolvedValue(mockCompany);
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedGet(`/companies/${companyId}`, testUser);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockCompany);
      expect(mockCompanyService.findById).toHaveBeenCalledWith(companyId);
    });

    it('should return 401 when not authenticated', async () => {
      // Act
      const response = await authHelper.unauthenticatedRequest('get', `/companies/${companyId}`);

      // Assert
      expectUnauthorizedResponse(response);
      expect(mockCompanyService.findById).not.toHaveBeenCalled();
    });

    it('should return 401 with invalid token', async () => {
      // Act
      const response = await authHelper.invalidTokenRequest('get', `/companies/${companyId}`);

      // Assert
      expectUnauthorizedResponse(response);
      expect(mockCompanyService.findById).not.toHaveBeenCalled();
    });
  });

  describe('GET /companies/:id/vacancies (Get Company Vacancies)', () => {
    const companyId = faker.string.uuid();

    it('should return company vacancies when authenticated', async () => {
      // Arrange
      mockCompanyService.findVacancies.mockResolvedValue(mockCompanyVacancies);
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedGet(
        `/companies/${companyId}/vacancies`,
        testUser,
      );

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockCompanyVacancies);
      expect(mockCompanyService.findVacancies).toHaveBeenCalledWith(companyId, {
        status: undefined,
        area: undefined,
        page: undefined,
        limit: undefined,
      });
    });

    it('should handle query parameters when authenticated', async () => {
      // Arrange
      mockCompanyService.findVacancies.mockResolvedValue(mockCompanyVacancies);
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedGet(
        `/companies/${companyId}/vacancies?status=ACTIVE&area=tech&page=1&limit=10`,
        testUser,
      );

      // Assert
      expect(response.status).toBe(200);
      expect(mockCompanyService.findVacancies).toHaveBeenCalledWith(companyId, {
        status: 'ACTIVE',
        area: 'tech',
        page: '1',
        limit: '10',
      });
    });

    it('should return 401 when not authenticated', async () => {
      // Act
      const response = await authHelper.unauthenticatedRequest(
        'get',
        `/companies/${companyId}/vacancies`,
      );

      // Assert
      expectUnauthorizedResponse(response);
      expect(mockCompanyService.findVacancies).not.toHaveBeenCalled();
    });
  });

  describe('GET /companies/:id/users (removed route)', () => {
    const companyId = faker.string.uuid();

    it('should not expose the route to authenticated users', async () => {
      // Act
      const { response } = await authHelper.authenticatedGet(
        `/companies/${companyId}/users`,
        authHelper.createTestUser(),
      );

      // Assert
      expect(response.status).toBe(404);
    });

    it('should not expose the route with query parameters', async () => {
      // Act
      const { response } = await authHelper.authenticatedGet(
        `/companies/${companyId}/users?type=ADMIN&status=ACTIVE&page=1&limit=5`,
        authHelper.createTestUser(),
      );

      // Assert
      expect(response.status).toBe(404);
    });

    it('should not expose the route to unauthenticated requests', async () => {
      // Act
      const response = await authHelper.unauthenticatedRequest(
        'get',
        `/companies/${companyId}/users`,
      );

      // Assert
      expect(response.status).toBe(404);
    });
  });

  describe('GET /companies/:id/statistics (Get Company Statistics)', () => {
    const companyId = faker.string.uuid();

    it('should return company statistics when authenticated', async () => {
      // Arrange
      mockCompanyService.statistics.mockResolvedValue(mockCompanyStatistics);
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedGet(
        `/companies/${companyId}/statistics`,
        testUser,
      );

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockCompanyStatistics);
      expect(mockCompanyService.statistics).toHaveBeenCalledWith(companyId);
    });

    it('should return 401 when not authenticated', async () => {
      // Act
      const response = await authHelper.unauthenticatedRequest(
        'get',
        `/companies/${companyId}/statistics`,
      );

      // Assert
      expectUnauthorizedResponse(response);
      expect(mockCompanyService.statistics).not.toHaveBeenCalled();
    });
  });

  describe('GET /companies/:id/addresses (Get Company Addresses)', () => {
    const companyId = faker.string.uuid();

    it('should return company addresses when authenticated', async () => {
      // Arrange
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedGet(
        `/companies/${companyId}/addresses`,
        testUser,
      );

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should return 401 when not authenticated', async () => {
      // Act
      const response = await authHelper.unauthenticatedRequest(
        'get',
        `/companies/${companyId}/addresses`,
      );

      // Assert
      expectUnauthorizedResponse(response);
    });
  });

  describe('POST /companies (Create Company)', () => {
    const createCompanyDto = {
      name: faker.company.name(),
      email: faker.internet.email(),
      website: faker.internet.url(),
      description: faker.lorem.paragraph(),
    };

    it('should create company when authenticated', async () => {
      // Arrange
      mockCompanyService.create.mockResolvedValue(mockCompany);
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedPost(
        '/companies',
        createCompanyDto,
        testUser,
      );

      // Assert
      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockCompany);
      expect(mockCompanyService.create).toHaveBeenCalledWith(createCompanyDto);
    });

    it('should return 401 when not authenticated', async () => {
      // Act
      const response = await authHelper
        .unauthenticatedRequest('post', '/companies')
        .send(createCompanyDto);

      // Assert
      expectUnauthorizedResponse(response);
      expect(mockCompanyService.create).not.toHaveBeenCalled();
    });

    it('should return 401 with invalid token', async () => {
      // Act
      const response = await authHelper
        .invalidTokenRequest('post', '/companies')
        .send(createCompanyDto);

      // Assert
      expectUnauthorizedResponse(response);
      expect(mockCompanyService.create).not.toHaveBeenCalled();
    });
  });

  describe('PUT /companies/:id (Update Company)', () => {
    const companyId = faker.string.uuid();
    const updateCompanyDto = {
      name: faker.company.name(),
      email: faker.internet.email(),
      description: faker.lorem.paragraph(),
    };

    it('should update company when authenticated', async () => {
      // Arrange
      mockCompanyService.update.mockResolvedValue({ ...mockCompany, ...updateCompanyDto });
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedPut(
        `/companies/${companyId}`,
        updateCompanyDto,
        testUser,
      );

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject(updateCompanyDto);
      expect(mockCompanyService.update).toHaveBeenCalledWith(companyId, updateCompanyDto);
    });

    it('should return 401 when not authenticated', async () => {
      // Act
      const response = await authHelper
        .unauthenticatedRequest('put', `/companies/${companyId}`)
        .send(updateCompanyDto);

      // Assert
      expectUnauthorizedResponse(response);
      expect(mockCompanyService.update).not.toHaveBeenCalled();
    });

    it('should return 401 with invalid token', async () => {
      // Act
      const response = await authHelper
        .invalidTokenRequest('put', `/companies/${companyId}`)
        .send(updateCompanyDto);

      // Assert
      expectUnauthorizedResponse(response);
      expect(mockCompanyService.update).not.toHaveBeenCalled();
    });
  });

  describe('DELETE /companies/:id (Delete Company)', () => {
    const companyId = faker.string.uuid();

    it('should delete company when authenticated', async () => {
      // Arrange
      mockCompanyService.delete.mockResolvedValue(undefined);
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedDelete(
        `/companies/${companyId}`,
        testUser,
      );

      // Assert
      expect(response.status).toBe(204);
      expect(mockCompanyService.delete).toHaveBeenCalledWith(companyId);
    });

    it('should return 401 when not authenticated', async () => {
      // Act
      const response = await authHelper.unauthenticatedRequest('delete', `/companies/${companyId}`);

      // Assert
      expectUnauthorizedResponse(response);
      expect(mockCompanyService.delete).not.toHaveBeenCalled();
    });

    it('should return 401 with invalid token', async () => {
      // Act
      const response = await authHelper.invalidTokenRequest('delete', `/companies/${companyId}`);

      // Assert
      expectUnauthorizedResponse(response);
      expect(mockCompanyService.delete).not.toHaveBeenCalled();
    });
  });

  describe('PUT /companies/:id/status (Set Active Status)', () => {
    const companyId = faker.string.uuid();

    it('should set company active status when authenticated', async () => {
      // Arrange
      mockCompanyService.setActiveStatus.mockResolvedValue(undefined);
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedPut(
        `/companies/${companyId}/status`,
        { isActive: true },
        testUser,
      );

      // Assert
      expect(response.status).toBe(200);
      expect(mockCompanyService.setActiveStatus).toHaveBeenCalledWith(companyId, true);
    });

    it('should return 401 when not authenticated', async () => {
      // Act
      const response = await authHelper
        .unauthenticatedRequest('put', `/companies/${companyId}/status`)
        .send({ isActive: false });

      // Assert
      expectUnauthorizedResponse(response);
      expect(mockCompanyService.setActiveStatus).not.toHaveBeenCalled();
    });
  });

  describe('GET /companies/check/exists/:name (removed route)', () => {
    const companyName = 'test-company';

    it('should not expose the route to authenticated users', async () => {
      // Act
      const { response } = await authHelper.authenticatedGet(
        `/companies/check/exists/${companyName}`,
        authHelper.createTestUser(),
      );

      // Assert
      expect(response.status).toBe(404);
    });

    it('should not expose the route to unauthenticated requests', async () => {
      // Act
      const response = await authHelper.unauthenticatedRequest(
        'get',
        `/companies/check/exists/${companyName}`,
      );

      // Assert
      expect(response.status).toBe(404);
    });
  });

  describe('Service Error Handling', () => {
    it('should handle service errors gracefully for authenticated requests', async () => {
      // Arrange
      mockCompanyService.findAll.mockRejectedValue(new Error('Database connection error'));
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedGet('/companies', testUser);

      // Assert
      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Internal server error');
    });

    it('should handle NotFoundException for findById', async () => {
      // Arrange
      const notFoundError = new NotFoundException('Company not found');
      mockCompanyService.findById.mockRejectedValue(notFoundError);
      const testUser = authHelper.createTestUser();
      const companyId = faker.string.uuid();

      // Act
      const { response } = await authHelper.authenticatedGet(`/companies/${companyId}`, testUser);

      // Assert
      expect(response.status).toBe(404);
    });
  });

  describe('Validation Tests', () => {
    it('should pass a non-UUID company ID through to the service', async () => {
      // Arrange
      mockCompanyService.findById.mockResolvedValue(mockCompany);
      const testUser = authHelper.createTestUser();
      const invalidId = 'invalid-uuid';

      // Act
      const { response } = await authHelper.authenticatedGet(`/companies/${invalidId}`, testUser);

      // Assert
      expect(response.status).toBe(200);
      expect(mockCompanyService.findById).toHaveBeenCalledWith(invalidId);
    });

    it('should pass the creation body through without field validation', async () => {
      // Arrange
      mockCompanyService.create.mockResolvedValue(mockCompany);
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedPost('/companies', {}, testUser);

      // Assert
      expect(response.status).toBe(201);
      expect(mockCompanyService.create).toHaveBeenCalledWith({});
    });
  });
});
