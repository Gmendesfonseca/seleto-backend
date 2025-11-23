import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ApplicationController, ApplicantController } from './application.controller';
import { Application } from './application.model';
import { ApplicationService } from './application.service';
import { ApplicationSequelizeRepository } from './repositories/application.sequelize.repository';
import { ApplicationRepository } from './repositories/application.repository.interface';
import { ApplicationServiceInterface } from './interfaces/application.service.interface';
import { MatchingModule } from '../matching/matching.module';

@Module({
  imports: [SequelizeModule.forFeature([Application]), MatchingModule],
  controllers: [ApplicationController, ApplicantController],
  providers: [
    {
      provide: ApplicationRepository,
      useClass: ApplicationSequelizeRepository,
    },
    {
      provide: ApplicationServiceInterface,
      useClass: ApplicationService,
    },
  ],
  exports: [ApplicationServiceInterface],
})
export class ApplicationModule {}
