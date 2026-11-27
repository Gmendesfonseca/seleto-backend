import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, NotFoundException, ValidationPipe } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { faker } from '@faker-js/faker';
import { AuthHelper, expectUnauthorizedResponse } from '../../helpers/auth-helper';
import { authGuardProvider } from '../../helpers/auth-guard.provider';
import { VacancyCompetenceRequirementController } from '../../../src/domain/vacancies/vacancy-competence-requirement.controller';
import { VacancyCompetenceRequirementServiceInterface } from '../../../src/domain/vacancies/interfaces/vacancy-competence-requirement.service.interface';

describe('Vacancy competence requirements - /vacancies/:vacancyId/competence-requirements (e2e)', () => {
  let app: INestApplication;
  let authHelper: AuthHelper;
  const service = { list: jest.fn(), replace: jest.fn() };

  const vacancyId = faker.string.uuid();
  const companyId = faker.string.uuid();
  const endpoint = `/vacancies/${vacancyId}/competence-requirements`;
  const requirement = {
    id: faker.string.uuid(),
    competenceId: faker.string.uuid(),
    competenceName: 'TypeScript',
    priority: 'required',
    minimumYearsExperience: 3,
    weight: 60,
  };
  const body = {
    requirements: [
      {
        competenceId: requirement.competenceId,
        priority: 'required',
        minimumYearsExperience: 3,
        weight: 60,
      },
    ],
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [JwtModule.register({ secret: 'test-secret', signOptions: { expiresIn: '1h' } })],
      controllers: [VacancyCompetenceRequirementController],
      providers: [
        authGuardProvider,
        { provide: VacancyCompetenceRequirementServiceInterface, useValue: service },
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

  it('GET lists the requirements scoped to the company in the token', async () => {
    service.list.mockResolvedValue([requirement]);
    const { response } = await authHelper.authenticatedGet(
      endpoint,
      authHelper.createCompanyUser(companyId),
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual([requirement]);
    expect(service.list).toHaveBeenCalledWith(vacancyId, companyId);
  });

  it('PUT replaces the set and answers 200 with it', async () => {
    service.replace.mockResolvedValue([requirement]);
    const { response } = await authHelper.authenticatedPut(
      endpoint,
      body,
      authHelper.createCompanyUser(companyId),
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual([requirement]);
    expect(service.replace).toHaveBeenCalledWith(vacancyId, companyId, body);
  });

  it('PUT answers 422 for an invalid priority and does not call the service', async () => {
    const invalid = { requirements: [{ ...body.requirements[0], priority: 'mandatory' }] };
    const { response } = await authHelper.authenticatedPut(
      endpoint,
      invalid,
      authHelper.createCompanyUser(companyId),
    );

    expect(response.status).toBe(422);
    expect(service.replace).not.toHaveBeenCalled();
  });

  it('PUT answers 422 for a weight above 100', async () => {
    const invalid = { requirements: [{ ...body.requirements[0], weight: 101 }] };
    const { response } = await authHelper.authenticatedPut(
      endpoint,
      invalid,
      authHelper.createCompanyUser(companyId),
    );

    expect(response.status).toBe(422);
    expect(service.replace).not.toHaveBeenCalled();
  });

  it('answers 400 for a vacancy id that is not a UUID', async () => {
    const { response } = await authHelper.authenticatedGet(
      '/vacancies/not-a-uuid/competence-requirements',
      authHelper.createCompanyUser(companyId),
    );

    expect(response.status).toBe(400);
    expect(service.list).not.toHaveBeenCalled();
  });

  it('answers 404 when the service hides another company vacancy', async () => {
    service.list.mockRejectedValue(new NotFoundException('Vacancy not found'));
    const { response } = await authHelper.authenticatedGet(
      endpoint,
      authHelper.createCompanyUser(),
    );

    expect(response.status).toBe(404);
  });

  it('answers 401 without a token', async () => {
    const response = await authHelper.unauthenticatedRequest('get', endpoint);
    expectUnauthorizedResponse(response);
    expect(service.list).not.toHaveBeenCalled();
  });
});
