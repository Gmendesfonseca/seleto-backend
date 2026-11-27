import { ConflictException, NotFoundException } from '@nestjs/common';
import { DateTime } from 'luxon';
import { CompetenceService } from './competence.service';
import { CompetenceRepository } from './repositories/competence.repository.interface';
import { Competence } from './interfaces/competence.interface';

describe('CompetenceService', () => {
  const competence: Competence = {
    id: 'c-1',
    name: 'TypeScript',
    description: null,
    createdAt: DateTime.now(),
    updatedAt: DateTime.now(),
  };
  let repository: jest.Mocked<CompetenceRepository>;
  let service: CompetenceService;

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      findByName: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      searchByName: jest.fn(),
      countByFilters: jest.fn(),
    };
    service = new CompetenceService(repository);
  });

  describe('create', () => {
    it('creates the competence when the name is free', async () => {
      repository.findByName.mockResolvedValue(null);
      repository.create.mockResolvedValue(competence);

      await expect(service.create({ name: 'TypeScript' })).resolves.toBe(competence);
      expect(repository.findByName).toHaveBeenCalledWith('TypeScript');
    });

    it('rejects a name already in the catalog with ConflictException', async () => {
      repository.findByName.mockResolvedValue(competence);

      await expect(service.create({ name: 'typescript' })).rejects.toThrow(ConflictException);
      expect(repository.create).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('throws NotFoundException when the competence is missing', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.update('missing', { name: 'Go' })).rejects.toThrow(NotFoundException);
      expect(repository.update).not.toHaveBeenCalled();
    });

    it('keeps its own name without a conflict', async () => {
      repository.findOne.mockResolvedValue(competence);
      repository.findByName.mockResolvedValue(competence);
      repository.update.mockResolvedValue(competence);

      await expect(service.update('c-1', { name: 'TypeScript' })).resolves.toBe(competence);
    });

    it('rejects renaming onto another competence with ConflictException', async () => {
      repository.findOne.mockResolvedValue({ ...competence, id: 'c-2', name: 'Go' });
      repository.findByName.mockResolvedValue(competence);

      await expect(service.update('c-2', { name: 'TypeScript' })).rejects.toThrow(
        ConflictException,
      );
      expect(repository.update).not.toHaveBeenCalled();
    });
  });
});
