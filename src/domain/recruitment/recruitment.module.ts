import { Module } from '@nestjs/common';
import { RecruitmentController, ActivitiesController } from './recruitment.controller';
import { RecruitmentService } from './recruitment.service';
import { RecruitmentServiceInterface } from './interfaces/recruitment.service.interface';

@Module({
  controllers: [RecruitmentController, ActivitiesController],
  providers: [
    {
      provide: RecruitmentServiceInterface,
      useClass: RecruitmentService,
    },
  ],
  exports: [RecruitmentServiceInterface],
})
export class RecruitmentModule {}
