import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { faker } from '@faker-js/faker';
import { AuthHelper, expectUnauthorizedResponse } from '../../helpers/auth-helper';
import { authGuardProvider } from '../../helpers/auth-guard.provider';
import { CompetenceController } from '../../../src/domain/competences/competence.controller';
import { CompetenceServiceInterface } from '../../../src/domain/competences/interfaces/competence.service.interface';

describe('Competences - /competences (e2e)', () => {
  let app: INestApplication;
  let authHelper: AuthHelper;
  const service = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };
  const competence = {
    id: faker.string.uuid(),
    name: 'TypeScript',
    description: 'Typed JavaScript',
    createdAt: '2026-11-27T00:00:00.000Z',
    updatedAt: '2026-11-27T00:00:00.000Z',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [JwtModule.register({ secret: 'test-secret', signOptions: { expiresIn: '1h' } })],
      controllers: [CompetenceController],
      providers: [authGuardProvider, { provide: CompetenceServiceInterface, useValue: service }],
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

  it('POST creates from the body and answers 201 with a Location header', async () => {
    service.create.mockResolvedValue(competence);
    const { response } = await authHelper.authenticatedPost('/competences', {
      name: 'TypeScript',
      description: 'Typed JavaScript',
    });

    expect(response.status).toBe(201);
    expect(response.body).toEqual(competence);
    expect(response.headers.location).toBe(`/competences/${competence.id}`);
    expect(service.create).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'TypeScript', description: 'Typed JavaScript' }),
    );
  });

  it('POST answers 422 without a name', async () => {
    const { response } = await authHelper.authenticatedPost('/competences', { description: 'x' });

    expect(response.status).toBe(422);
    expect(service.create).not.toHaveBeenCalled();
  });

  it('POST answers 409 when the name already exists', async () => {
    service.create.mockRejectedValue(new ConflictException('exists'));
    const { response } = await authHelper.authenticatedPost('/competences', { name: 'TypeScript' });

    expect(response.status).toBe(409);
  });

  it('GET forwards the name filter from the query string', async () => {
    service.findAll.mockResolvedValue([competence]);
    const { response } = await authHelper.authenticatedGet('/competences?name=type');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([competence]);
    expect(service.findAll).toHaveBeenCalledWith(expect.objectContaining({ name: 'type' }));
  });

  it('GET /:id answers 404 when the competence does not exist', async () => {
    service.findOne.mockResolvedValue(null);
    const { response } = await authHelper.authenticatedGet(`/competences/${faker.string.uuid()}`);

    expect(response.status).toBe(404);
  });

  it('PUT replaces name and description from the body', async () => {
    service.update.mockResolvedValue(competence);
    const { response } = await authHelper.authenticatedPut(`/competences/${competence.id}`, {
      name: 'TypeScript',
    });

    expect(response.status).toBe(200);
    expect(service.update).toHaveBeenCalledWith(
      competence.id,
      expect.objectContaining({ name: 'TypeScript' }),
    );
  });

  it('DELETE answers 204', async () => {
    service.remove.mockResolvedValue(undefined);
    const { response } = await authHelper.authenticatedDelete(`/competences/${competence.id}`);

    expect(response.status).toBe(204);
    expect(service.remove).toHaveBeenCalledWith(competence.id);
  });

  it('answers 400 for a malformed id', async () => {
    const { response } = await authHelper.authenticatedGet('/competences/not-a-uuid');

    expect(response.status).toBe(400);
  });

  it('answers 401 without a token', async () => {
    const response = await authHelper.unauthenticatedRequest('post', '/competences');
    expectUnauthorizedResponse(response);
    expect(service.create).not.toHaveBeenCalled();
  });
});
