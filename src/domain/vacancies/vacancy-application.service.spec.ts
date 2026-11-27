import { NotFoundException } from '@nestjs/common';
import { VacancyApplicationService } from './vacancy-application.service';
import { VacancyRepository } from './interfaces/vacancy.repository.interface';
import { ApplicationServiceInterface } from '../applications/interfaces/application.service.interface';

describe('VacancyApplicationService', () => {
  const vacancyId = 'v-1';
  const companyId = 'company-1';
  const page = { data: [], meta: { currentPage: 1, lastPage: 1, perPage: 0, total: 0 } };
  let vacancies: { findOne: jest.Mock };
  let applications: { findAll: jest.Mock; count: jest.Mock };
  let service: VacancyApplicationService;

  beforeEach(() => {
    vacancies = { findOne: jest.fn() };
    applications = { findAll: jest.fn().mockResolvedValue(page), count: jest.fn() };
    service = new VacancyApplicationService(
      vacancies as unknown as VacancyRepository,
      applications as unknown as ApplicationServiceInterface,
    );
  });

  it('lists the applications of a vacancy owned by the company', async () => {
    vacancies.findOne.mockResolvedValue({ id: vacancyId, company_id: companyId });

    await expect(service.list(vacancyId, companyId)).resolves.toBe(page);
    expect(applications.findAll).toHaveBeenCalledWith({ vacancyId });
  });

  it('counts the applications for the stats', async () => {
    vacancies.findOne.mockResolvedValue({ id: vacancyId, company_id: companyId });
    applications.count.mockResolvedValue(7);

    await expect(service.stats(vacancyId, companyId)).resolves.toEqual({ totalApplications: 7 });
    expect(applications.count).toHaveBeenCalledWith({ vacancyId });
  });

  it.each([
    ['another company', { id: vacancyId, company_id: 'company-2' }, companyId],
    ['a missing vacancy', null, companyId],
    ['a token without company', { id: vacancyId, company_id: companyId }, null],
  ])('answers 404 for %s without reading applications', async (_case, vacancy, company) => {
    vacancies.findOne.mockResolvedValue(vacancy);

    await expect(service.list(vacancyId, company)).rejects.toThrow(NotFoundException);
    await expect(service.stats(vacancyId, company)).rejects.toThrow(NotFoundException);
    expect(applications.findAll).not.toHaveBeenCalled();
    expect(applications.count).not.toHaveBeenCalled();
  });
});
