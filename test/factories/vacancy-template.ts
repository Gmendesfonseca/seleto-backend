import { faker } from '@faker-js/faker';
import { FactoryGirl } from 'factory-girl-ts';
import { VacancyTemplate } from 'src/domain/templates/vacancy-template.model';

export function defineVacancyTemplateFactory(factory: typeof FactoryGirl) {
  return factory.define(VacancyTemplate, () => ({
    id: faker.string.uuid(),
    name: faker.lorem.words(3) + ' Template',
    company_id: faker.string.uuid(),
  }));
}
