import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { faker } from '@faker-js/faker';
import {
  AuthHelper,
  createMockServices,
  expectUnauthorizedResponse,
} from '../../helpers/auth-helper';

// Import all controllers
import { UsersController } from '../../../src/domain/users/users.controller';
import {
  ApplicationController,
  ApplicantController,
} from '../../../src/domain/applications/application.controller';
import { DashboardController } from '../../../src/domain/dashboard/dashboard.controller';
import { CompanyController } from '../../../src/domain/companies/company.controller';
import {
  RecruitmentController,
  ActivitiesController,
} from '../../../src/domain/recruitment/recruitment.controller';
import { ProcessTemplateController } from '../../../src/domain/templates/process-template.controller';

// Import service interfaces
import { UsersServiceInterface } from '../../../src/domain/users/interfaces/user.service.interface';
import { ApplicationServiceInterface } from '../../../src/domain/applications/interfaces/application.service.interface';
import { DashboardServiceInterface } from '../../../src/domain/dashboard/interfaces/dashboard.service.interface';
import { CompanyService } from '../../../src/domain/companies/interfaces/company.service.interface';
import { RecruitmentServiceInterface } from '../../../src/domain/recruitment/interfaces/recruitment.service.interface';
import { ProcessTemplateService } from '../../../src/domain/templates/interfaces/process-template.service.interface';

describe('Unauthorized Access Tests (e2e) - All Protected Routes', () => {
  let app: INestApplication;
  let authHelper: AuthHelper;

  // Mock services - minimal implementation since we only test unauthorized access
  const mockServices = createMockServices();

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: 'test-secret',
          signOptions: { expiresIn: '1h' },
        }),
      ],
      controllers: [
        UsersController,
        ApplicationController,
        ApplicantController,
        DashboardController,
        CompanyController,
        RecruitmentController,
        ActivitiesController,
        ProcessTemplateController,
      ],
      providers: [
        { provide: UsersServiceInterface, useValue: mockServices.mockUsersService },
        {
          provide: ApplicationServiceInterface,
          useValue: mockServices.mockApplicationService,
        },
        { provide: DashboardServiceInterface, useValue: mockServices.mockDashboardService },
        { provide: CompanyService, useValue: mockServices.mockCompanyService },
        {
          provide: RecruitmentServiceInterface,
          useValue: mockServices.mockRecruitmentService,
        },
        { provide: ProcessTemplateService, useValue: mockServices.mockProcessTemplateService },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    authHelper = new AuthHelper(app);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Users Controller - Unauthorized Access', () => {
    const testRoutes = [
      { method: 'get' as const, path: '/users', description: 'List Users' },
      { method: 'get' as const, path: '/users/me', description: 'Get Current User' },
      { method: 'post' as const, path: '/users', description: 'Activate User' },
      {
        method: 'put' as const,
        path: `/users/${faker.string.uuid()}`,
        description: 'Update User (PUT)',
      },
      {
        method: 'patch' as const,
        path: `/users/${faker.string.uuid()}`,
        description: 'Update User (PATCH)',
      },
    ];

    testRoutes.forEach(({ method, path, description }) => {
      it(`should return 401 for ${description} without authentication`, async () => {
        const response = await authHelper.unauthenticatedRequest(method, path);
        expectUnauthorizedResponse(response);
      });

      it(`should return 401 for ${description} with invalid token`, async () => {
        const response = await authHelper.invalidTokenRequest(method, path);
        expectUnauthorizedResponse(response);
      });

      it(`should return 401 for ${description} with expired token`, async () => {
        const response = await authHelper.expiredTokenRequest(method, path);
        expectUnauthorizedResponse(response);
      });
    });
  });

  describe('Applications Controller - Unauthorized Access', () => {
    const applicationId = faker.string.uuid();
    const applicantId = faker.string.uuid();

    const testRoutes = [
      { method: 'get' as const, path: '/applications', description: 'List Applications' },
      {
        method: 'get' as const,
        path: `/applications/${applicationId}`,
        description: 'Get Application',
      },
      { method: 'post' as const, path: '/applications', description: 'Create Application' },
      {
        method: 'put' as const,
        path: `/applications/${applicationId}`,
        description: 'Update Application',
      },
      {
        method: 'delete' as const,
        path: `/applications/${applicationId}`,
        description: 'Delete Application',
      },
      {
        method: 'get' as const,
        path: `/applicants/${applicantId}/applications`,
        description: 'Get Applications by Applicant',
      },
    ];

    testRoutes.forEach(({ method, path, description }) => {
      it(`should return 401 for ${description} without authentication`, async () => {
        const response = await authHelper.unauthenticatedRequest(method, path);
        expectUnauthorizedResponse(response);
      });

      it(`should return 401 for ${description} with invalid token`, async () => {
        const response = await authHelper.invalidTokenRequest(method, path);
        expectUnauthorizedResponse(response);
      });

      it(`should return 401 for ${description} with expired token`, async () => {
        const response = await authHelper.expiredTokenRequest(method, path);
        expectUnauthorizedResponse(response);
      });
    });
  });

  describe('Dashboard Controller - Unauthorized Access', () => {
    const companyId = faker.string.uuid();

    const testRoutes = [
      { method: 'get' as const, path: '/dashboard/stats', description: 'General Stats' },
      {
        method: 'get' as const,
        path: `/dashboard/company/${companyId}/stats`,
        description: 'Company Stats',
      },
      {
        method: 'get' as const,
        path: '/dashboard/recent-applications',
        description: 'Recent Applications',
      },
      { method: 'get' as const, path: '/dashboard/top-vacancies', description: 'Top Vacancies' },
      {
        method: 'get' as const,
        path: '/dashboard/applications-by-status',
        description: 'Applications by Status',
      },
      {
        method: 'get' as const,
        path: '/dashboard/monthly-applications',
        description: 'Monthly Applications',
      },
    ];

    testRoutes.forEach(({ method, path, description }) => {
      it(`should return 401 for ${description} without authentication`, async () => {
        const response = await authHelper.unauthenticatedRequest(method, path);
        expectUnauthorizedResponse(response);
      });

      it(`should return 401 for ${description} with invalid token`, async () => {
        const response = await authHelper.invalidTokenRequest(method, path);
        expectUnauthorizedResponse(response);
      });

      it(`should return 401 for ${description} with expired token`, async () => {
        const response = await authHelper.expiredTokenRequest(method, path);
        expectUnauthorizedResponse(response);
      });
    });
  });

  describe('Companies Controller - Unauthorized Access', () => {
    const companyId = faker.string.uuid();
    const companyName = 'test-company';

    const testRoutes = [
      { method: 'get' as const, path: '/companies', description: 'List Companies' },
      { method: 'get' as const, path: `/companies/${companyId}`, description: 'Get Company' },
      {
        method: 'get' as const,
        path: `/companies/${companyId}/vacancies`,
        description: 'Get Company Vacancies',
      },
      {
        method: 'get' as const,
        path: `/companies/${companyId}/users`,
        description: 'Get Company Users',
      },
      {
        method: 'get' as const,
        path: `/companies/${companyId}/statistics`,
        description: 'Get Company Statistics',
      },
      {
        method: 'get' as const,
        path: `/companies/${companyId}/addresses`,
        description: 'Get Company Addresses',
      },
      { method: 'post' as const, path: '/companies', description: 'Create Company' },
      { method: 'put' as const, path: `/companies/${companyId}`, description: 'Update Company' },
      { method: 'delete' as const, path: `/companies/${companyId}`, description: 'Delete Company' },
      {
        method: 'put' as const,
        path: `/companies/${companyId}/status`,
        description: 'Set Company Status',
      },
      {
        method: 'get' as const,
        path: `/companies/check/exists/${companyName}`,
        description: 'Check Company Exists',
      },
    ];

    testRoutes.forEach(({ method, path, description }) => {
      it(`should return 401 for ${description} without authentication`, async () => {
        const response = await authHelper.unauthenticatedRequest(method, path);
        expectUnauthorizedResponse(response);
      });

      it(`should return 401 for ${description} with invalid token`, async () => {
        const response = await authHelper.invalidTokenRequest(method, path);
        expectUnauthorizedResponse(response);
      });

      it(`should return 401 for ${description} with expired token`, async () => {
        const response = await authHelper.expiredTokenRequest(method, path);
        expectUnauthorizedResponse(response);
      });
    });
  });

  describe('Recruitment Controller - Unauthorized Access', () => {
    const processId = faker.string.uuid();

    const testRoutes = [
      {
        method: 'get' as const,
        path: '/recruitment-processes',
        description: 'Get Recruitment Processes',
      },
      {
        method: 'get' as const,
        path: `/recruitment-processes/${processId}`,
        description: 'Get Recruitment Process',
      },
      { method: 'get' as const, path: '/activities/recent', description: 'Get Recent Activities' },
    ];

    testRoutes.forEach(({ method, path, description }) => {
      it(`should return 401 for ${description} without authentication`, async () => {
        const response = await authHelper.unauthenticatedRequest(method, path);
        expectUnauthorizedResponse(response);
      });

      it(`should return 401 for ${description} with invalid token`, async () => {
        const response = await authHelper.invalidTokenRequest(method, path);
        expectUnauthorizedResponse(response);
      });

      it(`should return 401 for ${description} with expired token`, async () => {
        const response = await authHelper.expiredTokenRequest(method, path);
        expectUnauthorizedResponse(response);
      });
    });
  });

  describe('Process Templates Controller - Unauthorized Access', () => {
    const templateId = faker.string.uuid();

    const testRoutes = [
      { method: 'get' as const, path: '/process-templates', description: 'Find All Templates' },
      {
        method: 'get' as const,
        path: '/process-templates/defaults',
        description: 'Get Default Templates',
      },
      {
        method: 'get' as const,
        path: `/process-templates/${templateId}`,
        description: 'Get Template',
      },
      { method: 'post' as const, path: '/process-templates', description: 'Create Template' },
      {
        method: 'put' as const,
        path: `/process-templates/${templateId}`,
        description: 'Update Template',
      },
      {
        method: 'delete' as const,
        path: `/process-templates/${templateId}`,
        description: 'Delete Template',
      },
      {
        method: 'post' as const,
        path: `/process-templates/${templateId}/duplicate`,
        description: 'Duplicate Template',
      },
    ];

    testRoutes.forEach(({ method, path, description }) => {
      it(`should return 401 for ${description} without authentication`, async () => {
        const response = await authHelper.unauthenticatedRequest(method, path);
        expectUnauthorizedResponse(response);
      });

      it(`should return 401 for ${description} with invalid token`, async () => {
        const response = await authHelper.invalidTokenRequest(method, path);
        expectUnauthorizedResponse(response);
      });

      it(`should return 401 for ${description} with expired token`, async () => {
        const response = await authHelper.expiredTokenRequest(method, path);
        expectUnauthorizedResponse(response);
      });
    });
  });

  describe('Edge Cases - Security Tests', () => {
    it('should reject malformed JWT tokens', async () => {
      const response = await authHelper
        .unauthenticatedRequest('get', '/users')
        .set('Authorization', 'Bearer malformed.jwt.token');
      expectUnauthorizedResponse(response);
    });

    it('should reject empty Bearer token', async () => {
      const response = await authHelper
        .unauthenticatedRequest('get', '/users')
        .set('Authorization', 'Bearer ');
      expectUnauthorizedResponse(response);
    });

    it('should reject non-Bearer authorization schemes', async () => {
      const response = await authHelper
        .unauthenticatedRequest('get', '/users')
        .set('Authorization', 'Basic dXNlcjpwYXNz');
      expectUnauthorizedResponse(response);
    });

    it('should reject authorization header without Bearer prefix', async () => {
      const response = await authHelper
        .unauthenticatedRequest('get', '/users')
        .set('Authorization', 'some-token-123');
      expectUnauthorizedResponse(response);
    });

    it('should handle requests with multiple authorization headers', async () => {
      const response = await authHelper
        .unauthenticatedRequest('get', '/users')
        .set('Authorization', 'Bearer token1')
        .set('Authorization', 'Bearer token2');
      expectUnauthorizedResponse(response);
    });
  });

  describe('Service Methods Not Called on Unauthorized Access', () => {
    beforeEach(() => {
      // Reset all mock calls before each test
      Object.values(mockServices).forEach((service) => {
        Object.values(service).forEach((method) => {
          if (jest.isMockFunction(method)) {
            method.mockClear();
          }
        });
      });
    });

    it('should not call any service methods when unauthorized', async () => {
      // Test various endpoints
      await authHelper.unauthenticatedRequest('get', '/users');
      await authHelper.unauthenticatedRequest('get', '/applications');
      await authHelper.unauthenticatedRequest('get', '/dashboard/stats');
      await authHelper.unauthenticatedRequest('get', '/companies');
      await authHelper.unauthenticatedRequest('get', '/recruitment-processes');
      await authHelper.unauthenticatedRequest('get', '/process-templates');

      // Verify no service methods were called
      Object.values(mockServices).forEach((service) => {
        Object.values(service).forEach((method) => {
          if (jest.isMockFunction(method)) {
            expect(method).not.toHaveBeenCalled();
          }
        });
      });
    });

    it('should not call any service methods with invalid tokens', async () => {
      // Test various endpoints with invalid tokens
      await authHelper.invalidTokenRequest('get', '/users');
      await authHelper.invalidTokenRequest('get', '/applications');
      await authHelper.invalidTokenRequest('get', '/dashboard/stats');
      await authHelper.invalidTokenRequest('get', '/companies');
      await authHelper.invalidTokenRequest('get', '/recruitment-processes');
      await authHelper.invalidTokenRequest('get', '/process-templates');

      // Verify no service methods were called
      Object.values(mockServices).forEach((service) => {
        Object.values(service).forEach((method) => {
          if (jest.isMockFunction(method)) {
            expect(method).not.toHaveBeenCalled();
          }
        });
      });
    });
  });
});
