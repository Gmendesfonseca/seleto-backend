import { faker } from '@faker-js/faker';
import { FactoryGirl } from 'factory-girl-ts';
import { User } from 'src/domain/users/user.model';

export function defineUserFactory(factory: typeof FactoryGirl) {
  return factory.define(User, () => ({
    id: faker.string.uuid(),
    password: faker.internet.password(),
    isVerified: faker.datatype.boolean(),
    username: faker.internet.username({ firstName: 'incicle' }),
    email: faker.internet.email({ firstName: 'incicle' }),
    status: 'ACTIVE',
    type: faker.helpers.arrayElement(['PERSON', 'COMPANY']),
  }));
}
