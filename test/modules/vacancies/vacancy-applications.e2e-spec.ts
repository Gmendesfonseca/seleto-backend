import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, NotFoundException, ValidationPipe } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { faker } from '@faker-js/faker';
import { AuthHelper, expectUnauthorizedResponse } from '../../helpers/auth-helper';
import { authGuardProvider } from '../../helpers/auth-guard.provider';
import { VacancyApplicationController } from '../../../src/domain/vacancies/vacancy-application.controller';
import { VacancyApplicationServiceInterface } from '../../../src/domain/vacancies/interfaces/vacancy-application.service.interface';

describe('Vacancy applications and stats (e2e)', () => {
  let app: INestApplication;
  let authHelper: AuthHelper;
  const service = { list: jest.fn(), stats: jest.fn() };
  const vacancyId = faker.string.uuid();
  const companyId = faker.string.uuid();
  const page = { data: [], meta: { currentPage: 1, lastPage: 1, perPage: 0, total: 0 } };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [JwtModule.register({ secret: 'test-secret', signOptions: { expiresIn: '1h' } })],
      controllers: [VacancyApplicationController],
      providers: [
        authGuardProvider,
        { provide: VacancyApplicationServiceInterface, useValue: service },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true, errorHttpStatusCode: 422 }));
    await app.init();
    authHelper = new AuthHelper(app);
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('GET /vacancies/:id/applications answers the page scoped to the token company', async () => {
    service.list.mockResolvedValue(page);
    const { response } = await authHelper.authenticatedGet(
      `/vacancies/${vacancyId}/applications`,
      authHelper.createCompanyUser(companyId),
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual(page);
    expect(service.list).toHaveBeenCalledWith(vacancyId, companyId);
  });

  it('GET /vacancies/:id/stats answers the totals', async () => {
    service.stats.mockResolvedValue({ totalApplications: 3 });
    const { response } = await authHelper.authenticatedGet(
      `/vacancies/${vacancyId}/stats`,
      authHelper.createCompanyUser(companyId),
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ totalApplications: 3 });
    expect(service.stats).toHaveBeenCalledWith(vacancyId, companyId);
  });

  it('answers 404 when the vacancy is not visible to the company', async () => {
    service.list.mockRejectedValue(new NotFoundException('Vacancy not found'));
    const { response } = await authHelper.authenticatedGet(
      `/vacancies/${vacancyId}/applications`,
      authHelper.createCompanyUser(companyId),
    );

    expect(response.status).toBe(404);
  });

  it('answers 400 for a malformed id', async () => {
    const { response } = await authHelper.authenticatedGet('/vacancies/not-a-uuid/stats');

    expect(response.status).toBe(400);
    expect(service.stats).not.toHaveBeenCalled();
  });

  it('answers 401 without a token', async () => {
    const response = await authHelper.unauthenticatedRequest(
      'get',
      `/vacancies/${vacancyId}/applications`,
    );
    expectUnauthorizedResponse(response);
    expect(service.list).not.toHaveBeenCalled();
  });
});
