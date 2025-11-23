import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Person } from './person.model';
import { PersonController } from './person.controller';
import { PersonService } from './person.service';
import { PersonSequelizeRepository } from './repositories/person.sequelize.repository';
import { PersonRepository } from './interfaces/person.repository.interface';
import { PersonServiceInterface } from './interfaces/person.service.interface';
import { MatchingModule } from '../matching/matching.module';
import { PersonCompetenceRepository } from './interfaces/person-competence.repository.interface';
import { PersonExperienceRepository } from './interfaces/person-experience.repository.interface';
import { PersonFormationRepository } from './interfaces/person-formation.repository.interface';
import { PersonExperienceSequelizeRepository } from './repositories/person-experience.sequelize.repository';
import { PersonFormationSequelizeRepository } from './repositories/person-formation.sequelize.repository';
import { PersonCompetenceSequelizeRepository } from './repositories/person-competence.sequelize.repository';
import { PersonFormation } from './person-formation.model';
import { PersonCompetence } from './person-competence.model';
import { PersonExperience } from './person-experience.model';

@Module({
  imports: [
    SequelizeModule.forFeature([Person, PersonCompetence, PersonExperience, PersonFormation]),
    MatchingModule,
  ],
  controllers: [PersonController],
  providers: [
    {
      provide: PersonRepository,
      useClass: PersonSequelizeRepository,
    },
    {
      provide: PersonServiceInterface,
      useClass: PersonService,
    },
    {
      provide: PersonCompetenceRepository,
      useClass: PersonCompetenceSequelizeRepository,
    },
    {
      provide: PersonExperienceRepository,
      useClass: PersonExperienceSequelizeRepository,
    },
    {
      provide: PersonFormationRepository,
      useClass: PersonFormationSequelizeRepository,
    },
  ],
  exports: [
    {
      provide: PersonRepository,
      useClass: PersonSequelizeRepository,
    },
    {
      provide: PersonServiceInterface,
      useClass: PersonService,
    },
    SequelizeModule,
  ],
})
export class PersonModule {}
