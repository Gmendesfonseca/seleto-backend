import { faker } from '@faker-js/faker';
import { FactoryGirl } from 'factory-girl-ts';
import { Application } from 'src/domain/applications/application.model';
import { ApplicationStatus } from 'src/domain/applications/interfaces/application.interface';

export function defineApplicationFactory(factory: typeof FactoryGirl) {
  return factory.define(Application, () => ({
    id: faker.string.uuid(),
    applicant_id: faker.string.uuid(),
    vacancy_id: faker.string.uuid(),
    resume: faker.system.filePath(),
    cover_letter: faker.lorem.paragraphs(3),
    status: faker.helpers.enumValue(ApplicationStatus),
  }));
}
