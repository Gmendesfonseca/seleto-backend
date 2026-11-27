import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PersonService } from './person.service';
import { PersonRepository } from './interfaces/person.repository.interface';
import { PersonExperienceRepository } from './interfaces/person-experience.repository.interface';
import { PersonFormationRepository } from './interfaces/person-formation.repository.interface';
import { PersonCompetenceRepository } from './interfaces/person-competence.repository.interface';
import { MatchingService } from '../matching/matching.service';
import { Person } from './person.model';
import { CreatePersonDto, UpdatePersonDto } from './dto/person.dto';
import { CreatePersonCompetenceDto } from './dto/person-competence.dto';
import { CreatePersonExperienceDto } from './dto/person-experience.dto';
import { CreatePersonFormationDto } from './dto/person-formation.dto';
import { DegreeType } from './person-formation.model';
import { DateTime } from 'luxon';

jest.mock('../matching/matching.service', () => ({ MatchingService: class MatchingService {} }));

describe('PersonService', () => {
  let service: PersonService;
  let repository: jest.Mocked<PersonRepository>;
  let experienceRepository: jest.Mocked<PersonExperienceRepository>;
  let formationRepository: jest.Mocked<PersonFormationRepository>;
  let competenceRepository: jest.Mocked<PersonCompetenceRepository>;
  let matchingService: { findMatchesForPerson: jest.Mock };

  const personId = '550e8400-e29b-41d4-a716-446655440000';
  const userId = '550e8400-e29b-41d4-a716-446655440001';

  const mockPerson = {
    id: personId,
    cpf: '12345678901',
    user_id: userId,
  } as Person;

  beforeEach(async () => {
    matchingService = { findMatchesForPerson: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PersonService,
        {
          provide: PersonRepository,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            countByFilters: jest.fn(),
          },
        },
        {
          provide: PersonExperienceRepository,
          useValue: { create: jest.fn(), delete: jest.fn() },
        },
        {
          provide: PersonFormationRepository,
          useValue: { create: jest.fn(), delete: jest.fn() },
        },
        {
          provide: PersonCompetenceRepository,
          useValue: { create: jest.fn(), delete: jest.fn() },
        },
        { provide: MatchingService, useValue: matchingService },
      ],
    }).compile();

    service = module.get(PersonService);
    repository = module.get(PersonRepository);
    experienceRepository = module.get(PersonExperienceRepository);
    formationRepository = module.get(PersonFormationRepository);
    competenceRepository = module.get(PersonCompetenceRepository);
  });

  describe('create', () => {
    it('forwards the dto to the repository and returns the created person', async () => {
      const dto: CreatePersonDto = { cpf: mockPerson.cpf, userId };
      repository.create.mockResolvedValue(mockPerson);

      await expect(service.create(dto)).resolves.toBe(mockPerson);
      expect(repository.create).toHaveBeenCalledWith(dto);
    });

    it('propagates repository errors', async () => {
      repository.create.mockRejectedValue(new Error('db down'));

      await expect(service.create({ cpf: '1', userId })).rejects.toThrow('db down');
    });
  });

  describe('findAll', () => {
    it('passes the filters through and returns the list', async () => {
      repository.findAll.mockResolvedValue([mockPerson]);

      await expect(service.findAll({ cpf: '123' })).resolves.toEqual([mockPerson]);
      expect(repository.findAll).toHaveBeenCalledWith({ cpf: '123' });
    });

    it('returns an empty list when nothing matches', async () => {
      repository.findAll.mockResolvedValue([]);

      await expect(service.findAll()).resolves.toEqual([]);
    });
  });

  describe('findOne', () => {
    it('looks the person up by id', async () => {
      repository.findOne.mockResolvedValue(mockPerson);

      await expect(service.findOne(personId)).resolves.toBe(mockPerson);
      expect(repository.findOne).toHaveBeenCalledWith({ id: personId });
    });

    it('returns null when the person does not exist', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne('missing')).resolves.toBeNull();
    });
  });

  describe('findByUserId', () => {
    it('looks the person up by user_id', async () => {
      repository.findOne.mockResolvedValue(mockPerson);

      await expect(service.findByUserId(userId)).resolves.toBe(mockPerson);
      expect(repository.findOne).toHaveBeenCalledWith({ user_id: userId });
    });

    it('throws NotFoundException when no person belongs to the user', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findByUserId(userId)).rejects.toThrow(
        `Person with userId ${userId} not found`,
      );
    });
  });

  describe('update', () => {
    it('updates an existing person with the dto', async () => {
      const dto: UpdatePersonDto = { bio: 'New bio' };
      const updated = { ...mockPerson } as Person;
      repository.findOne.mockResolvedValue(mockPerson);
      repository.update.mockResolvedValue(updated);

      await expect(service.update(personId, dto)).resolves.toBe(updated);
      expect(repository.update).toHaveBeenCalledWith(personId, dto);
    });

    it('throws NotFoundException and skips the update when the person is missing', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.update('missing', { bio: 'x' })).rejects.toThrow(NotFoundException);
      expect(repository.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('deletes an existing person', async () => {
      repository.findOne.mockResolvedValue(mockPerson);

      await service.remove(personId);

      expect(repository.delete).toHaveBeenCalledWith(personId);
    });

    it('throws NotFoundException and skips the delete when the person is missing', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.remove('missing')).rejects.toThrow(NotFoundException);
      expect(repository.delete).not.toHaveBeenCalled();
    });
  });

  describe('competences', () => {
    const dto: CreatePersonCompetenceDto = {
      personId,
      competenceName: 'TypeScript',
      proficiencyLevel: 4,
      yearsOfExperience: 3,
    };

    it('addCompetence persists the competence and returns the person', async () => {
      repository.findOne.mockResolvedValue(mockPerson);

      await expect(service.addCompetence(personId, dto)).resolves.toBe(mockPerson);
      expect(competenceRepository.create).toHaveBeenCalledWith(dto);
    });

    it('addCompetence throws NotFoundException without creating when the person is missing', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.addCompetence('missing', dto)).rejects.toThrow(NotFoundException);
      expect(competenceRepository.create).not.toHaveBeenCalled();
    });

    it('removeCompetence deletes the competence and returns the person', async () => {
      repository.findOne.mockResolvedValue(mockPerson);

      await expect(service.removeCompetence(personId, 'comp-1')).resolves.toBe(mockPerson);
      expect(competenceRepository.delete).toHaveBeenCalledWith('comp-1');
    });

    it('removeCompetence throws NotFoundException without deleting when the person is missing', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.removeCompetence('missing', 'comp-1')).rejects.toThrow(
        NotFoundException,
      );
      expect(competenceRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('work experiences', () => {
    const dto: CreatePersonExperienceDto = {
      personId,
      company: 'Acme',
      position: 'Engineer',
      startDate: DateTime.fromISO('2020-01-01'),
      endDate: null,
      isCurrent: true,
    };

    it('addWorkExperience persists the experience and returns the person', async () => {
      repository.findOne.mockResolvedValue(mockPerson);

      await expect(service.addWorkExperience(personId, dto)).resolves.toBe(mockPerson);
      expect(experienceRepository.create).toHaveBeenCalledWith(dto);
    });

    it('addWorkExperience throws NotFoundException without creating when the person is missing', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.addWorkExperience('missing', dto)).rejects.toThrow(NotFoundException);
      expect(experienceRepository.create).not.toHaveBeenCalled();
    });

    it('removeWorkExperience deletes the experience and returns the person', async () => {
      repository.findOne.mockResolvedValue(mockPerson);

      await expect(service.removeWorkExperience(personId, 'exp-1')).resolves.toBe(mockPerson);
      expect(experienceRepository.delete).toHaveBeenCalledWith('exp-1');
    });

    it('removeWorkExperience throws NotFoundException without deleting when the person is missing', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.removeWorkExperience('missing', 'exp-1')).rejects.toThrow(
        NotFoundException,
      );
      expect(experienceRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('education', () => {
    const dto: CreatePersonFormationDto = {
      personId,
      institution: 'MIT',
      degree: Object.values(DegreeType)[0],
      fieldOfStudy: 'Computer Science',
      startDate: new Date('2010-01-01'),
      endDate: new Date('2014-01-01'),
      isCompleted: true,
      grade: null,
    };

    it('addEducation persists the formation and returns the person', async () => {
      repository.findOne.mockResolvedValue(mockPerson);

      await expect(service.addEducation(personId, dto)).resolves.toBe(mockPerson);
      expect(formationRepository.create).toHaveBeenCalledWith(dto);
    });

    it('addEducation throws NotFoundException without creating when the person is missing', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.addEducation('missing', dto)).rejects.toThrow(NotFoundException);
      expect(formationRepository.create).not.toHaveBeenCalled();
    });

    it('removeEducation deletes the formation and returns the person', async () => {
      repository.findOne.mockResolvedValue(mockPerson);

      await expect(service.removeEducation(personId, 'edu-1')).resolves.toBe(mockPerson);
      expect(formationRepository.delete).toHaveBeenCalledWith('edu-1');
    });

    it('removeEducation throws NotFoundException without deleting when the person is missing', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.removeEducation('missing', 'edu-1')).rejects.toThrow(NotFoundException);
      expect(formationRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('findMatchingVacancies', () => {
    it('delegates to the matching service with score and limit', async () => {
      const matches = [{ vacancyId: 'v1' }] as never;
      repository.findOne.mockResolvedValue(mockPerson);
      matchingService.findMatchesForPerson.mockResolvedValue(matches);

      await expect(service.findMatchingVacancies(personId, 70, 5)).resolves.toBe(matches);
      expect(matchingService.findMatchesForPerson).toHaveBeenCalledWith(personId, 70, 5);
    });

    it('throws NotFoundException without matching when the person is missing', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findMatchingVacancies('missing')).rejects.toThrow(NotFoundException);
      expect(matchingService.findMatchesForPerson).not.toHaveBeenCalled();
    });
  });
});
