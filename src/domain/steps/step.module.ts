import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Step } from './step.model';

@Module({
  imports: [SequelizeModule.forFeature([Step])],
})
export class StepModule {}
