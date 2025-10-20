import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Person } from '../users/user.model';
import { PersonController } from './person.controller';
import { PersonServiceImpl } from './person.service';
import { PersonSequelizeRepository } from './repositories/person.sequelize.repository';
import { PersonRepository } from './repositories/person.repository.interface';
import { PersonService } from './interfaces/person.service.interface';

@Module({
  imports: [SequelizeModule.forFeature([Person])],
  controllers: [PersonController],
  providers: [
    {
      provide: PersonRepository,
      useClass: PersonSequelizeRepository,
    },
    {
      provide: PersonService,
      useClass: PersonServiceImpl,
    },
  ],
  exports: [PersonService],
})
export class PersonModule {}
