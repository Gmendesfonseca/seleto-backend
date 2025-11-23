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

@Module({
  imports: [SequelizeModule.forFeature([Person]), MatchingModule],
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
      useClass: PersonSequelizeRepository,
    },
    {
      provide: PersonExperienceRepository,
      useClass: PersonSequelizeRepository,
    },
    {
      provide: PersonFormationRepository,
      useClass: PersonSequelizeRepository,
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
