import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ApplicationController } from './application.controller';
import { Application } from './application.model';

@Module({
  imports: [SequelizeModule.forFeature([Application])],
  controllers: [ApplicationController],
})
export class ApplicationModule {}
