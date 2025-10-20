import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { DashboardSequelizeRepository } from './repositories/dashboard.sequelize.repository';
import { DashboardRepository } from './repositories/dashboard.repository.interface';
import { DashboardServiceInterface } from './interfaces/dashboard.service.interface';
import { Application } from '../applications/application.model';
import { Vacancy } from '../vacancies/vacancy.model';
import { Company, User } from '../users/user.model';

@Module({
  imports: [SequelizeModule.forFeature([Application, Vacancy, Company, User])],
  controllers: [DashboardController],
  providers: [
    {
      provide: DashboardRepository,
      useClass: DashboardSequelizeRepository,
    },
    {
      provide: DashboardServiceInterface,
      useClass: DashboardService,
    },
  ],
  exports: [DashboardServiceInterface],
})
export class DashboardModule {}
