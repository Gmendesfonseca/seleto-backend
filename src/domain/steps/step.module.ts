import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Step } from './step.model';
import { StepController } from './step.controller';
import { StepServiceImpl } from './step.service';
import { StepSequelizeRepository } from './repositories/step.sequelize.repository';
import { StepRepository } from './repositories/step.repository.interface';
import { StepService } from './interfaces/step.service.interface';

@Module({
  imports: [SequelizeModule.forFeature([Step])],
  controllers: [StepController],
  providers: [
    {
      provide: StepRepository,
      useClass: StepSequelizeRepository,
    },
    {
      provide: StepService,
      useClass: StepServiceImpl,
    },
  ],
  exports: [
    StepService,
    {
      provide: StepRepository,
      useClass: StepSequelizeRepository,
    },
  ],
})
export class StepModule {}
