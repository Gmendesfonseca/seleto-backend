import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { faker } from '@faker-js/faker';
import {
  AuthHelper,
  expectUnauthorizedResponse,
  createMockServices,
} from '../../helpers/auth-helper';
import { ProcessTemplateController } from '../../../src/domain/templates/process-template.controller';
import { ProcessTemplateService } from '../../../src/domain/templates/interfaces/process-template.service.interface';

describe('Process Templates Controller (e2e) - Authorized Routes', () => {
  let app: INestApplication;
  let authHelper: AuthHelper;
  let mockProcessTemplateService: any;

  // Test data
  const mockProcessTemplate = {
    id: faker.string.uuid(),
    name: faker.lorem.words(3),
    description: faker.lorem.paragraph(),
    category: faker.lorem.word(),
    companyId: faker.string.uuid(),
    isDefault: false,
    steps: [],
    createdAt: faker.date.past().toISOString(),
    updatedAt: faker.date.recent().toISOString(),
  };

  const mockProcessTemplatesListResponse = {
    data: [mockProcessTemplate],
    total: 1,
    page: 1,
    limit: 10,
  };

  const mockDefaultTemplates = [
    {
      id: faker.string.uuid(),
      name: 'Default Interview Process',
      description: faker.lorem.paragraph(),
      category: 'interview',
      isDefault: true,
      steps: [],
    },
    {
      id: faker.string.uuid(),
      name: 'Default Screening Process',
      description: faker.lorem.paragraph(),
      category: 'screening',
      isDefault: true,
      steps: [],
    },
  ];

  beforeAll(async () => {
    const { mockProcessTemplateService: mockService } = createMockServices();
    mockProcessTemplateService = mockService;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: 'test-secret',
          signOptions: { expiresIn: '1h' },
        }),
      ],
      controllers: [ProcessTemplateController],
      providers: [
        {
          provide: ProcessTemplateService,
          useValue: mockProcessTemplateService,
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

  describe('GET /process-templates (Find All Templates)', () => {
    it('should return process templates when authenticated', async () => {
      // Arrange
      mockProcessTemplateService.findAll.mockResolvedValue(mockProcessTemplatesListResponse);
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedGet('/process-templates', testUser);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockProcessTemplatesListResponse);
      expect(mockProcessTemplateService.findAll).toHaveBeenCalledWith({
        companyId: undefined,
        category: undefined,
        isDefault: undefined,
        search: undefined,
        limit: 10,
        offset: 0,
      });
    });

    it('should handle query parameters when authenticated', async () => {
      // Arrange
      mockProcessTemplateService.findAll.mockResolvedValue(mockProcessTemplatesListResponse);
      const testUser = authHelper.createTestUser();
      const companyId = faker.string.uuid();

      // Act
      const { response } = await authHelper.authenticatedGet(
        `/process-templates?companyId=${companyId}&category=interview&isDefault=false&search=senior&limit=20&offset=5`,
        testUser,
      );

      // Assert
      expect(response.status).toBe(200);
      expect(mockProcessTemplateService.findAll).toHaveBeenCalledWith({
        companyId,
        category: 'interview',
        isDefault: false,
        search: 'senior',
        limit: 20,
        offset: 5,
      });
    });

    it('should use default values for limit and offset', async () => {
      // Arrange
      mockProcessTemplateService.findAll.mockResolvedValue(mockProcessTemplatesListResponse);
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedGet(
        '/process-templates?category=screening',
        testUser,
      );

      // Assert
      expect(response.status).toBe(200);
      expect(mockProcessTemplateService.findAll).toHaveBeenCalledWith({
        companyId: undefined,
        category: 'screening',
        isDefault: undefined,
        search: undefined,
        limit: 10,
        offset: 0,
      });
    });

    it('should return 401 when not authenticated', async () => {
      // Act
      const response = await authHelper.unauthenticatedRequest('get', '/process-templates');

      // Assert
      expectUnauthorizedResponse(response);
      expect(mockProcessTemplateService.findAll).not.toHaveBeenCalled();
    });

    it('should return 401 with invalid token', async () => {
      // Act
      const response = await authHelper.invalidTokenRequest('get', '/process-templates');

      // Assert
      expectUnauthorizedResponse(response);
      expect(mockProcessTemplateService.findAll).not.toHaveBeenCalled();
    });

    it('should return 401 with expired token', async () => {
      // Act
      const response = await authHelper.expiredTokenRequest('get', '/process-templates');

      // Assert
      expectUnauthorizedResponse(response);
      expect(mockProcessTemplateService.findAll).not.toHaveBeenCalled();
    });
  });

  describe('GET /process-templates/defaults (Get Default Templates)', () => {
    it('should return default templates when authenticated', async () => {
      // Arrange
      mockProcessTemplateService.getDefaults.mockResolvedValue(mockDefaultTemplates);
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedGet(
        '/process-templates/defaults',
        testUser,
      );

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockDefaultTemplates);
      expect(mockProcessTemplateService.getDefaults).toHaveBeenCalledWith();
    });

    it('should return 401 when not authenticated', async () => {
      // Act
      const response = await authHelper.unauthenticatedRequest(
        'get',
        '/process-templates/defaults',
      );

      // Assert
      expectUnauthorizedResponse(response);
      expect(mockProcessTemplateService.getDefaults).not.toHaveBeenCalled();
    });

    it('should return 401 with invalid token', async () => {
      // Act
      const response = await authHelper.invalidTokenRequest('get', '/process-templates/defaults');

      // Assert
      expectUnauthorizedResponse(response);
      expect(mockProcessTemplateService.getDefaults).not.toHaveBeenCalled();
    });
  });

  describe('GET /process-templates/:id (Get Template)', () => {
    const templateId = faker.string.uuid();

    it('should return process template when authenticated', async () => {
      // Arrange
      mockProcessTemplateService.findOne.mockResolvedValue(mockProcessTemplate);
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedGet(
        `/process-templates/${templateId}`,
        testUser,
      );

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockProcessTemplate);
      expect(mockProcessTemplateService.findOne).toHaveBeenCalledWith(templateId);
    });

    it('should return 401 when not authenticated', async () => {
      // Act
      const response = await authHelper.unauthenticatedRequest(
        'get',
        `/process-templates/${templateId}`,
      );

      // Assert
      expectUnauthorizedResponse(response);
      expect(mockProcessTemplateService.findOne).not.toHaveBeenCalled();
    });

    it('should return 401 with invalid token', async () => {
      // Act
      const response = await authHelper.invalidTokenRequest(
        'get',
        `/process-templates/${templateId}`,
      );

      // Assert
      expectUnauthorizedResponse(response);
      expect(mockProcessTemplateService.findOne).not.toHaveBeenCalled();
    });
  });

  describe('POST /process-templates (Create Template)', () => {
    const createTemplateDto = {
      name: faker.lorem.words(3),
      description: faker.lorem.paragraph(),
      category: faker.lorem.word(),
      companyId: faker.string.uuid(),
      steps: [],
    };

    it('should create process template when authenticated', async () => {
      // Arrange
      mockProcessTemplateService.create.mockResolvedValue(mockProcessTemplate);
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedPost(
        '/process-templates',
        createTemplateDto,
        testUser,
      );

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockProcessTemplate);
      expect(mockProcessTemplateService.create).toHaveBeenCalledWith(createTemplateDto);
    });

    it('should return 401 when not authenticated', async () => {
      // Act
      const response = await authHelper
        .unauthenticatedRequest('post', '/process-templates')
        .send(createTemplateDto);

      // Assert
      expectUnauthorizedResponse(response);
      expect(mockProcessTemplateService.create).not.toHaveBeenCalled();
    });

    it('should return 401 with invalid token', async () => {
      // Act
      const response = await authHelper
        .invalidTokenRequest('post', '/process-templates')
        .send(createTemplateDto);

      // Assert
      expectUnauthorizedResponse(response);
      expect(mockProcessTemplateService.create).not.toHaveBeenCalled();
    });
  });

  describe('PUT /process-templates/:id (Update Template)', () => {
    const templateId = faker.string.uuid();
    const updateTemplateDto = {
      name: faker.lorem.words(3),
      description: faker.lorem.paragraph(),
      category: faker.lorem.word(),
    };

    it('should update process template when authenticated', async () => {
      // Arrange
      mockProcessTemplateService.update.mockResolvedValue({
        ...mockProcessTemplate,
        ...updateTemplateDto,
      });
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedPut(
        `/process-templates/${templateId}`,
        updateTemplateDto,
        testUser,
      );

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject(updateTemplateDto);
      expect(mockProcessTemplateService.update).toHaveBeenCalledWith(templateId, updateTemplateDto);
    });

    it('should return 401 when not authenticated', async () => {
      // Act
      const response = await authHelper
        .unauthenticatedRequest('put', `/process-templates/${templateId}`)
        .send(updateTemplateDto);

      // Assert
      expectUnauthorizedResponse(response);
      expect(mockProcessTemplateService.update).not.toHaveBeenCalled();
    });

    it('should return 401 with invalid token', async () => {
      // Act
      const response = await authHelper
        .invalidTokenRequest('put', `/process-templates/${templateId}`)
        .send(updateTemplateDto);

      // Assert
      expectUnauthorizedResponse(response);
      expect(mockProcessTemplateService.update).not.toHaveBeenCalled();
    });
  });

  describe('DELETE /process-templates/:id (Delete Template)', () => {
    const templateId = faker.string.uuid();

    it('should delete process template when authenticated', async () => {
      // Arrange
      mockProcessTemplateService.remove.mockResolvedValue(undefined);
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedDelete(
        `/process-templates/${templateId}`,
        testUser,
      );

      // Assert
      expect(response.status).toBe(204);
      expect(mockProcessTemplateService.remove).toHaveBeenCalledWith(templateId);
    });

    it('should return 401 when not authenticated', async () => {
      // Act
      const response = await authHelper.unauthenticatedRequest(
        'delete',
        `/process-templates/${templateId}`,
      );

      // Assert
      expectUnauthorizedResponse(response);
      expect(mockProcessTemplateService.remove).not.toHaveBeenCalled();
    });

    it('should return 401 with invalid token', async () => {
      // Act
      const response = await authHelper.invalidTokenRequest(
        'delete',
        `/process-templates/${templateId}`,
      );

      // Assert
      expectUnauthorizedResponse(response);
      expect(mockProcessTemplateService.remove).not.toHaveBeenCalled();
    });
  });

  describe('POST /process-templates/:id/duplicate (Duplicate Template)', () => {
    const templateId = faker.string.uuid();

    it('should duplicate process template when authenticated', async () => {
      // Arrange
      const duplicatedTemplate = { ...mockProcessTemplate, id: faker.string.uuid() };
      mockProcessTemplateService.duplicate.mockResolvedValue(duplicatedTemplate);
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedPost(
        `/process-templates/${templateId}/duplicate`,
        { name: 'Duplicated Template' },
        testUser,
      );

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual(duplicatedTemplate);
      expect(mockProcessTemplateService.duplicate).toHaveBeenCalledWith(
        templateId,
        'Duplicated Template',
      );
    });

    it('should duplicate template without custom name when authenticated', async () => {
      // Arrange
      const duplicatedTemplate = { ...mockProcessTemplate, id: faker.string.uuid() };
      mockProcessTemplateService.duplicate.mockResolvedValue(duplicatedTemplate);
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedPost(
        `/process-templates/${templateId}/duplicate`,
        {},
        testUser,
      );

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual(duplicatedTemplate);
      expect(mockProcessTemplateService.duplicate).toHaveBeenCalledWith(templateId, undefined);
    });

    it('should return 401 when not authenticated', async () => {
      // Act
      const response = await authHelper
        .unauthenticatedRequest('post', `/process-templates/${templateId}/duplicate`)
        .send({ name: 'Test' });

      // Assert
      expectUnauthorizedResponse(response);
      expect(mockProcessTemplateService.duplicate).not.toHaveBeenCalled();
    });

    it('should return 401 with invalid token', async () => {
      // Act
      const response = await authHelper
        .invalidTokenRequest('post', `/process-templates/${templateId}/duplicate`)
        .send({ name: 'Test' });

      // Assert
      expectUnauthorizedResponse(response);
      expect(mockProcessTemplateService.duplicate).not.toHaveBeenCalled();
    });
  });

  describe('Service Error Handling', () => {
    it('should handle service errors gracefully for findAll', async () => {
      // Arrange
      mockProcessTemplateService.findAll.mockRejectedValue(new Error('Database connection error'));
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedGet('/process-templates', testUser);

      // Assert
      expect(response.status).toBe(500);
      expect(response.body.error).toBeDefined();
    });

    it('should handle NotFoundException for findOne', async () => {
      // Arrange
      const notFoundError = new Error('Template not found');
      notFoundError.name = 'NotFoundException';
      mockProcessTemplateService.findOne.mockRejectedValue(notFoundError);
      const testUser = authHelper.createTestUser();
      const templateId = faker.string.uuid();

      // Act
      const { response } = await authHelper.authenticatedGet(
        `/process-templates/${templateId}`,
        testUser,
      );

      // Assert
      expect(response.status).toBe(404);
    });

    it('should handle BadRequestException for create', async () => {
      // Arrange
      const badRequestError = new Error('Invalid template data');
      badRequestError.name = 'BadRequestException';
      mockProcessTemplateService.create.mockRejectedValue(badRequestError);
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedPost(
        '/process-templates',
        { name: 'Test' },
        testUser,
      );

      // Assert
      expect(response.status).toBe(400);
    });

    it('should handle service errors for duplicate', async () => {
      // Arrange
      mockProcessTemplateService.duplicate.mockRejectedValue(new Error('Duplication failed'));
      const testUser = authHelper.createTestUser();
      const templateId = faker.string.uuid();

      // Act
      const { response } = await authHelper.authenticatedPost(
        `/process-templates/${templateId}/duplicate`,
        {},
        testUser,
      );

      // Assert
      expect(response.status).toBe(500);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('Validation Tests', () => {
    it('should validate UUID format for template ID parameter', async () => {
      // Arrange
      const testUser = authHelper.createTestUser();
      const invalidId = 'invalid-uuid';

      // Act
      const { response } = await authHelper.authenticatedGet(
        `/process-templates/${invalidId}`,
        testUser,
      );

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Validation failed');
    });

    it('should validate required fields for template creation', async () => {
      // Arrange
      const testUser = authHelper.createTestUser();
      const invalidDto = {}; // Missing required fields

      // Act
      const { response } = await authHelper.authenticatedPost(
        '/process-templates',
        invalidDto,
        testUser,
      );

      // Assert
      expect(response.status).toBe(400);
    });

    it('should validate limit parameter type', async () => {
      // Arrange
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedGet(
        '/process-templates?limit=invalid',
        testUser,
      );

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Validation failed');
    });

    it('should validate offset parameter type', async () => {
      // Arrange
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedGet(
        '/process-templates?offset=invalid',
        testUser,
      );

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Validation failed');
    });

    it('should validate boolean isDefault parameter', async () => {
      // Arrange
      const testUser = authHelper.createTestUser();

      // Act
      const { response } = await authHelper.authenticatedGet(
        '/process-templates?isDefault=invalid',
        testUser,
      );

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Validation failed');
    });
  });

  describe('Authorization Context Tests', () => {
    it('should work with company user', async () => {
      // Arrange
      mockProcessTemplateService.findAll.mockResolvedValue(mockProcessTemplatesListResponse);
      const companyUser = authHelper.createCompanyUser();

      // Act
      const { response } = await authHelper.authenticatedGet('/process-templates', companyUser);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockProcessTemplatesListResponse);
    });

    it('should work with person user', async () => {
      // Arrange
      mockProcessTemplateService.getDefaults.mockResolvedValue(mockDefaultTemplates);
      const personUser = authHelper.createPersonUser();

      // Act
      const { response } = await authHelper.authenticatedGet(
        '/process-templates/defaults',
        personUser,
      );

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockDefaultTemplates);
    });
  });
});
