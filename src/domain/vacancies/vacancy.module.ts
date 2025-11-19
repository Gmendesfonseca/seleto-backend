import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Vacancy } from './vacancy.model';
import { VacancyController } from './vacancy.controller';
import { VacancyService } from './vacancy.service';
import { VacancySequelizeRepository } from './repositories/vacancy.sequelize.repository';
import { VacancyRepository } from './repositories/vacancy.repository.interface';
import { VacancyServiceInterface } from './interfaces/vacancy.service.interface';

@Module({
  imports: [SequelizeModule.forFeature([Vacancy])],
  controllers: [VacancyController],
  providers: [
    {
      provide: VacancyRepository,
      useClass: VacancySequelizeRepository,
    },
    {
      provide: VacancyServiceInterface,
      useClass: VacancyService,
    },
  ],
  exports: [
    {
      provide: VacancyServiceInterface,
      useClass: VacancyService,
    },
  ],
})
export class VacancyModule {}
