import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { faker } from '@faker-js/faker';
import { AuthHelper, expectUnauthorizedResponse } from '../../helpers/auth-helper';
import { authGuardProvider } from '../../helpers/auth-guard.provider';
import { PersonController } from '../../../src/domain/persons/person.controller';
import { PersonServiceInterface } from '../../../src/domain/persons/interfaces/person.service.interface';

describe('Person competences - /persons/:id/competences (e2e)', () => {
  let app: INestApplication;
  let authHelper: AuthHelper;
  const service = { addCompetence: jest.fn() };
  const body = { competenceId: faker.string.uuid(), level: 'advanced', yearsOfExperience: 3 };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [JwtModule.register({ secret: 'test-secret', signOptions: { expiresIn: '1h' } })],
      controllers: [PersonController],
      providers: [authGuardProvider, { provide: PersonServiceInterface, useValue: service }],
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

  const personUser = () => {
    const user = authHelper.createPersonUser();
    return { user, endpoint: `/persons/${user.profileId}/competences` };
  };

  it('POST adds the competence to the authenticated person and answers 201', async () => {
    const { user, endpoint } = personUser();
    service.addCompetence.mockResolvedValue({ id: user.profileId });

    const { response } = await authHelper.authenticatedPost(endpoint, body, user);

    expect(response.status).toBe(201);
    expect(service.addCompetence).toHaveBeenCalledWith(
      user.profileId,
      expect.objectContaining(body),
    );
  });

  it("POST answers 403 on another person's competences", async () => {
    const { user } = personUser();

    const { response } = await authHelper.authenticatedPost(
      `/persons/${faker.string.uuid()}/competences`,
      body,
      user,
    );

    expect(response.status).toBe(403);
    expect(service.addCompetence).not.toHaveBeenCalled();
  });

  it.each([
    ['a missing competenceId', { level: 'advanced' }],
    ['an unknown level', { ...body, level: 'guru' }],
    ['negative years of experience', { ...body, yearsOfExperience: -1 }],
  ])('POST answers 422 for %s', async (_case, payload) => {
    const { user, endpoint } = personUser();

    const { response } = await authHelper.authenticatedPost(endpoint, payload, user);

    expect(response.status).toBe(422);
    expect(service.addCompetence).not.toHaveBeenCalled();
  });

  it('answers 401 without a token', async () => {
    const response = await authHelper.unauthenticatedRequest(
      'post',
      `/persons/${faker.string.uuid()}/competences`,
    );
    expectUnauthorizedResponse(response);
    expect(service.addCompetence).not.toHaveBeenCalled();
  });
});
