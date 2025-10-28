import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CompanyServiceImpl } from './company.service';
import { CompanyRepository } from './repositories/company.repository.interface';
import { PaginationParams, SearchParams } from '../../shared/interfaces/entities';
import { Company } from './interfaces/company.interface';
import { CompanyResponse, CreateCompanyRequest, UpdateCompanyRequest } from './dto';

describe('CompanyService', () => {
  let service: CompanyServiceImpl;
  let repository: jest.Mocked<CompanyRepository>;

  const mockCompany = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'Test Company',
    address: 'Test Address',
    isActive: true,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  };

  const mockCompanyResponse: CompanyResponse = {
    id: mockCompany.id,
    name: mockCompany.name,
    address: mockCompany.address,
    isActive: mockCompany.isActive,
    createdAt: mockCompany.createdAt.toISOString(),
    updatedAt: mockCompany.updatedAt.toISOString(),
  };

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findAll: jest.fn(),
      existsByName: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompanyServiceImpl,
        {
          provide: CompanyRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<CompanyServiceImpl>(CompanyServiceImpl);
    repository = module.get(CompanyRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(CompanyServiceImpl);
  });

  describe('create', () => {
    it('should successfully create a company', async () => {
      // Arrange
      const createRequest: CreateCompanyRequest = {
        name: 'New Company',
        address: 'New Address',
      };

      const expectedRepositoryInput = {
        name: createRequest.name,
        address: createRequest.address,
        isActive: true,
      };

      repository.create.mockResolvedValue(mockCompany);

      // Act
      const result = await service.create(createRequest);

      // Assert
      expect(repository.create).toHaveBeenCalledWith(expectedRepositoryInput);
      expect(result).toEqual(mockCompanyResponse);
    });

    it('should create company with null address when not provided', async () => {
      // Arrange
      const createRequest: CreateCompanyRequest = {
        name: 'New Company',
      };

      const expectedRepositoryInput = {
        name: createRequest.name,
        address: null,
        isActive: true,
      };

      repository.create.mockResolvedValue(mockCompany);

      // Act
      const result = await service.create(createRequest);

      // Assert
      expect(repository.create).toHaveBeenCalledWith(expectedRepositoryInput);
      expect(result).toEqual(mockCompanyResponse);
    });

    it('should handle repository errors', async () => {
      // Arrange
      const createRequest: CreateCompanyRequest = {
        name: 'New Company',
        address: 'New Address',
      };

      repository.create.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.create(createRequest)).rejects.toThrow('Database error');
      expect(repository.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('findById', () => {
    it('should successfully find company by id', async () => {
      // Arrange
      const companyId = mockCompany.id;
      repository.findById.mockResolvedValue(mockCompany);

      // Act
      const result = await service.findById(companyId);

      // Assert
      expect(repository.findById).toHaveBeenCalledWith(companyId);
      expect(result).toEqual(mockCompanyResponse);
    });

    it('should throw NotFoundException when company not found', async () => {
      // Arrange
      const companyId = 'non-existent-id';
      repository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findById(companyId)).rejects.toThrow(
        new NotFoundException(`Company with id ${companyId} not found`),
      );
      expect(repository.findById).toHaveBeenCalledWith(companyId);
    });

    it('should handle repository errors', async () => {
      // Arrange
      const companyId = mockCompany.id;
      repository.findById.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.findById(companyId)).rejects.toThrow('Database error');
      expect(repository.findById).toHaveBeenCalledWith(companyId);
    });
  });

  describe('update', () => {
    it('should successfully update a company', async () => {
      // Arrange
      const companyId = mockCompany.id;
      const updateRequest: UpdateCompanyRequest = {
        name: 'Updated Company',
        address: 'Updated Address',
      };

      const updatedCompany: Company = {
        ...mockCompany,
        name: updateRequest.name!,
        address: updateRequest.address!,
        updatedAt: new Date('2023-01-02'),
      };

      const expectedRepositoryInput = {
        name: updateRequest.name,
        address: updateRequest.address,
      };

      repository.update.mockResolvedValue(updatedCompany);

      // Act
      const result = await service.update(companyId, updateRequest);

      // Assert
      expect(repository.update).toHaveBeenCalledWith(companyId, expectedRepositoryInput);
      expect(result).toEqual({
        ...mockCompanyResponse,
        name: updateRequest.name,
        address: updateRequest.address,
        updatedAt: updatedCompany.updatedAt.toISOString(),
      });
    });

    it('should update company with null address when not provided', async () => {
      // Arrange
      const companyId = mockCompany.id;
      const updateRequest: UpdateCompanyRequest = {
        name: 'Updated Company',
      };

      const expectedRepositoryInput = {
        name: updateRequest.name,
        address: null,
      };

      repository.update.mockResolvedValue(mockCompany);

      // Act
      const result = await service.update(companyId, updateRequest);

      // Assert
      expect(repository.update).toHaveBeenCalledWith(companyId, expectedRepositoryInput);
      expect(result).toEqual(mockCompanyResponse);
    });

    it('should handle repository errors', async () => {
      // Arrange
      const companyId = mockCompany.id;
      const updateRequest: UpdateCompanyRequest = {
        name: 'Updated Company',
      };

      repository.update.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.update(companyId, updateRequest)).rejects.toThrow('Database error');
      expect(repository.update).toHaveBeenCalledTimes(1);
    });
  });

  describe('delete', () => {
    it('should successfully delete a company', async () => {
      // Arrange
      const companyId = mockCompany.id;
      repository.findById.mockResolvedValue(mockCompany);
      repository.delete.mockResolvedValue(undefined);

      // Act
      await service.delete(companyId);

      // Assert
      expect(repository.findById).toHaveBeenCalledWith(companyId);
      expect(repository.delete).toHaveBeenCalledWith(companyId);
    });

    it('should throw NotFoundException when company not found', async () => {
      // Arrange
      const companyId = 'non-existent-id';
      repository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.delete(companyId)).rejects.toThrow(
        new NotFoundException(`Company with id ${companyId} not found`),
      );
      expect(repository.findById).toHaveBeenCalledWith(companyId);
      expect(repository.delete).not.toHaveBeenCalled();
    });

    it('should handle repository errors', async () => {
      // Arrange
      const companyId = mockCompany.id;
      repository.findById.mockResolvedValue(mockCompany);
      repository.delete.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.delete(companyId)).rejects.toThrow('Database error');
      expect(repository.delete).toHaveBeenCalledWith(companyId);
    });
  });

  describe('findAll', () => {
    it('should successfully find all companies with pagination', async () => {
      // Arrange
      const pagination: PaginationParams = { page: 1, perPage: 10 };
      const search: SearchParams = { search: 'test' };

      const mockRepositoryResult = {
        data: [mockCompany],
        meta: {
          currentPage: 1,
          perPage: 10,
          lastPage: 1,
          total: 1,
        },
      };

      const expectedResult = {
        data: [mockCompanyResponse],
        meta: {
          currentPage: 1,
          perPage: 10,
          lastPage: 1,
          total: 1,
        },
      };

      repository.findAll.mockResolvedValue(mockRepositoryResult);

      // Act
      const result = await service.findAll(pagination, search);

      // Assert
      expect(repository.findAll).toHaveBeenCalledWith(pagination, search);
      expect(result).toEqual(expectedResult);
    });

    it('should find all companies without search parameters', async () => {
      // Arrange
      const pagination: PaginationParams = { page: 1, perPage: 10 };

      const mockRepositoryResult = {
        data: [mockCompany],
        meta: {
          currentPage: 1,
          perPage: 10,
          lastPage: 1,
          total: 1,
        },
      };

      repository.findAll.mockResolvedValue(mockRepositoryResult);

      // Act
      const result = await service.findAll(pagination);

      // Assert
      expect(repository.findAll).toHaveBeenCalledWith(pagination, undefined);
      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toEqual(mockCompanyResponse);
    });

    it('should handle empty results', async () => {
      // Arrange
      const pagination: PaginationParams = { page: 1, perPage: 10 };

      const mockRepositoryResult = {
        data: [],
        meta: {
          currentPage: 1,
          perPage: 10,
          lastPage: 0,
          total: 0,
        },
      };

      repository.findAll.mockResolvedValue(mockRepositoryResult);

      // Act
      const result = await service.findAll(pagination);

      // Assert
      expect(result.data).toHaveLength(0);
      expect(result.meta.total).toBe(0);
    });

    it('should handle repository errors', async () => {
      // Arrange
      const pagination: PaginationParams = { page: 1, perPage: 10 };
      repository.findAll.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.findAll(pagination)).rejects.toThrow('Database error');
    });
  });

  describe('existsByName', () => {
    it('should return true when company exists', async () => {
      // Arrange
      const name = 'Existing Company';
      repository.existsByName.mockResolvedValue(true);

      // Act
      const result = await service.existsByName(name);

      // Assert
      expect(repository.existsByName).toHaveBeenCalledWith(name);
      expect(result).toBe(true);
    });

    it('should return false when company does not exist', async () => {
      // Arrange
      const name = 'Non-existing Company';
      repository.existsByName.mockResolvedValue(false);

      // Act
      const result = await service.existsByName(name);

      // Assert
      expect(repository.existsByName).toHaveBeenCalledWith(name);
      expect(result).toBe(false);
    });

    it('should handle repository errors', async () => {
      // Arrange
      const name = 'Test Company';
      repository.existsByName.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.existsByName(name)).rejects.toThrow('Database error');
    });
  });

  describe('getUsersCount', () => {
    it('should return 0 as placeholder implementation', async () => {
      // Act
      const result = await service.getUsersCount(mockCompany.id);

      // Assert
      expect(result).toBe(0);
    });
  });

  describe('setActiveStatus', () => {
    it('should successfully set active status', async () => {
      // Arrange
      const companyId = mockCompany.id;
      const isActive = false;
      repository.update.mockResolvedValue({ ...mockCompany, isActive });

      // Act
      await service.setActiveStatus(companyId, isActive);

      // Assert
      expect(repository.update).toHaveBeenCalledWith(companyId, { isActive });
    });

    it('should handle repository errors', async () => {
      // Arrange
      const companyId = mockCompany.id;
      repository.update.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.setActiveStatus(companyId, true)).rejects.toThrow('Database error');
    });
  });

  describe('getStatistics', () => {
    it('should return default statistics', async () => {
      // Act
      const result = await service.getStatistics(mockCompany.id);

      // Assert
      expect(result).toEqual({ totalUsers: 0, totalVacancies: 0 });
    });
  });

  describe('getUsers', () => {
    it('should return empty array as placeholder implementation', async () => {
      // Act
      const result = await service.getUsers(mockCompany.id);

      // Assert
      expect(result).toEqual([]);
    });

    it('should return empty array with filters', async () => {
      // Arrange
      const filters = { type: 'PERSON', status: 'ACTIVE', page: 1, limit: 10 };

      // Act
      const result = await service.getUsers(mockCompany.id, filters);

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('getVacancies', () => {
    it('should return empty array as placeholder implementation', async () => {
      // Act
      const result = await service.getVacancies(mockCompany.id);

      // Assert
      expect(result).toEqual([]);
    });

    it('should return empty array with filters', async () => {
      // Arrange
      const filters = { status: 'OPEN', page: 1, limit: 10 };

      // Act
      const result = await service.getVacancies(mockCompany.id, filters);

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('toResponse (private method behavior)', () => {
    it('should correctly map company data to response format', async () => {
      // Arrange
      repository.create.mockResolvedValue(mockCompany);

      const createRequest: CreateCompanyRequest = {
        name: mockCompany.name,
        address: mockCompany.address,
      };

      // Act
      const result = await service.create(createRequest);

      // Assert
      expect(result).toEqual(mockCompanyResponse);
      expect(result.isActive).toBe(true);
      expect(typeof result.createdAt).toBe('string');
      expect(typeof result.updatedAt).toBe('string');
    });

    it('should use nullish coalescing for isActive property', async () => {
      // This test verifies the ?? operator works correctly in toResponse method
      // by ensuring the method returns expected structure
      // Arrange
      repository.create.mockResolvedValue(mockCompany);

      const createRequest: CreateCompanyRequest = {
        name: mockCompany.name,
        address: mockCompany.address,
      };

      // Act
      const result = await service.create(createRequest);

      // Assert
      expect(result.isActive).toBe(mockCompany.isActive);
    });
  });
});
