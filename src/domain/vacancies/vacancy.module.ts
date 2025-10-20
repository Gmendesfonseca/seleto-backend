import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Vacancy } from './vacancy.model';
import { VacancyController } from './vacancy.controller';
import { VacancyServiceImpl } from './vacancy.service';
import { VacancySequelizeRepository } from './repositories/vacancy.sequelize.repository';
import { VacancyRepository } from './repositories/vacancy.repository.interface';
import { VacancyService } from './interfaces/vacancy.service.interface';

@Module({
  imports: [SequelizeModule.forFeature([Vacancy])],
  controllers: [VacancyController],
  providers: [
    {
      provide: VacancyRepository,
      useClass: VacancySequelizeRepository,
    },
    {
      provide: VacancyService,
      useClass: VacancyServiceImpl,
    },
  ],
  exports: [VacancyService],
})
export class VacancyModule {}
