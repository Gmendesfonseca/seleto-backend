import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthHelper, expectUnauthorizedResponse } from '../../helpers/auth-helper';
import { UsersController } from '../../../src/domain/users/users.controller';
import { UsersServiceInterface } from '../../../src/domain/users/interfaces/user.service.interface';
import { authGuardProvider } from '../../helpers/auth-guard.provider';
import { createUsersServiceMock } from '../../helpers/e2e-users-mocks';

describe('Users Controller - GET /users/me (e2e)', () => {
  let app: INestApplication;
  let authHelper: AuthHelper;
  let mockUsersService: any;

  beforeAll(async () => {
    mockUsersService = createUsersServiceMock();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: 'test-secret',
          signOptions: { expiresIn: '1h' },
        }),
      ],
      controllers: [UsersController],
      providers: [
        authGuardProvider,
        {
          provide: UsersServiceInterface,
          useValue: mockUsersService,
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
    it('should return 401 when not authenticated', async () => {
      const response = await authHelper.unauthenticatedRequest('get', '/users/me');
      expectUnauthorizedResponse(response);
      expect(mockUsersService.findById).not.toHaveBeenCalled();
    });

    it('should return 401 with invalid token', async () => {
      const response = await authHelper.invalidTokenRequest('get', '/users/me');
      expectUnauthorizedResponse(response);
      expect(mockUsersService.findById).not.toHaveBeenCalled();
    });

    it('should return 401 with expired token', async () => {
      const response = await authHelper.expiredTokenRequest('get', '/users/me');
      expectUnauthorizedResponse(response);
      expect(mockUsersService.findById).not.toHaveBeenCalled();
    });
  });

  // The controller exposes no dedicated "current user" route: "me" is parsed as the :id param.
  describe('Missing Route Tests', () => {
    it.each([
      ['person', () => authHelper.createPersonUser()],
      ['company', () => authHelper.createCompanyUser()],
    ])('should reject /users/me as an invalid UUID for a %s user', async (_label, build) => {
      const { response } = await authHelper.authenticatedGet('/users/me', build());

      expect(response.status).toBe(400);
      expect(mockUsersService.findById).not.toHaveBeenCalled();
    });
  });
});
