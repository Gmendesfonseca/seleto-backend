import { JwtService } from '@nestjs/jwt';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { faker } from '@faker-js/faker';

export interface TestUser {
  id: string;
  username: string;
  email: string;
  type: 'PERSON' | 'COMPANY';
  companyId?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export class AuthHelper {
  private readonly jwtService: JwtService;
  private readonly app: INestApplication;

  constructor(app: INestApplication) {
    this.app = app;
    this.jwtService = app.get(JwtService);
  }

  /**
   * Creates a test user with default or provided properties
   */
  createTestUser(overrides?: Partial<TestUser>): TestUser {
    return {
      id: faker.string.uuid(),
      username: faker.internet.username({ firstName: 'test' }),
      email: faker.internet.email({ firstName: 'test' }),
      type: 'PERSON',
      status: 'ACTIVE',
      ...overrides,
    };
  }

  /**
   * Generates JWT tokens for a test user
   */
  generateTokens(user: TestUser): AuthTokens {
    const payload = {
      id: user.id,
      username: user.username,
      email: user.email,
      type: user.type,
      companyId: user.companyId,
      status: user.status,
      sub: user.id,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET || 'test-secret',
      expiresIn: '1h',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'test-refresh-secret',
      expiresIn: '7d',
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 3600, // 1 hour
    };
  }

  /**
   * Creates an authenticated request with bearer token
   */
  authenticatedRequest(
    method: 'get' | 'post' | 'put' | 'patch' | 'delete',
    endpoint: string,
    user?: TestUser,
  ) {
    const testUser = user || this.createTestUser();
    const tokens = this.generateTokens(testUser);

    const req = request(this.app.getHttpServer())[method](endpoint);
    req.set('Authorization', `Bearer ${tokens.accessToken}`);

    return { request: req, user: testUser, tokens };
  }

  /**
   * Creates an unauthenticated request (no bearer token)
   */
  unauthenticatedRequest(method: 'get' | 'post' | 'put' | 'patch' | 'delete', endpoint: string) {
    return request(this.app.getHttpServer())[method](endpoint);
  }

  /**
   * Creates a request with invalid bearer token
   */
  invalidTokenRequest(method: 'get' | 'post' | 'put' | 'patch' | 'delete', endpoint: string) {
    const req = request(this.app.getHttpServer())[method](endpoint);
    req.set('Authorization', 'Bearer invalid-token-123');
    return req;
  }

  /**
   * Creates a request with expired token
   */
  expiredTokenRequest(
    method: 'get' | 'post' | 'put' | 'patch' | 'delete',
    endpoint: string,
    user?: TestUser,
  ) {
    const testUser = user || this.createTestUser();

    const payload = {
      id: testUser.id,
      username: testUser.username,
      email: testUser.email,
      type: testUser.type,
      companyId: testUser.companyId,
      status: testUser.status,
      sub: testUser.id,
    };

    // Create an expired token (expired 1 hour ago)
    const expiredToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET || 'test-secret',
      expiresIn: '-1h',
    });

    const req = request(this.app.getHttpServer())[method](endpoint);
    req.set('Authorization', `Bearer ${expiredToken}`);
    return req;
  }

  /**
   * Creates a company user for testing company-specific routes
   */
  createCompanyUser(companyId?: string): TestUser {
    return this.createTestUser({
      type: 'COMPANY',
      companyId: companyId || faker.string.uuid(),
    });
  }

  /**
   * Creates a person user for testing person-specific routes
   */
  createPersonUser(): TestUser {
    return this.createTestUser({
      type: 'PERSON',
    });
  }

  /**
   * Helper to perform authenticated GET request and return the result
   */
  async authenticatedGet(endpoint: string, user?: TestUser) {
    const {
      request: req,
      user: testUser,
      tokens,
    } = this.authenticatedRequest('get', endpoint, user);
    const response = await req;
    return { response, user: testUser, tokens };
  }

  /**
   * Helper to perform authenticated POST request and return the result
   */
  async authenticatedPost(endpoint: string, data: any, user?: TestUser) {
    const {
      request: req,
      user: testUser,
      tokens,
    } = this.authenticatedRequest('post', endpoint, user);
    const response = await req.send(data);
    return { response, user: testUser, tokens };
  }

  /**
   * Helper to perform authenticated PUT request and return the result
   */
  async authenticatedPut(endpoint: string, data: any, user?: TestUser) {
    const {
      request: req,
      user: testUser,
      tokens,
    } = this.authenticatedRequest('put', endpoint, user);
    const response = await req.send(data);
    return { response, user: testUser, tokens };
  }

  /**
   * Helper to perform authenticated PATCH request and return the result
   */
  async authenticatedPatch(endpoint: string, data: any, user?: TestUser) {
    const {
      request: req,
      user: testUser,
      tokens,
    } = this.authenticatedRequest('patch', endpoint, user);
    const response = await req.send(data);
    return { response, user: testUser, tokens };
  }

  /**
   * Helper to perform authenticated DELETE request and return the result
   */
  async authenticatedDelete(endpoint: string, user?: TestUser) {
    const {
      request: req,
      user: testUser,
      tokens,
    } = this.authenticatedRequest('delete', endpoint, user);
    const response = await req;
    return { response, user: testUser, tokens };
  }
}

/**
 * Common test expectations for unauthorized access
 */
export const expectUnauthorizedResponse = (response: request.Response) => {
  expect(response.status).toBe(401);
  expect(response.body).toMatchObject({
    code: 401,
    icTrace: expect.any(String),
    message: expect.stringMatching(/Auth|Token|Invalid/i),
  });
};

/**
 * Mock services for testing
 */
export const createMockServices = () => ({
  mockUsersService: {
    findAll: jest.fn(),
    findOne: jest.fn(),
    activate: jest.fn(),
    changeEmail: jest.fn(),
    updateUsername: jest.fn(),
    updateUser: jest.fn(),
    delete: jest.fn(),
  },
  mockApplicationService: {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  },
  mockDashboardService: {
    getStats: jest.fn(),
    getCompanyStats: jest.fn(),
    getRecentApplications: jest.fn(),
    getTopVacancies: jest.fn(),
    getApplicationsByStatus: jest.fn(),
    getMonthlyApplications: jest.fn(),
  },
  mockCompanyService: {
    findAll: jest.fn(),
    findById: jest.fn(),
    getVacancies: jest.fn(),
    getUsers: jest.fn(),
    getStatistics: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    setActiveStatus: jest.fn(),
    existsByName: jest.fn(),
  },
  mockRecruitmentService: {
    findAll: jest.fn(),
    findOne: jest.fn(),
    getRecentActivities: jest.fn(),
  },
  mockProcessTemplateService: {
    findAll: jest.fn(),
    getDefaults: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    duplicate: jest.fn(),
  },
  mockAuthService: {
    signIn: jest.fn(),
    signUp: jest.fn(),
    forgotPassword: jest.fn(),
    checkSecretKey: jest.fn(),
    resetPassword: jest.fn(),
    refreshToken: jest.fn(),
    logout: jest.fn(),
  },
});
