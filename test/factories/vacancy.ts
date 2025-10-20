import { faker } from '@faker-js/faker';
import { FactoryGirl } from 'factory-girl-ts';
import { Vacancy, VacancyStatus } from 'src/domain/vacancies/vacancy.model';

export function defineVacancyFactory(factory: typeof FactoryGirl) {
  return factory.define(Vacancy, () => ({
    id: faker.string.uuid(),
    title: faker.person.jobTitle(),
    description: faker.lorem.paragraphs(2),
    status: faker.helpers.enumValue(VacancyStatus),
    area: faker.person.jobArea(),
    company_id: faker.string.uuid(),
  }));
}
