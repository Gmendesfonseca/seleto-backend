import { faker } from '@faker-js/faker';
import { FactoryGirl } from 'factory-girl-ts';
import { Competence } from 'src/domain/competences/competence.model';

export function defineCompetenceFactory(factory: typeof FactoryGirl) {
  return factory.define(Competence, () => ({
    id: faker.string.uuid(),
    name: faker.person.jobDescriptor(),
    description: faker.lorem.sentence(),
    company_id: faker.string.uuid(),
  }));
}
