import { NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { RequirementPriority } from '../competences/vacancy-competence-requirement.model';
import { VacancyCompetenceRequirementService } from './vacancy-competence-requirement.service';

describe('VacancyCompetenceRequirementService', () => {
  const vacancyId = '7d0f3f5e-1a7b-4c4e-9a43-2a1f7a0f0001';
  const companyId = 'c0ffee00-1a7b-4c4e-9a43-2a1f7a0f0002';
  const competenceId = '5e1ec7ed-1a7b-4c4e-9a43-2a1f7a0f0003';

  const storedRow = {
    id: 'r1',
    competence_id: competenceId,
    competence: { name: 'TypeScript' },
    priority: RequirementPriority.REQUIRED,
    minimum_years_experience: 3,
    weight: 60,
  };

  let vacancies: { findOne: jest.Mock };
  let requirements: {
    findByVacancy: jest.Mock;
    findMissingCompetenceIds: jest.Mock;
    replaceForVacancy: jest.Mock;
  };
  let service: VacancyCompetenceRequirementService;

  beforeEach(() => {
    vacancies = { findOne: jest.fn().mockResolvedValue({ id: vacancyId, company_id: companyId }) };
    requirements = {
      findByVacancy: jest.fn().mockResolvedValue([storedRow]),
      findMissingCompetenceIds: jest.fn().mockResolvedValue([]),
      replaceForVacancy: jest.fn().mockResolvedValue([storedRow]),
    };
    service = new VacancyCompetenceRequirementService(vacancies as never, requirements as never);
  });

  const body = {
    requirements: [
      {
        competenceId,
        priority: RequirementPriority.REQUIRED,
        minimumYearsExperience: 3,
        weight: 60,
      },
    ],
  };

  it('lists the requirements of a vacancy owned by the company', async () => {
    await expect(service.list(vacancyId, companyId)).resolves.toEqual([
      {
        id: 'r1',
        competenceId,
        competenceName: 'TypeScript',
        priority: RequirementPriority.REQUIRED,
        minimumYearsExperience: 3,
        weight: 60,
      },
    ]);
  });

  it('answers 404 for a vacancy of another company and never touches its requirements', async () => {
    await expect(service.list(vacancyId, 'another-company')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    await expect(service.replace(vacancyId, 'another-company', body)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(requirements.findByVacancy).not.toHaveBeenCalled();
    expect(requirements.replaceForVacancy).not.toHaveBeenCalled();
  });

  it('answers 404 when the caller has no company', async () => {
    await expect(service.list(vacancyId, null)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('answers 404 when the vacancy does not exist', async () => {
    vacancies.findOne.mockResolvedValue(null);
    await expect(service.list(vacancyId, companyId)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('replaces the whole set with the given requirements', async () => {
    await service.replace(vacancyId, companyId, body);
    expect(requirements.replaceForVacancy).toHaveBeenCalledWith(vacancyId, body.requirements);
  });

  it('rejects the same competence twice with 422', async () => {
    const duplicated = { requirements: [body.requirements[0], body.requirements[0]] };
    await expect(service.replace(vacancyId, companyId, duplicated)).rejects.toBeInstanceOf(
      UnprocessableEntityException,
    );
    expect(requirements.replaceForVacancy).not.toHaveBeenCalled();
  });

  it('rejects unknown competences with 422 and names them', async () => {
    requirements.findMissingCompetenceIds.mockResolvedValue([competenceId]);
    await expect(service.replace(vacancyId, companyId, body)).rejects.toThrow(competenceId);
    expect(requirements.replaceForVacancy).not.toHaveBeenCalled();
  });
});
