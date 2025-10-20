import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CompetenceController } from './competence.controller';
import { Competence } from './competence.model';

@Module({
  imports: [SequelizeModule.forFeature([Competence])],
  controllers: [CompetenceController],
})
export class CompetenceModule {}
