import { faker } from '@faker-js/faker';
import { FactoryGirl } from 'factory-girl-ts';
import { Person } from 'src/domain/users/user.model';

export function definePersonFactory(factory: typeof FactoryGirl) {
  return factory.define(Person, () => ({
    name: faker.person.fullName(),
    avatar: faker.image.avatar(),
  }));
}
