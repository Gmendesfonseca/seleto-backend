import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Person } from './person.model';
import { PersonController } from './person.controller';
import { PersonService } from './person.service';
import { PersonSequelizeRepository } from './repositories/person.sequelize.repository';
import { PersonRepository } from './repositories/person.repository.interface';
import { PersonServiceInterface } from './interfaces/person.service.interface';
import { MatchingModule } from '../matching/matching.module';

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
  ],
  exports: [PersonServiceInterface, PersonRepository, SequelizeModule],
})
export class PersonModule {}
