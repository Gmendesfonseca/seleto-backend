import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { faker } from '@faker-js/faker';
import { AuthHelper } from '../../helpers/auth-helper';
import { UsersController } from '../../../src/domain/users/users.controller';
import { UsersServiceInterface } from '../../../src/domain/users/interfaces/user.service.interface';
import { authGuardProvider } from '../../helpers/auth-guard.provider';
import { createUsersServiceMock } from '../../helpers/e2e-users-mocks';

describe('Users Controller - PATCH /users/:id (e2e)', () => {
  let app: INestApplication;
  let authHelper: AuthHelper;
  let mockUsersService: any;

  const userId = faker.string.uuid();
  const patchData = { username: faker.internet.username(), isVerified: false };

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

  // The controller exposes PUT /users/:id for updates and no PATCH route.
  describe('Missing Route Tests', () => {
    it('should return 404 for an authenticated PATCH', async () => {
      const { response } = await authHelper.authenticatedPatch(
        `/users/${userId}`,
        patchData,
        authHelper.createTestUser(),
      );

      expect(response.status).toBe(404);
      expect(mockUsersService.update).not.toHaveBeenCalled();
    });

    it('should return 404 for an unauthenticated PATCH', async () => {
      const response = await authHelper
        .unauthenticatedRequest('patch', `/users/${userId}`)
        .send(patchData);

      expect(response.status).toBe(404);
      expect(mockUsersService.update).not.toHaveBeenCalled();
    });
  });
});
