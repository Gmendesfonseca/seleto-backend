import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DateTime } from 'luxon';
import { CompanyService } from './company.service';
import { CompanyRepository } from './repositories/company.repository.interface';
import { Company } from './interfaces/company.interface';
import { CompanyOutputDto, CreateCompanyDto, UpdateCompanyDto } from './dto';

describe('CompanyService', () => {
  let service: CompanyService;
  let repository: jest.Mocked<CompanyRepository>;

  const createdAt = new Date('2023-01-01T00:00:00.000Z');
  const updatedAt = new Date('2023-02-01T00:00:00.000Z');

  // Sequelize hands back native Dates at runtime even though the model types them as DateTime.
  const mockCompany: Company = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    cnpj: '12345678000199',
    user_id: '550e8400-e29b-41d4-a716-446655440001',
    createdAt: createdAt as unknown as DateTime,
    updatedAt: updatedAt as unknown as DateTime,
  };

  const mockCompanyOutput: CompanyOutputDto = {
    id: mockCompany.id,
    cnpj: mockCompany.cnpj,
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompanyService,
        {
          provide: CompanyRepository,
          useValue: {
            create: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            findAll: jest.fn(),
            count: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(CompanyService);
    repository = module.get(CompanyRepository);
  });

  describe('create', () => {
    it('maps userId to user_id for the repository and returns the output dto', async () => {
      const request: CreateCompanyDto = { cnpj: mockCompany.cnpj, userId: mockCompany.user_id };
      repository.create.mockResolvedValue(mockCompany);

      const result = await service.create(request);

      expect(repository.create).toHaveBeenCalledWith({
        cnpj: mockCompany.cnpj,
        user_id: mockCompany.user_id,
      });
      expect(result).toEqual(mockCompanyOutput);
    });

    it('propagates repository errors', async () => {
      repository.create.mockRejectedValue(new Error('Database error'));

      await expect(service.create({ cnpj: '1', userId: 'u' })).rejects.toThrow('Database error');
    });
  });

  describe('findById', () => {
    it('looks the company up by id and returns the output dto', async () => {
      repository.findOne.mockResolvedValue(mockCompany);

      await expect(service.findById(mockCompany.id)).resolves.toEqual(mockCompanyOutput);
      expect(repository.findOne).toHaveBeenCalledWith({ id: mockCompany.id });
    });

    it('throws NotFoundException when the company does not exist', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findById('missing')).rejects.toThrow(
        new NotFoundException('Company with id missing not found'),
      );
    });
  });

  describe('findByUserId', () => {
    it('looks the company up by user_id', async () => {
      repository.findOne.mockResolvedValue(mockCompany);

      await expect(service.findByUserId(mockCompany.user_id)).resolves.toEqual(mockCompanyOutput);
      expect(repository.findOne).toHaveBeenCalledWith({ user_id: mockCompany.user_id });
    });

    it('throws NotFoundException when the user has no company', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findByUserId('u-1')).rejects.toThrow(
        new NotFoundException('Company with userId u-1 not found'),
      );
    });
  });

  describe('update', () => {
    it('updates the cnpj of an existing company', async () => {
      const request: UpdateCompanyDto = { cnpj: '99999999000100' };
      repository.findOne.mockResolvedValue(mockCompany);
      repository.update.mockResolvedValue({ ...mockCompany, cnpj: '99999999000100' });

      const result = await service.update(mockCompany.id, request);

      expect(repository.update).toHaveBeenCalledWith(mockCompany.id, { cnpj: '99999999000100' });
      expect(result).toEqual({ ...mockCompanyOutput, cnpj: '99999999000100' });
    });

    it('throws NotFoundException and does not update when the company does not exist', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.update('missing', { cnpj: '1' })).rejects.toThrow(
        new NotFoundException('Company with id missing not found'),
      );
      expect(repository.update).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('deletes an existing company', async () => {
      repository.findOne.mockResolvedValue(mockCompany);

      await service.delete(mockCompany.id);

      expect(repository.delete).toHaveBeenCalledWith(mockCompany.id);
    });

    it('throws NotFoundException and does not delete when the company does not exist', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.delete('missing')).rejects.toThrow(NotFoundException);
      expect(repository.delete).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('maps every company to the output dto and keeps the meta', async () => {
      const meta = { total: 1, currentPage: 2, perPage: 5, lastPage: 1 };
      repository.findAll.mockResolvedValue({ data: [mockCompany], meta });

      const result = await service.findAll({ page: 2, perPage: 5 }, { search: '123' });

      expect(repository.findAll).toHaveBeenCalledWith({ page: 2, perPage: 5 }, { search: '123' });
      expect(result).toEqual({ data: [mockCompanyOutput], meta });
    });

    it('returns an empty page when nothing matches', async () => {
      const meta = { total: 0, currentPage: 1, perPage: 10, lastPage: 0 };
      repository.findAll.mockResolvedValue({ data: [], meta });

      await expect(service.findAll({})).resolves.toEqual({ data: [], meta });
    });
  });

  describe('placeholders', () => {
    it('setActiveStatus is no longer supported', async () => {
      await expect(service.setActiveStatus(mockCompany.id, true)).rejects.toThrow(
        'setActiveStatus is no longer supported',
      );
    });

    it('count, statistics, findUsers and findVacancies return empty defaults', async () => {
      await expect(service.count(mockCompany.id)).resolves.toBe(0);
      await expect(service.statistics(mockCompany.id)).resolves.toEqual({
        totalUsers: 0,
        totalVacancies: 0,
      });
      await expect(service.findUsers(mockCompany.id)).resolves.toEqual([]);
      await expect(service.findVacancies(mockCompany.id)).resolves.toEqual([]);
    });
  });
});
