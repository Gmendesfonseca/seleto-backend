import { faker } from '@faker-js/faker';
import { FactoryGirl } from 'factory-girl-ts';
import { Step } from 'src/domain/steps/step.model';

export function defineStepFactory(factory: typeof FactoryGirl) {
  return factory.define(Step, () => ({
    id: faker.string.uuid(),
    name: faker.lorem.words(2),
    description: faker.lorem.sentence(),
    company_id: faker.string.uuid(),
  }));
}
