import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PersonServiceImpl } from './person.service';
import { PersonRepository } from './repositories/person.repository.interface';
import { Person, PersonFilters, Address } from './interfaces/person.interface';
import {
  CreatePersonDto,
  UpdatePersonDto,
  AddCompetenceDto,
  AddWorkExperienceDto,
  AddEducationDto,
} from './dto/person.dto';

describe('PersonService', () => {
  let service: PersonServiceImpl;
  let repository: jest.Mocked<PersonRepository>;

  const mockAddress: Address = {
    street: '123 Main St',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    country: 'USA',
  };

  const mockPerson: Person = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    userId: '550e8400-e29b-41d4-a716-446655440001',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1234567890',
    dateOfBirth: new Date('1990-01-01'),
    address: mockAddress,
    bio: 'Software Developer',
    profilePicture: 'https://example.com/avatar.jpg',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  };

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findByUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PersonServiceImpl,
        {
          provide: PersonRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<PersonServiceImpl>(PersonServiceImpl);
    repository = module.get(PersonRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(PersonServiceImpl);
  });

  describe('create', () => {
    it('should successfully create a person', async () => {
      // Arrange
      const createPersonDto: CreatePersonDto = {
        userId: mockPerson.userId,
        firstName: mockPerson.firstName,
        lastName: mockPerson.lastName,
        email: mockPerson.email,
      };

      repository.create.mockResolvedValue(mockPerson);

      // Act
      const result = await service.create(createPersonDto);

      // Assert
      expect(repository.create).toHaveBeenCalledWith(createPersonDto);
      expect(result).toEqual(mockPerson);
    });

    it('should handle repository errors', async () => {
      // Arrange
      const createPersonDto: CreatePersonDto = {
        userId: mockPerson.userId,
        firstName: mockPerson.firstName,
        lastName: mockPerson.lastName,
        email: mockPerson.email,
      };

      repository.create.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.create(createPersonDto)).rejects.toThrow('Database error');
      expect(repository.create).toHaveBeenCalledWith(createPersonDto);
    });
  });

  describe('findAll', () => {
    it('should return all persons without filters', async () => {
      // Arrange
      const persons = [mockPerson];
      repository.findAll.mockResolvedValue(persons);

      // Act
      const result = await service.findAll();

      // Assert
      expect(repository.findAll).toHaveBeenCalledWith(undefined);
      expect(result).toEqual(persons);
    });

    it('should return filtered persons', async () => {
      // Arrange
      const filters: PersonFilters = { firstName: 'John', location: 'New York' };
      const persons = [mockPerson];
      repository.findAll.mockResolvedValue(persons);

      // Act
      const result = await service.findAll(filters);

      // Assert
      expect(repository.findAll).toHaveBeenCalledWith(filters);
      expect(result).toEqual(persons);
    });

    it('should handle empty results', async () => {
      // Arrange
      repository.findAll.mockResolvedValue([]);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toEqual([]);
    });

    it('should handle repository errors', async () => {
      // Arrange
      repository.findAll.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.findAll()).rejects.toThrow('Database error');
    });
  });

  describe('findOne', () => {
    it('should return person when found', async () => {
      // Arrange
      const personId = mockPerson.id;
      repository.findOne.mockResolvedValue(mockPerson);

      // Act
      const result = await service.findOne(personId);

      // Assert
      expect(repository.findOne).toHaveBeenCalledWith(personId);
      expect(result).toEqual(mockPerson);
    });

    it('should return null when person not found', async () => {
      // Arrange
      const personId = 'non-existent-id';
      repository.findOne.mockResolvedValue(null);

      // Act
      const result = await service.findOne(personId);

      // Assert
      expect(repository.findOne).toHaveBeenCalledWith(personId);
      expect(result).toBeNull();
    });

    it('should handle repository errors', async () => {
      // Arrange
      const personId = mockPerson.id;
      repository.findOne.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.findOne(personId)).rejects.toThrow('Database error');
    });
  });

  describe('update', () => {
    it('should successfully update a person', async () => {
      // Arrange
      const personId = mockPerson.id;
      const updatePersonDto: UpdatePersonDto = {
        firstName: 'Jane',
        lastName: 'Smith',
        phone: '+0987654321',
      };

      const updatedPerson = {
        ...mockPerson,
        ...updatePersonDto,
        updatedAt: new Date('2023-01-02'),
      };

      repository.findOne.mockResolvedValue(mockPerson);
      repository.update.mockResolvedValue(updatedPerson);

      // Act
      const result = await service.update(personId, updatePersonDto);

      // Assert
      expect(repository.findOne).toHaveBeenCalledWith(personId);
      expect(repository.update).toHaveBeenCalledWith(personId, updatePersonDto);
      expect(result).toEqual(updatedPerson);
    });

    it('should throw NotFoundException when person not found', async () => {
      // Arrange
      const personId = 'non-existent-id';
      const updatePersonDto: UpdatePersonDto = {
        firstName: 'Jane',
      };

      repository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.update(personId, updatePersonDto)).rejects.toThrow(
        new NotFoundException(`Person with id ${personId} not found`),
      );
      expect(repository.findOne).toHaveBeenCalledWith(personId);
      expect(repository.update).not.toHaveBeenCalled();
    });

    it('should handle repository errors', async () => {
      // Arrange
      const personId = mockPerson.id;
      const updatePersonDto: UpdatePersonDto = {
        firstName: 'Jane',
      };

      repository.findOne.mockResolvedValue(mockPerson);
      repository.update.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.update(personId, updatePersonDto)).rejects.toThrow('Database error');
    });
  });

  describe('remove', () => {
    it('should successfully remove a person', async () => {
      // Arrange
      const personId = mockPerson.id;
      repository.findOne.mockResolvedValue(mockPerson);
      repository.delete.mockResolvedValue(undefined);

      // Act
      await service.remove(personId);

      // Assert
      expect(repository.findOne).toHaveBeenCalledWith(personId);
      expect(repository.delete).toHaveBeenCalledWith(personId);
    });

    it('should throw NotFoundException when person not found', async () => {
      // Arrange
      const personId = 'non-existent-id';
      repository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.remove(personId)).rejects.toThrow(
        new NotFoundException(`Person with id ${personId} not found`),
      );
      expect(repository.findOne).toHaveBeenCalledWith(personId);
      expect(repository.delete).not.toHaveBeenCalled();
    });

    it('should handle repository errors', async () => {
      // Arrange
      const personId = mockPerson.id;
      repository.findOne.mockResolvedValue(mockPerson);
      repository.delete.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.remove(personId)).rejects.toThrow('Database error');
    });
  });

  describe('findByUser', () => {
    it('should return person when found by user ID', async () => {
      // Arrange
      const userId = mockPerson.userId;
      repository.findByUser.mockResolvedValue(mockPerson);

      // Act
      const result = await service.findByUser(userId);

      // Assert
      expect(repository.findByUser).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockPerson);
    });

    it('should return null when person not found by user ID', async () => {
      // Arrange
      const userId = 'non-existent-user-id';
      repository.findByUser.mockResolvedValue(null);

      // Act
      const result = await service.findByUser(userId);

      // Assert
      expect(repository.findByUser).toHaveBeenCalledWith(userId);
      expect(result).toBeNull();
    });

    it('should handle repository errors', async () => {
      // Arrange
      const userId = mockPerson.userId;
      repository.findByUser.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.findByUser(userId)).rejects.toThrow('Database error');
    });
  });

  describe('addCompetence', () => {
    it('should return person (placeholder implementation)', async () => {
      // Arrange
      const personId = mockPerson.id;
      const addCompetenceDto: AddCompetenceDto = {
        competenceId: '550e8400-e29b-41d4-a716-446655440002',
        level: 'Advanced',
      };

      repository.findOne.mockResolvedValue(mockPerson);

      // Act
      const result = await service.addCompetence(personId, addCompetenceDto);

      // Assert
      expect(repository.findOne).toHaveBeenCalledWith(personId);
      expect(result).toEqual(mockPerson);
    });

    it('should throw NotFoundException when person not found', async () => {
      // Arrange
      const personId = 'non-existent-id';
      const addCompetenceDto: AddCompetenceDto = {
        competenceId: '550e8400-e29b-41d4-a716-446655440002',
        level: 'Advanced',
      };

      repository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.addCompetence(personId, addCompetenceDto)).rejects.toThrow(
        new NotFoundException(`Person with id ${personId} not found`),
      );
    });
  });

  describe('removeCompetence', () => {
    it('should return person (placeholder implementation)', async () => {
      // Arrange
      const personId = mockPerson.id;
      const competenceId = '550e8400-e29b-41d4-a716-446655440002';

      repository.findOne.mockResolvedValue(mockPerson);

      // Act
      const result = await service.removeCompetence(personId, competenceId);

      // Assert
      expect(repository.findOne).toHaveBeenCalledWith(personId);
      expect(result).toEqual(mockPerson);
    });

    it('should throw NotFoundException when person not found', async () => {
      // Arrange
      const personId = 'non-existent-id';
      const competenceId = '550e8400-e29b-41d4-a716-446655440002';

      repository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.removeCompetence(personId, competenceId)).rejects.toThrow(
        new NotFoundException(`Person with id ${personId} not found`),
      );
    });
  });

  describe('addWorkExperience', () => {
    it('should return person (placeholder implementation)', async () => {
      // Arrange
      const personId = mockPerson.id;
      const addWorkExperienceDto: AddWorkExperienceDto = {
        company: 'Tech Corp',
        position: 'Software Developer',
        startDate: new Date('2020-01-01'),
        endDate: new Date('2023-01-01'),
        description: 'Developed web applications',
        isCurrent: false,
      };

      repository.findOne.mockResolvedValue(mockPerson);

      // Act
      const result = await service.addWorkExperience(personId, addWorkExperienceDto);

      // Assert
      expect(repository.findOne).toHaveBeenCalledWith(personId);
      expect(result).toEqual(mockPerson);
    });

    it('should throw NotFoundException when person not found', async () => {
      // Arrange
      const personId = 'non-existent-id';
      const addWorkExperienceDto: AddWorkExperienceDto = {
        company: 'Tech Corp',
        position: 'Software Developer',
        startDate: new Date('2020-01-01'),
        endDate: new Date('2023-01-01'),
        description: 'Developed web applications',
        isCurrent: false,
      };

      repository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.addWorkExperience(personId, addWorkExperienceDto)).rejects.toThrow(
        new NotFoundException(`Person with id ${personId} not found`),
      );
    });
  });

  describe('removeWorkExperience', () => {
    it('should return person (placeholder implementation)', async () => {
      // Arrange
      const personId = mockPerson.id;
      const experienceId = '550e8400-e29b-41d4-a716-446655440003';

      repository.findOne.mockResolvedValue(mockPerson);

      // Act
      const result = await service.removeWorkExperience(personId, experienceId);

      // Assert
      expect(repository.findOne).toHaveBeenCalledWith(personId);
      expect(result).toEqual(mockPerson);
    });

    it('should throw NotFoundException when person not found', async () => {
      // Arrange
      const personId = 'non-existent-id';
      const experienceId = '550e8400-e29b-41d4-a716-446655440003';

      repository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.removeWorkExperience(personId, experienceId)).rejects.toThrow(
        new NotFoundException(`Person with id ${personId} not found`),
      );
    });
  });

  describe('addEducation', () => {
    it('should return person (placeholder implementation)', async () => {
      // Arrange
      const personId = mockPerson.id;
      const addEducationDto: AddEducationDto = {
        institution: 'University of Technology',
        degree: 'Bachelor of Computer Science',
        fieldOfStudy: 'Computer Science',
        startDate: new Date('2016-09-01'),
        endDate: new Date('2020-06-01'),
        isCurrent: false,
      };

      repository.findOne.mockResolvedValue(mockPerson);

      // Act
      const result = await service.addEducation(personId, addEducationDto);

      // Assert
      expect(repository.findOne).toHaveBeenCalledWith(personId);
      expect(result).toEqual(mockPerson);
    });

    it('should throw NotFoundException when person not found', async () => {
      // Arrange
      const personId = 'non-existent-id';
      const addEducationDto: AddEducationDto = {
        institution: 'University of Technology',
        degree: 'Bachelor of Computer Science',
        fieldOfStudy: 'Computer Science',
        startDate: new Date('2016-09-01'),
        endDate: new Date('2020-06-01'),
        isCurrent: false,
      };

      repository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.addEducation(personId, addEducationDto)).rejects.toThrow(
        new NotFoundException(`Person with id ${personId} not found`),
      );
    });
  });

  describe('removeEducation', () => {
    it('should return person (placeholder implementation)', async () => {
      // Arrange
      const personId = mockPerson.id;
      const educationId = '550e8400-e29b-41d4-a716-446655440004';

      repository.findOne.mockResolvedValue(mockPerson);

      // Act
      const result = await service.removeEducation(personId, educationId);

      // Assert
      expect(repository.findOne).toHaveBeenCalledWith(personId);
      expect(result).toEqual(mockPerson);
    });

    it('should throw NotFoundException when person not found', async () => {
      // Arrange
      const personId = 'non-existent-id';
      const educationId = '550e8400-e29b-41d4-a716-446655440004';

      repository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.removeEducation(personId, educationId)).rejects.toThrow(
        new NotFoundException(`Person with id ${personId} not found`),
      );
    });
  });
});
