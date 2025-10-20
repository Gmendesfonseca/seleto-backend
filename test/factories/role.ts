import { faker } from '@faker-js/faker';
import { FactoryGirl } from 'factory-girl-ts';
import { Role } from 'src/domain/roles/role.model';

export function defineRoleFactory(factory: typeof FactoryGirl) {
  return factory.define(Role, () => ({
    id: faker.string.uuid(),
    name: faker.person.jobType(),
    description: faker.lorem.sentence(),
    is_system: faker.datatype.boolean(),
    company_id: faker.string.uuid(),
  }));
}
