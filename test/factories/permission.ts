import { faker } from '@faker-js/faker';
import { FactoryGirl } from 'factory-girl-ts';
import { Permission } from 'src/domain/permissions/permission.model';

export function definePermissionFactory(factory: typeof FactoryGirl) {
  return factory.define(Permission, () => ({
    id: faker.string.uuid(),
    name:
      faker.helpers.arrayElement(['create', 'read', 'update', 'delete']) + '_' + faker.lorem.word(),
    description: faker.lorem.sentence(),
    module: faker.helpers.arrayElement([
      'users',
      'companies',
      'roles',
      'vacancies',
      'applications',
    ]),
  }));
}
